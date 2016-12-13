import Ember from 'ember';
import { normalizeType } from 'ember-api-store/utils/normalize';
import { applyHeaders } from 'ember-api-store/utils/apply-headers';
import ApiError from 'ember-api-store/models/error';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

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
  'tab-session': Ember.inject.service(),
  cookies: Ember.inject.service(),
  store: Ember.inject.service('store'),

  loadingErrors: null,
  version: null,
  namespaces: null,
  services: null,
  rcs: null,
  pods: null,
  containers: null,
  deployments: null,
  replicasets: null,
  hosts: null,

  // The current namespace
  namespace: null,

  kubernetesEndpoint: function() {
    return this.get('app.kubernetesEndpoint').replace(this.get('app.projectToken'), this.get(`tab-session.${C.TABSESSION.PROJECT}`));
  }.property(`tab-session.${C.TABSESSION.PROJECT}`,'app.kubernetesEndpoint'),

  kubectlEndpoint: function() {
    return this.get('app.kubectlEndpoint').replace(this.get('app.projectToken'), this.get(`tab-session.${C.TABSESSION.PROJECT}`));
  }.property(`tab-session.${C.TABSESSION.PROJECT}`,'app.kubectlEndpoint'),

  clusterIp: function() {
    return this.get('hosts.firstObject.displayIp');
  }.property('hosts.@each.displayIp'),

  promiseQueue: null,
  init() {
    this._super();
    this.get('store.metaKeys').addObject('metadata');
    this.set('promiseQueue', {});

    this.set('hosts', []);
    this.get('store').findAll('host').then((hosts) => {
      this.set('hosts', hosts);
    });
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
        if ( (obj.headers.get('content-type')||'').toLowerCase().indexOf('/json') !== -1 )
        {
          var response = self._typeify(obj.body);
          resolve(response);
        }
        else
        {
          resolve(obj.body);
        }
      }

      function fail(obj) {
        var response, body;

        if ( (obj.headers.get('content-type')||'').toLowerCase().indexOf('/json') !== -1 )
        {
          body = self._typeify(obj.body);
          body.status = body.code;
          body.code = body.reason;
          delete body.reason;
        }
        else
        {
          body = {status: obj.status, message: obj.body};
        }

        if ( ApiError.detectInstance(body) )
        {
          response = body;
        }
        else
        {
          response = ApiError.create(body);
        }

        reject(response);
      }
    },'Request: '+ opt.url);

    return promise;
  },

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

      output = store.createCollection(obj,{key: 'items'});
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

      var output = store.createRecord(obj, {type: type});
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
      if ( isForAll && store.get('_state.foundAll')[type] )
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
        let version;
        if ( C.K8S.EXTENSION_TYPES.indexOf(type) >= 0 )
        {
          version = C.K8S.EXTENSION_VERSION;
        }
        else
        {
          version = C.K8S.BASE_VERSION;
        }

        opt.url = `${self.get('kubernetesEndpoint')}/${version}/` + opt.url;
      }

      return findWithUrl(opt.url);
    }
    else
    {
      return Ember.RSVP.reject(new ApiError('k8s find requires opt.url'));
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
            store.get('_state.foundAll')[type] = true;
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
    return this.get('store').find('stack').then((stacks) => {
      let stack = this.filterSystemStack(stacks);
      if ( stack )
      {
        return this.request({
          url: `${this.get('kubernetesEndpoint')}/version`
        }).then((res) => {
          this.set('version', res);
          return this.selectNamespace().then(() => {
            if ( this.get(`tab-session.${C.TABSESSION.NAMESPACE}`) ) {
              return true;
            } else {
              return false;
            }
          });
        }).catch(() => {
          return false;
        });
      }

      return false;
    }).catch(() => {
      return Ember.RSVP.resolve(false);
    });
  },

  supportsStacks: function() {
    if ( this.get('cookies.icanhasstacks') ) {
      return true;
    }

    let v = this.get('version');
    if ( v )
    {
      let major = parseInt(v.get('major'),10);
      let minor = parseInt(v.get('minor'),10);
      return (major > 1) || (major === 1 && minor > 2);
    }
    else
    {
      return false;
    }
  }.property('version.{minor,major}'),

  filterSystemStack(stacks) {
    return (stacks||[]).find((stack) => {
      let info = stack.get('externalIdInfo');
      return (info.kind === C.EXTERNAL_ID.KIND_CATALOG || info.kind === C.EXTERNAL_ID.KIND_SYSTEM_CATALOG) &&
        info.base === C.EXTERNAL_ID.KIND_INFRA &&
        info.name === C.EXTERNAL_ID.KIND_KUBERNETES;
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
    return this._allCollection('namespace','namespaces');
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

      // I give up
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

  allDeployments() { return this._allCollection('deployment','deployments'); },
  getDeployments() { return this._getCollection('deployment','deployments'); },
  getDeployment(name) { return this._getNamespacedResource('deployment','deployments',name); },

  allReplicaSets() { return this._allCollection('replicaset','replicasets'); },
  getReplicaSets() { return this._getCollection('replicaset','replicasets'); },
  getReplicaSet(name) { return this._getNamespacedResource('replicaset','replicasets',name); },

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
    return ApiError.create({
      status: err.status,
      code: err.body.exitCode,
      message: err.body.stdErr.split(/\n/),
    });
  },

  create(body) {
    return this.request({
      url: Util.addQueryParam(`${this.get('kubectlEndpoint')}/create`, C.K8S.DEFAULT_NS, this.get(`tab-session.${C.TABSESSION.NAMESPACE}`)),
      method: 'POST',
      contentType: 'application/yaml',
      data: body
    }).catch((err) => {
      return Ember.RSVP.reject(this.parseKubectlError(err));
    });
  },

  remove(type,name) {
    return this.request({
      method: 'POST',
      url: Util.addQueryParams(`${this.get('kubectlEndpoint')}/delete`, {
        [C.K8S.DEFAULT_NS]: this.get(`tab-session.${C.TABSESSION.NAMESPACE}`),
        arg: [type, name],
      }),
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
      url: Util.addQueryParam(`${this.get('kubectlEndpoint')}/apply`, C.K8S.DEFAULT_NS, this.get(`tab-session.${C.TABSESSION.NAMESPACE}`)),
      method: 'POST',
      contentType: 'application/yaml',
      data: body
    }).catch((err) => {
      return Ember.RSVP.reject(this.parseKubectlError(err));
    });
  },

  catalog(body) {
    return this.request({
      url: Util.addQueryParam(`${this.get('kubectlEndpoint')}/catalog`, C.K8S.DEFAULT_NS, this.get(`tab-session.${C.TABSESSION.NAMESPACE}`)),
      method: 'POST',
      contentType: 'application/json',
      data: body,
    }).catch((err) => {
      return Ember.RSVP.reject(this.parseKubectlError(err));
    });
  },
});
