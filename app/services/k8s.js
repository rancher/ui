import Ember from 'ember';
import { normalizeType } from 'ember-api-store/utils/normalize';
import { applyHeaders } from 'ember-api-store/utils/apply-headers';
import ApiError from 'ember-api-store/models/error';
import C from 'ui/utils/constants';

const { getOwner } = Ember;

function splitId(objOrStr, defaultNs) {
  var id = (typeof objOrStr === 'object' ? objOrStr.get('id') : objOrStr||'');
  var idx = id.indexOf(C.K8S.ID_SEPARATOR);
  if ( idx >= 0 )
  {
    return {
      namespace: id.substr(0,idx),
      name:      id.substr(idx+C.K8S.ID_SEPARATOR.length),
    };
  }
  else
  {
    return {
      namespace: defaultNs || null,
      name: id
    };
  }
}

function joinId(objOrStr, defaultNs) {
  var parts = splitId(objOrStr);
  return parts.namespace||defaultNs + C.K8S.ID_SEPARATOR + parts.name;
}

export function containerStateInator(state) {
  var label = '???';
  var message = '';
  var date = null;
  var datePrefix = '';

  if ( state.running )
  {
    label = 'Running';
    if ( state.running.startedAt )
    {
      date = new Date(state.running.startedAt);
      datePrefix = 'Since ';
    }
  }
  else if ( state.waiting )
  {
    label = 'Waiting';
    if ( state.waiting.message )
    {
      message = state.waiting.message;
    }
  }
  else if ( state.terminated )
  {
    label = 'Terminated (' + state.terminated.exitCode + ')';

    if ( state.terminated.message )
    {
      message = state.terminated.message;
    }

    if ( state.terminated.finishedAt )
    {
      date = new Date(state.terminated.finishedAt);
    }
  }

  return {
    state: label,
    message: message,
    date: date,
    datePrefix: datePrefix,
  };
}

export default Ember.Service.extend({
  'tab-session': Ember.inject.service('tab-session'),

  namespaces: null,
  services: null,
  rcs: null,
  pods: null,
  containers: null,

  // The current namespace
  namespace: null,

  kubernetesEndpoint: function() {
    return this.get('app.kubernetesEndpoint').replace(this.get('app.projectToken'), this.get(`tab-session.${C.TABSESSION.PROJECT}`));
  }.property(`tab-session.${C.TABSESSION.PROJECT}`,'app.kubernetesEndpoint'),

  kubectlEndpoint: function() {
    return this.get('app.kubectlEndpoint').replace(this.get('app.projectToken'), this.get(`tab-session.${C.TABSESSION.PROJECT}`));
  }.property(`tab-session.${C.TABSESSION.PROJECT}`,'app.kubectlEndpoint'),


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
      opt.url = path;
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
      type = normalizeType(`${C.K8S.TYPE_PREFIX}${itemKind}`);
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
      type = normalizeType(`${C.K8S.TYPE_PREFIX}${obj.kind}`);
      output = typeifyResource(obj, type);
    }

    return output;

    function typeifyResource(obj, type) {
      if ( obj && obj.metadata )
      {
        if ( obj.metadata.namespace && obj.metadata.name )
        {
          obj.id = `${obj.metadata.namespace}${C.K8S.ID_SEPARATOR}${obj.metadata.name}`;
        }
        else if ( obj.metadata.name )
        {
          obj.id = obj.metadata.name;
        }
      }

      var output = store.createRecord(obj, type);
      if (output && output.metadata && output.metadata.uid)
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
    if ( opt.filter )
    {
      return false;
    }

    // Un-namespaced things are cacheable
    var str = `${C.K8S.BASE_VERSION}/namespaces/`;
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

  _find(type, id, opt) {
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
        opt.url = `${self.get('kubernetesEndpoint')}/${C.K8S.BASE_VERSION}/` + opt.url;
      }

      return findWithUrl(opt.url);
    }
    else
    {
      return Ember.RSVP.reject(new ApiError('k8s find requirs opt.url'));
    }

    function findWithUrl(url) {
      var queue = self.get('promiseQueue');
      var cls = getOwner(self).lookup('model:'+type);

      if ( opt.filter )
      {
        var keys = Object.keys(opt.filter);
        keys.forEach(function(key) {
          var vals = opt.filter[key];
          if ( !Ember.isArray(vals) )
          {
            vals = [vals];
          }

          vals.forEach(function(val) {
            url += (url.indexOf('?') >= 0 ? '&' : '?') + encodeURIComponent(key) + '=' + encodeURIComponent(val);
          });
        });
      }

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
    return group.filterBy('metadata.uid',uid)[0];
  },

  containersByDockerId: function() {
    var out = {};
    this.get('containers').forEach((container) => {
      out[container.get('externalId')] = container;
    });

    return out;
  }.property('containers.@each.externalId'),


  isReady() {
    return this.request({
      url: `${this.get('kubernetesEndpoint')}/${C.K8S.BASE}`
    }).then(() => {
      return true;
    }).catch(() => {
      return Ember.RSVP.resolve(false);
    });
  },

  _getCollection(type, resourceName) {
    return this._find(`${C.K8S.TYPE_PREFIX}${type}`, null, {
      url: resourceName
    });
  },

  _allCollection(type, resourceName) {
    var store = this.get('store');
    type = normalizeType(`${C.K8S.TYPE_PREFIX}${type}`);

    if ( store.haveAll(type) )
    {
      return Ember.RSVP.resolve(store.all(type),'All '+ type + ' already cached');
    }
    else
    {
      return this._find(type, null, {
        url: resourceName
      }).then(function() {
        return store.all(type);
      });
    }
  },

  _getNamespacedResource(type, resourceName, id) {
    var nsId = this.get('namespace.id');
    var withNs = joinId(id, nsId);
    var withoutNs = splitId(withNs).name;

    return this._find(`${C.K8S.TYPE_PREFIX}${type}`, withNs , {
      url: `namespaces/${nsId}/${resourceName}/${withoutNs}`
    });
  },

  allNamespaces() {
    var store = this.get('store');
    var type = `${C.K8S.TYPE_PREFIX}namespace`;
    var name = 'kube-system';

    return this._allCollection('namespace','namespaces').then((namespaces) => {
      // kube-system is special and doesn't feel like it needs to come back in a list...
      if ( !store.getById(type,name) )
      {
        store._add(type, store.createRecord({
          apiVersion: 'v1',
          type: type,
          id: name,
          metadata: {
            name: name,
          },
          kind: 'Namespace',
          spec: {},
        }));

      }

      return namespaces;
    });
  },

  getNamespaces() { return this._getCollection('namespace','namespaces'); },
  getNamespace(name, forceReload) {
    return this._find(`${C.K8S.TYPE_PREFIX}namespace`, name , {
      url: `namespaces/${name}`,
      forceReload: forceReload,
    });
  },

  selectNamespace(desiredName) {
    var self = this;
    return this.allNamespaces().then((all) => {
      // Asked for a specific one
      var obj = objForName(desiredName);
      if ( obj )
      {
        return select(obj);
      }

      // One in the session
      obj = objForName(self.get(`tab-session.${C.TABSESSION.NAMESPACE}`));
      if ( obj )
      {
        return select(obj);
      }

      // One called default
      obj = all.filterBy('id','default')[0];
      if ( obj )
      {
        return select(obj);
      }

      // The first one
      obj = all.objectAt(0);
      if ( obj )
      {
        return select(obj);
      }

      return select(null);

      function objForName(name) {
        if ( name )
        {
          return all.filterBy('id', name).objectAt(0);
        }
        else
        {
          return null;
        }
      }

      function select(obj) {
        self.set(`tab-session.${C.TABSESSION.NAMESPACE}`, (obj ? obj.get('id') : null));
        self.set('namespace', obj);
        return obj;
      }
    });
  },

  allServices() { return this._allCollection('service','services'); },
  getServices() { return this._getCollection('service','services'); },
  getService(name) { return this._getNamespacedResource('service','services',name); },

  allRCs() { return this._allCollection('replicationcontroller','replicationcontrollers'); },
  getRCs() { return this._getCollection('replicationcontroller','replicationcontrollers'); },
  getRC(name) { return this._getNamespacedResource('replicationcontroller','replicationcontrollers',name); },

  allPods() { return this._allCollection('pod','pods'); },
  getPods() { return this._getCollection('pod','pod'); },
  getPod(name) { return this._getNamespacedResource('pod','pod',name); },

  /*
  _getNamespacedType(type, resourceName) {
    return this.find(`${C.K8S.TYPE_PREFIX}${type}`, null, {
      url: `namespaces/${this.get('namespace.id')}/${resourceName}`
    });
  },

  getNSServices()    { return this._getNamespacedType('service','services'); },
  getNSService(name) { return this._getNamespacedResource('service','services', name); },

  getNSRCs()    { return this._getNamespacedType('replicationcontroller','replicationcontrollers'); },
  getNSRC(name) { return this._getNamespacedResource('replicationcontroller','replicationcontrollers', name); },
  */

  parseKubectlError(err) {
    var response = (JSON.parse(err.xhr.responseText));
    return ApiError.create({
      status: err.status,
      code: response.exitCode,
      message: response.stdErr.split(/\n/),
    });
  },

  create(body) {
    return this.request({
      url: `${this.get('kubectlEndpoint')}/create`,
      method: 'POST',
      contentType: 'application/yaml',
      data: body
    }).catch((err) => {
      return Ember.RSVP.reject(this.parseKubectlError(err));
    });
  },

  getYaml(type, id, defaultNs) {
    var parts = splitId(id, defaultNs);
    return this.request({
      url: `${this.get('kubectlEndpoint')}/${encodeURIComponent(type)}/${encodeURIComponent(parts.name)}?namespace=${encodeURIComponent(parts.namespace)}`,
    }).then((body) => {
      return body.stdOut.trim();
    }).catch((err) => {
      return Ember.RSVP.reject(this.parseKubectlError(err));
    });
  },

  edit(body) {
    return this.request({
      url: `${this.get('kubectlEndpoint')}/apply`,
      method: 'POST',
      contentType: 'application/yaml',
      data: body
    }).catch((err) => {
      return Ember.RSVP.reject(this.parseKubectlError(err));
    });
  },

  catalog(files,answers) {
    return this.request({
      url: `${this.get('kubectlEndpoint')}/catalog`,
      method: 'POST',
      contentType: 'application/json',
      data: {
        files: files,
        environment: answers
      }
    }).catch((err) => {
      return Ember.RSVP.reject(this.parseKubectlError(err));
    });
  },
});
