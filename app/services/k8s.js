import Ember from 'ember';
import { normalizeType } from 'ember-api-store/utils/normalize';
import { applyHeaders } from 'ember-api-store/utils/apply-headers';
import ApiError from 'ember-api-store/models/error';

const BASE = 'api/v1';
const TYPE_PREFIX = 'k8s-';
const ID_SEPARATOR = '::';

function addId(obj) {
  if ( obj && obj.metadata )
  {
    if ( obj.metadata.namespace && obj.metadata.name )
    {
      obj.id = `${obj.metadata.namespace}${ID_SEPARATOR}${obj.metadata.name}`;
    }
    else if ( obj.metadata.name )
    {
      obj.id = obj.metadata.name;
    }
  }

  return obj;
}

function splitId(objOrStr) {
  var id = (typeof objOrStr === 'object' ? objOrStr.get('id') : objOrStr||'');
  var idx = id.indexOf(ID_SEPARATOR);
  if ( idx >= 0 )
  {
    return {
      namespace: id.substr(0,idx),
      name:      id.substr(idx+ID_SEPARATOR.length+1),
    };
  }
  else
  {
    return {
      namespace: null,
      name: id
    };
  }
}

function joinId(objOrStr, defaultNs) {
  var parts = splitId(objOrStr);
  return parts.namespace||defaultNs + ID_SEPARATOR + parts.id;
}

export default Ember.Service.extend({
  namespaces: null,
  namespace: null,

  promiseQueue: null,
  init() {
    this._super();
    this.get('store.metaKeys').addObject('metadata');
    this.set('promiseQueue', {});
  },

  // request({ options});
  // or request(method, path[, body][, options map])
  request(methodOrOpt, path, data, moreOpt={}) {
    var self = this;
    var store = this.get('store');
    var opt;

    if ( typeof methodOrOpt === 'object' )
    {
      opt = methodOrOpt;
    }
    else
    {
      opt = moreOpt || {};
      opt.method = methodOrOpt;
      opt.url = this.get('app.kubernetesEndpoint') + path;
      opt.data = data;
    }

    var promise = new Ember.RSVP.Promise(function(resolve,reject) {
      store.rawRequest(opt).then(success, fail);

      function success(obj) {
        var xhr = obj.xhr;

        if ( (xhr.getResponseHeader('content-type')||'').toLowerCase().indexOf('/json') !== -1 )
        {
          var response = self._typeify(JSON.parse(xhr.responseText));
          Object.defineProperty(response, 'xhr', { value: obj.xhr, configurable: true, writable: true});
          Object.defineProperty(response, 'textStatus', { value: obj.textStatus, configurable: true, writable: true});
          resolve(response);
        }
        else
        {
          resolve(xhr.responseText);
        }
      }

      function fail(obj) {
        var response, body;
        var xhr = obj.xhr;
        var err = obj.err;
        var textStatus = obj.textStatus;

        if ( (xhr.getResponseHeader('content-type')||'').toLowerCase().indexOf('/json') !== -1 )
        {
          body = self._typeify(JSON.parse(xhr.responseText));
        }
        else if ( err )
        {
          if ( err === 'timeout' )
          {
            body = {
              code: 'Timeout',
              status: xhr.status,
              message: `API request timeout (${opt.timeout/1000} sec)`,
              detail: (opt.method||'GET') + ' ' + opt.url,
            };
          }
          else
          {
            body = {status: xhr.status, message: err};
          }
        }
        else
        {
          body = {status: xhr.status, message: xhr.responseText};
        }

        if ( ApiError.detectInstance(body) )
        {
          response = body;
        }
        else
        {
          response = ApiError.create(body);
        }

        Object.defineProperty(response, 'xhr', { value: xhr, configurable: true, writable: true});
        Object.defineProperty(response, 'textStatus', { value: textStatus, configurable: true, writable: true});

        reject(response);
      }
    },'Request: '+ opt.url);

    return promise;
  },

  // JSON.parse() will call this for every key and value when parsing a JSON document.
  // It does a recursive descent so the deepest keys are processed first.
  // The value in the output for the key will be the value returned.
  // If no value is returned, the key will not be included in the output.
  _typeify(obj) {
    var self = this;
    var store = this.get('store');
    var output, type;

    // Collection
    if ( obj.kind && obj.kind.slice(-4) === 'List' && obj.items )
    {
      var itemKind = obj.kind.slice(0, -4);
      type = normalizeType(`${TYPE_PREFIX}${itemKind}`);
      obj.items = obj.items.map((item) => {
        item.kind = itemKind;
        item.apiVersion = obj.apiVersion;
        return typeifyResource(item, type);
      });

      output = store.createCollection(obj,'items');
    }
    else
    {
      // Record
      type = normalizeType(`${TYPE_PREFIX}${obj.kind}`);
      output = typeifyResource(obj, type);
    }

    return output;

    function typeifyResource(obj, type) {
      addId(obj);

      var output = store.createRecord(obj, type);
      if (output.metadata.uid)
      {
        var cacheEntry = self.getByUid(type, output.metadata.uid);
        if ( cacheEntry )
        {
          cacheEntry.replaceWith(output);
          return cacheEntry;
        }
        else
        {
          store._add(type, output);
          return output;
        }
      }
      else
      {
        return output;
      }
    }
  },


  isCacheable(opt) {
    // Everything is cacheable?
    var str = `${BASE}/namespaces/`;
    var pos = opt.url.indexOf(str);
    if ( pos >= 0 )
    {
      var rest = opt.url.substr(pos+str.length);
      return rest.indexOf('/') === -1;
    }
    else
    {
      return true;
    }
  },

  find(type, id, opt) {
    var self = this;
    var store = this.get('store');
    type = normalizeType(type);
    opt = opt || {};

    if ( !type )
    {
      return Ember.RSVP.reject(new ApiError('type not specified'));
    }

    // If this is a request for all of the items of [type], then we'll remember that and not ask again for a subsequent request
    var isCacheable = this.isCacheable(opt);
    var isForAll = !id && isCacheable;

    // See if we already have this resource, unless forceReload is on.
    if ( opt.forceReload !== true )
    {
      if ( isForAll && store.get('_foundAll').get(type) )
      {
        return Ember.RSVP.resolve(store.all(type),'Cached find all '+type);
      }
      else if ( isCacheable && id )
      {
        var existing;
        if ( opt.useUid )
        {
          existing = self.getByUid(type, id);
        }
        else
        {
          existing = store.getById(type, id);
        }

        if ( existing )
        {
          return Ember.RSVP.resolve(existing,'Cached find '+type+':'+id);
        }
      }
    }

    if ( opt.url )
    {
      if ( opt.url.substr(0,1) !== '/' )
      {
        opt.url = `${self.get('app.kubernetesEndpoint')}/${BASE}/` + opt.url;
      }

      return findWithUrl(opt.url);
    }
    else
    {
      return Ember.RSVP.reject(new ApiError('k8s find requirs opt.url'));
    }

    function findWithUrl(url) {
      var queue = self.get('promiseQueue');
      var cls = self.get('container').lookup('model:'+type);

      // Headers
      var newHeaders = {};
      if ( cls && cls.constructor.headers )
      {
        applyHeaders(cls.constructor.headers, newHeaders, true);
      }
      applyHeaders(opt.headers, newHeaders, true);

      var later;

      // check to see if the request is in the promiseQueue (promises)
      if ( queue[url] )
      {
        // get the filterd promise object
        later = Ember.RSVP.defer();
        queue[url].push(later);
        later = later.promise;
      }
      else
      {
        // request is not in the promiseQueue
        later = self.request({
          url: url,
          depaginate: opt.depaginate,
          headers: newHeaders,
        }).then((result) => {
          if ( isForAll )
          {
            store.get('_foundAll').set(type,true);
          }

          resolvePromisesInQueue(url, result, 'resolve');
          return result;
        }, (reason) => {
          resolvePromisesInQueue(url, reason, 'reject');
          return Ember.RSVP.reject(reason);
        });

        // set the promises array to empty indicating we've had 1 promise already
        queue[url] = [];
      }

      return later;
    }

    function resolvePromisesInQueue(url, result, action) {
      var queue = self.get('promiseQueue');
      var localPromises = queue[url];

      if ( localPromises && localPromises.length )
      {
        while (localPromises.length )
        {
          var itemToResolve = localPromises.pop();
          itemToResolve[action](result);
        }
      }

      delete queue[url];
    }
  },

  getByUid(type, uid) {
    type = normalizeType(type);
    var group = this.get('store')._group(type);
    return group.filterBy('uid',uid)[0];
  },

  _getCollection(type, resourceName) {
    return this.find(`${TYPE_PREFIX}${type}`, null, {
      url: resourceName
    });
  },

  _getNamespacedResource(type, resourceName, id) {
    var nsId = this.get('namespace.id');
    var withNs = joinId(id, nsId);
    var withoutNs = splitId(withNs).name;

    return this.find(`${TYPE_PREFIX}${type}`, withNs , {
      url: `namespaces/${nsId}/${resourceName}/${withoutNs}`
    });
  },

  getNamespaces() { return this._getCollection('namespace','namespaces'); },
  getNamespace(name) {
    return this.find(`${TYPE_PREFIX}namespace`, name , {
      url: `namespaces/${name}`
    });
  },

  getServices() { return this._getCollection('service','services'); },
  getService(name) { return this._getNamespacedResource('service','services',name); },

  getRCs() { return this._getCollection('replicationcontroller','replicationcontrollers'); },
  getRC(name) { return this._getNamespacedResource('replicationcontroller','replicationcontrollers',name); },

  /*
  _getNamespacedType(type, resourceName) {
    return this.find(`${TYPE_PREFIX}${type}`, null, {
      url: `namespaces/${this.get('namespace.id')}/${resourceName}`
    });
  },

  getNSServices()    { return this._getNamespacedType('service','services'); },
  getNSService(name) { return this._getNamespacedResource('service','services', name); },

  getNSRCs()    { return this._getNamespacedType('replicationcontroller','replicationcontrollers'); },
  getNSRC(name) { return this._getNamespacedResource('replicationcontroller','replicationcontrollers', name); },
  */
});
