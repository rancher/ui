import Ember from 'ember';
import C from 'ui/utils/constants';
import ApiError from 'ember-api-store/models/error';

export default Ember.Service.extend({
  'tab-session': Ember.inject.service('tab-session'),

  request: function(methodOrOpt, path, data, moreOpt={}) {
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

    opt.headers = opt.headers || {};
    opt.headers[C.HEADER.PROJECT] = this.get(`tab-session.${C.TABSESSION.PROJECT}`);

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


  light_request: function(method, path) {
    var store = this.get('store');
    var opt = {};
    opt.url = path;
    opt.method = method;
    var promise = new Ember.RSVP.Promise(function(resolve,reject) {
      store.rawRequest(opt).then(success, fail);

      function success(obj) {
        var xhr = obj.xhr;
        var response = {status: xhr.status};
        if (xhr.status === 200)
        {
          resolve(response);
        }
        else {
          reject(ApiError.create(response));
        }
      }

      function fail() {
        var response = ApiError.create({status: 404});
        reject(response);
      }

    }, 'Request: '+ opt.url);
    return promise; 
  },

  isReady: function() {
    var projectId = this.get(`tab-session.${C.TABSESSION.PROJECT}`);
    return this.request({
      url: `${this.get('app.mesosEndpoint').replace('%PROJECTID%', projectId)}/${C.MESOS.HEALTH}`
    }).then(() => {
      return true;
    }).catch(() => {
      return Ember.RSVP.resolve(false);
    });
  },

  getFrameworks: function() {
    var projectId = this.get(`tab-session.${C.TABSESSION.PROJECT}`);
    return this.request({
      url: `${this.get('app.mesosEndpoint').replace('%PROJECTID%', projectId)}/${C.MESOS.FRAMEWORKS}`
    }).then((body) => {
      return body.stdOut.trim();
    }).catch(() => {
      return Ember.RSVP.resolve(false);
    });
  },

});