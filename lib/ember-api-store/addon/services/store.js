import ArrayProxy from '@ember/array/proxy';
import { getOwner, setOwner } from '@ember/application';
import Ember from 'ember';
import Serializable from '../mixins/serializable';
import ApiError from '../models/error';
import { normalizeType } from '../utils/normalize';
import { applyHeaders } from '../utils/apply-headers';
import { urlOptions } from '../utils/url-options';
import { get, set, computed, getProperties } from '@ember/object';
import { reject, resolve, defer } from 'rsvp';
import Service, { inject as service } from '@ember/service';
import { isArray } from '@ember/array';
import fetch from 'ember-api-store/utils/fetch';
import { parse as setCookieParser } from 'set-cookie-parser';

function getOwnerKey() {
  const x = {};

  setOwner(x);

  return Object.keys(x)[0];
}
const ownerKey = getOwnerKey();

export const defaultMetaKeys = ['actionLinks', 'createDefaults', 'createTypes', 'filters', 'links', 'pagination', 'resourceType', 'sort', 'sortLinks', 'type'];

var Store = Service.extend({
  cookies: service(),

  defaultTimeout:  30000,
  defaultPageSize: 1000,
  baseUrl:         '/v1',
  metaKeys:        null,
  replaceActions:  'actionLinks',
  dropKeys:        null,
  headers:         null,

  arrayProxyClass:   ArrayProxy,
  arrayProxyKey:     'content',
  arrayProxyOptions: null,

  // true: automatically remove from store after a record.delete() succeeds.  You might want to disable this if your API has a multi-step deleted vs purged state.
  removeAfterDelete: true,


  fastboot: computed(function() {
    return getOwner(this).lookup('service:fastboot');
  }),

  init() {
    this._super();

    if (!this.metaKeys ) {
      set(this, 'metaKeys', defaultMetaKeys.slice());
    }

    this._state = {
      cache:            null,
      cacheMap:         null,
      shoebox:          null,
      classCache:       null,
      foundAll:         null,
      findQueue:        null,
      watchHasMany:     null,
      watchReference:   null,
      missingReference: null,
    };

    this.reset();
  },

  // All the saved state goes in here
  _state: null,

  // You can observe this to tell when a reset() happens
  generation: 0,

  initFastBoot(name) {
    let fastboot = this.fastboot;

    if ( fastboot ) {
      if ( fastboot.get('isFastBoot') ) {
        const shoebox = this._state.shoebox = {};

        fastboot.get('shoebox').put(name, {
          shoebox,
          foundAll: this._state.foundAll,
        });
      } else {
        let box = fastboot.get('shoebox').retrieve(name);

        if ( box ) {
          Object.keys(box.foundAll || {}).forEach((key) => {
            this._state.foundAll[key] = box.foundAll[key];
          });

          Object.keys(box.shoebox || {}).forEach((type) => {
            let map = box.shoebox[type];

            Object.values(map).forEach((pojo) => {
              this._typeify(pojo);
            });
          });
        }
      }
    }
  },

  // Synchronously get record from local cache by [type] and [id].
  // Returns undefined if the record is not in cache, does not talk to API.
  getById(type, id) {
    type = normalizeType(type, this);
    var group = this._groupMap(type);

    if ( group ) {
      return group[id];
    }
  },

  // Synchronously returns whether record for [type] and [id] is in the local cache.
  hasRecordFor(type, id) {
    return !!this.getById(type, id);
  },

  // Synchronously returns whether this exact record object is in the local cache
  hasRecord(obj) {
    if ( !obj ) {
      return false;
    }

    var type = normalizeType(obj.get('type'), this);
    var group = this._groupMap(type);

    return group[obj.get('id')] === obj;
  },

  hasType(name) {
    var type = normalizeType(name, this);
    var group = this._groupMap(type, false);

    return !!group;
  },

  isCacheable(opt) {
    return !opt || (opt.depaginate && !opt.filter && !opt.forceReload);
  },

  // Asynchronous, returns promise.
  // find(type[,null, opt]): Query API for all records of [type]
  // find(type,id[,opt]): Query API for record [id] of [type]
  // opt:
  //  filter: Filter by fields, e.g. {field: value, anotherField: anotherValue} (default: none)
  //  forceReload: Ask the server even if the type+id is already in cache. (default: false)
  //  limit: Number of reqords to return per page (default: 1000)
  //  depaginate: If the response is paginated, retrieve all the pages. (default: true)
  //  headers: Headers to send in the request (default: none).  Also includes ones specified in the model constructor.
  //  url: Use this specific URL instead of looking up the URL for the type/id.  This should only be used for bootstraping schemas on startup.
  find(type, id, opt) {
    type = normalizeType(type, this);
    opt = opt || {};
    opt.depaginate = opt.depaginate !== false;

    if ( !id && !opt.limit ) {
      opt.limit = this.defaultPageSize;
    }

    if ( !type ) {
      return reject(ApiError.create({ detail: 'type not specified' }));
    }

    // If this is a request for all of the items of [type], then we'll remember that and not ask again for a subsequent request
    var isCacheable = this.isCacheable(opt);

    opt.isForAll = !id && isCacheable;

    // See if we already have this resource, unless forceReload is on.
    if ( opt.forceReload !== true ) {
      if ( opt.isForAll && this._state.foundAll[type] ) {
        return resolve(this.all(type), `Cached find all ${  type }`);
      } else if ( isCacheable && id ) {
        var existing = this.getById(type, id);

        if ( existing ) {
          return resolve(existing, `Cached find ${  type  }:${  id }`);
        }
      }
    }

    // If URL is explicitly given, go straight to making the request.  Do not pass go, do not collect $200.
    // This is used for bootstraping to load the schema initially, and shouldn't be used for much else.
    if ( opt.url ) {
      return this._findWithUrl(opt.url, type, opt);
    } else {
      // Otherwise lookup the schema for the type and generate the URL based on it.
      return this.find('schema', type, { url: `schemas/${ encodeURIComponent(type) }` }).then((schema) => {
        if ( schema ) {
          var url = schema.linkFor('collection') + (id ? `/${ encodeURIComponent(id) }` : '');

          if ( url ) {
            return this._findWithUrl(url, type, opt);
          }
        }

        return reject(ApiError.create({ detail: `Unable to find schema for "${  type  }"` }));
      });
    }
  },

  // Returns a 'live' array of all records of [type] in the cache.
  all(type) {
    type = normalizeType(type, this);
    var group = this._group(type);

    return this._createArrayProxy(group);
  },

  haveAll(type) {
    type = normalizeType(type, this);

    return this._state.foundAll[type];
  },

  // find(type) && return all(type)
  findAll(type, opt) {
    type = normalizeType(type, this);
    opt = opt || {};

    if ( this.haveAll(type) && this.isCacheable(opt) ) {
      return resolve(this.all(type), `All ${  type  } already cached`);
    } else {
      return this.find(type, undefined, opt).then(() => {
        return this.all(type);
      });
    }
  },

  normalizeUrl(url, includingAbsolute = false) {
    let fastboot = this.fastboot;
    let origin;

    if ( fastboot && fastboot.isFastBoot ) {
      origin = `${ fastboot.request.protocol }//${ fastboot.request.host }`;
    } else {
      origin = window.location.origin;
    }

    // Make absolute URLs to ourselves root-relative
    if ( includingAbsolute && url.indexOf(origin) === 0 ) {
      url = url.substr(origin.length);
    }

    // Make relative URLs root-relative
    if ( !url.match(/^https?:/) && url.indexOf('/') !== 0 ) {
      url = `${ this.baseUrl.replace(/\/\+$/, '')  }/${  url }`;
    }

    // For fastboot everything has to be absolute
    if ( fastboot && !url.match(/^https?:/) ) {
      url = `${ origin }${ url }`
    }

    return url;
  },

  // Makes an AJAX request and returns a promise that resolves to an object
  // This is separate from request() so it can be mocked for tests, or if you just want a basic AJAX request.
  rawRequest(opt) {
    const cookieSvc = this.cookies;

    opt.url = this.normalizeUrl(opt.url);
    opt.headers = this._headers(opt.headers);

    let fastboot = this.fastboot;

    if ( fastboot && fastboot.isFastBoot ) {
      const cookies = cookieSvc.read(null, { raw: true });
      const ary = [];

      Object.keys(cookies).forEach((k) => {
        ary.push(`${ k }=${ cookies[k] }`);
      });

      opt.headers['cookie'] = ary.join('; ');
    }

    opt.processData = false;
    if ( typeof opt.dataType === 'undefined' ) {
      opt.dataType = 'text'; // Don't let jQuery JSON parse
    }

    if ( opt.timeout !== null && !opt.timeout ) {
      opt.timeout = this.defaultTimeout;
    }

    if ( opt.data ) {
      if ( !opt.contentType ) {
        opt.contentType = 'application/json';
      }

      if ( Serializable.detect(opt.data) ) {
        opt.data = JSON.stringify(opt.data.serialize());
      } else if ( typeof opt.data === 'object' ) {
        opt.data = JSON.stringify(opt.data);
      }
    }

    const out = fetch(opt.url, opt);

    if ( fastboot && fastboot.isFastBoot ) {
      const method = opt.method || 'GET';

      return out.then((res) => {
        copyCookies(res);
        console.log('[Fastboot Fetch]', method, opt.url, res.status);

        return res;
      }).catch((err) => {
        copyCookies(err);
        console.log('[Fastboot Fetch Error]', method, opt.url, err.status);

        return reject(err);
      });
    }

    return out;

    // Copy cookies from the request's response to the fastboot response
    function copyCookies(obj) {
      if ( !obj || !obj.headers ) {
        return;
      }

      const headers = obj.headers.get('set-cookie');

      if ( headers ) {
        setCookieParser(headers).forEach((opts) => {
          const name = opts.name;
          const value = opts.value;

          delete opts.name;
          delete opts.value
          opts.raw = true;

          cookieSvc.write(name, value, opts);
        });
      }
    }
  },

  // Makes an AJAX request that resolves to a resource model
  request(opt) {
    opt.url = this.normalizeUrl(opt.url);
    opt.depaginate = opt.depaginate !== false;

    if ( this.mungeRequest ) {
      opt = this.mungeRequest(opt);
    }

    return this.rawRequest(opt).then((xhr) => {
      return this._requestSuccess(xhr, opt);
    }).catch((xhr) => {
      return this._requestFailed(xhr, opt);
    });
  },

  // Forget about all the resources that hae been previously remembered.
  reset() {
    const state = this._state;

    var cache = state.cache;

    if ( cache ) {
      Object.keys(cache).forEach((key) => {
        if ( cache[key] && cache[key].clear ) {
          cache[key].clear();
        }
      });
    } else {
      state.cache = {};
    }

    var foundAll = state.foundAll;

    if ( foundAll ) {
      Object.keys(foundAll).forEach((key) => {
        foundAll[key] = false;
      });
    } else {
      state.foundAll = {};
    }

    if ( state.shoebox ) {
      state.shoebox = {};
    }

    state.cacheMap = {};
    state.findQueue = {};
    state.classCache = [];
    state.watchHasMany = {};
    state.watchReference = {};
    state.missingReference = {};
    this.incrementProperty('generation');
  },

  resetType(type) {
    type = normalizeType(type, this);
    var group = this._group(type);

    this._state.foundAll[type] = false;
    this._state.cacheMap[type] = {};

    if ( this._state.shoebox ) {
      this._state.shoebox[type] = {};
    }

    group.clear();
  },

  // ---------
  // Below here be dragons
  // ---------
  _createArrayProxy(content) {
    let data = { [this.arrayProxyKey]: content };

    let opt = this.arrayProxyOptions || {};

    Object.keys(opt).forEach((key) => {
      data[key] = opt[key];
    });

    return this.arrayProxyClass.create(data);
  },

  _headers(perRequest) {
    let out = {
      'accept':       'application/json',
      'content-type': 'application/json',
    };

    applyHeaders(this.headers, out);
    applyHeaders(perRequest, out);

    return out;
  },

  _findWithUrl(url, type, opt) {
    var queue = this._state.findQueue;
    var cls = getOwner(this).lookup(`model:${ type }`);

    url = urlOptions(url, opt, cls);

    // Collect Headers
    var newHeaders = {};

    if ( cls && cls.constructor.headers ) {
      applyHeaders(cls.constructor.headers, newHeaders, true);
    }
    applyHeaders(opt.headers, newHeaders, true);
    // End: Collect headers

    var later;
    var queueKey = JSON.stringify(newHeaders) + url;

    // check to see if the request is in the findQueue
    if (queue[queueKey]) {
      // get the filterd promise object
      var filteredPromise = queue[queueKey];
      let deferr = defer();

      filteredPromise.push(deferr);
      later = deferr.promise;
    } else { // request is not in the findQueue
      opt.url = url;
      opt.headers = newHeaders;

      later = this.request(opt).then((result) => {
        if ( opt.isForAll ) {
          this._state.foundAll[type] = true;

          if ( opt.removeMissing && result.type === 'collection') {
            let all = this._group(type);
            let toRemove = [];

            all.forEach((obj) => {
              if ( !result.includes(obj) ) {
                toRemove.push(obj);
              }
            });

            toRemove.forEach((obj) => {
              this._remove(type, obj);
            });
          }
        }

        this._finishFind(queueKey, result, 'resolve');

        return result;
      }, (reason) => {
        this._finishFind(queueKey, reason, 'reject');

        return reject(reason);
      });

      // set the queue array to empty indicating we've had 1 promise already
      queue[queueKey] = [];
    }

    return later;
  },

  _finishFind(key, result, action) {
    var queue = this._state.findQueue;
    var promises = queue[key];

    if (promises) {
      while (promises.length) {
        if (action === 'resolve') {
          promises.pop().resolve(result);
        } else if (action === 'reject') {
          promises.pop().reject(result);
        }
      }
    }

    delete queue[key];
  },

  _requestSuccess(xhr, opt) {
    opt.responseStatus = xhr.status;

    if ( xhr.status === 204 ) {
      return;
    }

    if ( xhr.body && typeof xhr.body === 'object' ) {
      Ember.beginPropertyChanges();
      let response = this._typeify(xhr.body);

      delete xhr.body;
      Object.defineProperty(response, 'xhr', {
        value:        xhr,
        configurable: true
      });
      Ember.endPropertyChanges();

      // Depaginate
      if ( opt.depaginate && typeof response.depaginate === 'function' ) {
        return response.depaginate().then(() => {
          return response;
        }).catch((xhr) => {
          return this._requestFailed(xhr, opt);
        });
      } else {
        return response;
      }
    } else {
      return xhr.body;
    }
  },

  _requestFailed(xhr, opt) {
    var body;

    if ( xhr.err ) {
      if ( xhr.err === 'timeout' ) {
        body = ApiError.create({
          code:    'Timeout',
          status:  xhr.status,
          message: `API request timeout (${ opt.timeout / 1000 } sec)`,
          detail:  `${ opt.method || 'GET'  } ${  opt.url }`,
        });
      } else {
        body = ApiError.create({
          code:    'Xhr',
          status:  xhr.status,
          message: xhr.err
        });
      }

      return finish(body);
    } else if ( xhr.body && typeof xhr.body === 'object' ) {
      Ember.beginPropertyChanges();
      let out = finish(this._typeify(xhr.body));

      Ember.endPropertyChanges();

      return out;
    } else {
      body = ApiError.create({
        status:  xhr.status,
        message: xhr.body || xhr.message,
      });

      return finish(body);
    }

    function finish(body) {
      if ( !ApiError.detectInstance(body) ) {
        body = ApiError.create(body);
      }

      delete xhr.body;
      Object.defineProperty(body, 'xhr', {
        value:        xhr,
        configurable: true
      });

      return reject(body);
    }
  },

  // Get the cache array group for [type]
  _group(type) {
    type = normalizeType(type, this);
    var cache = this._state.cache;
    var group = cache[type];

    if ( !group ) {
      group = [];
      cache[type] = group;
    }

    return group;
  },

  // Get the cache map group for [type]
  _groupMap(type, autoCreate = true) {
    type = normalizeType(type, this);
    var cache = this._state.cacheMap;
    var group = cache[type];

    if ( !group && autoCreate ) {
      group = {};
      cache[type] = group;
    }

    return group;
  },

  // Get the shoebox group for [type]
  _shoebox(type) {
    type = normalizeType(type, this);
    var box = this._state.shoebox;

    if ( !box ) {
      return null;
    }

    var group = box[type];

    if ( !group ) {
      group = {};
      box[type] = group;
    }

    return group;
  },

  // Add a record instance of [type] to cache
  _add(type, obj) {
    type = normalizeType(type, this);
    const id = obj.id;
    const group = this._group(type);
    const groupMap = this._groupMap(type);
    const shoebox = this._shoebox(type);

    group.pushObject(obj);
    groupMap[obj.id] = obj;

    if ( shoebox ) {
      shoebox[obj.id] = obj.serialize();
    }

    // Update hasMany relationships
    const watches = this._state.watchHasMany[type] || [];
    const notify = [];

    let watch, val;

    for ( let i = 0 ; i < watches.length ; i++ ) {
      watch = watches[i];
      val = obj.get(watch.targetField);
      notify.push({
        type:        watch.thisType,
        id:          val,
        field:       watch.thisField,
        sourceStore: watch.sourceStore
      });
    }

    // Update references relationships that have been looking for this resource
    const key = `${ type }:${ id }`;
    const missings = this._state.missingReference[key];

    if ( missings ) {
      notify.pushObjects(missings);
      delete this._state.missingReference[key];
    }

    this.notifyFieldsChanged(notify);

    if ( obj.wasAdded && typeof obj.wasAdded === 'function' ) {
      obj.wasAdded();
    }
  },

  // Add a lot of instances of the same type quickly.
  //   - There must be a model for the type already defined.
  //   - Instances cannot contain any nested other types (e.g. subtypes),
  //     (they will not be deserialized into their correct type.)
  //   - wasAdded hooks are not called
  // Basically this is just for loading schemas faster.
  _bulkAdd(type, pojos) {
    type = normalizeType(type, this);
    const group = this._group(type);
    const groupMap = this._groupMap(type);
    const shoebox = this._shoebox(type);
    const cls = getOwner(this).lookup(`model:${ type }`);

    group.pushObjects(pojos.map((input) =>  {
      // actions is very unhappy property name for Ember...
      if ( this.replaceActions && typeof input.actions !== 'undefined') {
        input[this.replaceActions] = input.actions;
        delete input.actions;
      }

      // Schemas are special
      if ( type === 'schema' ) {
        input._id = input.id;
        input.id = normalizeType(input.id, this);
      }

      input.store = this;
      let obj =  cls.constructor.create(input);

      groupMap[obj.id] = obj;

      if ( shoebox ) {
        shoebox[obj._id || obj.id] = obj.serialize();
      }

      return obj;
    }));
  },

  // Remove a record of [type] from cache, given the id or the record instance.
  _remove(type, obj) {
    type = normalizeType(type, this);
    const id = obj.id;
    const group = this._group(type);
    const groupMap = this._groupMap(type);
    const shoebox = this._shoebox(type);

    group.removeObject(obj);
    delete groupMap[id];

    if ( shoebox ) {
      delete shoebox[id];
    }

    // Update hasMany relationships that refer to this resource
    const watches = this._state.watchHasMany[type] || [];
    const notify = [];
    let watch;

    for ( let i = 0 ; i < watches.length ; i++ ) {
      watch = watches[i];
      notify.push({
        type:  watch.thisType,
        id:    obj.get(watch.targetField),
        field: watch.thisField
      });
    }

    // Update references relationships that have used this resource
    const key = `${ type }:${ id }`;
    const existing = this._state.watchReference[key];

    if ( existing ) {
      notify.pushObjects(existing);
      delete this._state.watchReference[key];
    }

    this.notifyFieldsChanged(notify);

    if ( obj.wasRemoved && typeof obj.wasRemoved === 'function' ) {
      obj.wasRemoved();
    }

    // If there's a different baseType, remove that one too
    const baseType = normalizeType(obj.baseType, this);

    if ( baseType && type !== baseType ) {
      this._remove(baseType, obj);
    }
  },

  // Turn a POJO into a Model: {updateStore: true}
  _typeify(input, opt = null) {
    if ( !input || typeof input !== 'object') {
      // Simple values can just be returned
      return input;
    }

    if ( !opt ) {
      opt = { applyDefaults: false };
    }

    let type = get(input, 'type');

    if ( isArray(input) ) {
      // Recurse over arrays
      return input.map((x) => this._typeify(x, opt));
    } else if ( !type ) {
      // If it doesn't have a type then there's no sub-fields to typeify
      return input;
    }

    type = normalizeType(type, this);
    if ( type === 'collection') {
      return this.createCollection(input, opt);
    } else if ( !type ) {
      return input;
    }

    let rec = this.createRecord(input, opt);

    if ( !input.id || opt.updateStore === false ) {
      return rec;
    }

    // This must be after createRecord so that mangleIn() can change the baseType
    let baseType = normalizeType(rec.get('baseType'), this);

    if ( baseType ) {
      // Only use baseType if it's different from type
      if ( baseType === type ) {
        baseType = null;
      }
    }

    let out = rec;
    const cacheEntry = this.getById(type, rec.id);

    if ( cacheEntry ) {
      // Check for hasMany relationship changes
      const watches = (this._state.watchHasMany[type] || []).slice();
      const notify = [];

      if ( baseType ) {
        watches.addObjects(this._state.watchHasMany[baseType] || []);
      }

      let watch, oldVal, newVal;

      for ( let i = 0 ; i < watches.length ; i++ ) {
        watch = watches[i];
        oldVal = cacheEntry.get(watch.targetField);
        newVal = rec.get(watch.targetField);

        // console.log('Compare', watch.targetField, oldVal, 'to', newVal);
        if ( oldVal !== newVal ) {
          notify.push({
            type:  watch.thisType,
            id:    oldVal,
            field: watch.thisField
          });
          notify.push({
            type:  watch.thisType,
            id:    newVal,
            field: watch.thisField
          });
        }
      }

      cacheEntry.replaceWith(rec);
      out = cacheEntry;

      // Update changed hasMany's
      this.notifyFieldsChanged(notify);
    } else {
      this._add(type, rec);

      if ( baseType ) {
        this._add(baseType, rec);
      }
    }

    return out;
  },

  notifyFieldsChanged(ary) {
    let entry, tgt;

    for ( let i = 0 ; i < ary.length ; i++ ) {
      entry = ary[i];
      if ( entry.sourceStore ) {
        tgt = entry.sourceStore.getById(entry.type, entry.id);
      } else {
        tgt = this.getById(entry.type, entry.id);
      }

      if ( tgt ) {
        // console.log('Notify', entry.type, entry.id, 'that', entry.field,'changed');
        tgt.notifyPropertyChange(entry.field);
      }
    }
  },

  // Create a collection: {key: 'data'}
  createCollection(input, opt) {
    Ember.beginPropertyChanges();
    let key = (opt && opt.key ? opt.key : 'data');
    var cls = getOwner(this).lookup('model:collection');
    var content = input[key].map((x) => this._typeify(x, opt));
    var output = cls.constructor.create({ content });

    Object.defineProperty(output, 'store', {
      value:        this,
      configurable: true
    });

    output.setProperties(getProperties(input, this.metaKeys));
    Ember.endPropertyChanges();

    return output;
  },

  getClassFor(type) {
    let cls = this._state.classCache[type];

    if ( cls ) {
      return cls;
    }

    let owner = getOwner(this);

    if ( type ) {
      cls = owner.lookup(`model:${ type }`);
    }

    if ( !cls ) {
      cls = owner.lookup('model:resource');
    }

    this._state.classCache[type] = cls;

    return cls;
  },

  canCreate(type) {
    let schema = this.getById('schema', type);

    return schema && schema.collectionMethods && schema.collectionMethods.indexOf('POST') > -1;
  },

  canList(type) {
    let schema = this.getById('schema', type);

    return schema && schema.collectionMethods && schema.collectionMethods.indexOf('GET') > -1;
  },

  // Create a record: {applyDefaults: false}
  createRecord(data, opt) {
    opt = opt || {};
    let type = normalizeType(get(opt, 'type') || get(data, 'type') || '', this);

    let cls;

    if ( type ) {
      cls = this.getClassFor(type);
    }

    let schema = this.getById('schema', type);
    let input = data;

    if ( opt.applyDefaults !== false && schema ) {
      input = schema.getCreateDefaults(data);
    }

    // actions is very unhappy property name for Ember...
    if ( this.replaceActions && typeof input.actions !== 'undefined') {
      input[this.replaceActions] = input.actions;
      delete input.actions;
    }

    let cons = cls.constructor;

    if ( cons.mangleIn && typeof cons.mangleIn === 'function' ) {
      input = cons.mangleIn(input, this);
    }

    if ( schema ) {
      let fields = schema.get('typeifyFields');

      for ( let i = fields.length - 1 ; i >= 0 ; i-- ) {
        let k = fields[i];

        if ( input[k] ) {
          input[k] = this._typeify(input[k], opt);
        }
      }
    }
    var output = cons.create(input);

    Object.defineProperty(output, ownerKey, {
      enumerable: false,
      value:      getOwner(this)
    })

    Object.defineProperty(output, 'store', {
      enumerable:   false,
      value:        this,
      configurable: true
    });

    return output;
  },
});

export default Store;
