import Ember from 'ember';
import C from 'ui/utils/constants';
import ApiError from 'ember-api-store/models/error';

export default Ember.Service.extend({
  'tab-session': Ember.inject.service('tab-session'),

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
    return this.light_request(
      'GET', 
      `${this.get('app.mesosEndpoint').replace('%PROJECTID%', projectId)}/${C.MESOS.HEALTH}`
    ).then(() => {
      return true;
    }).catch(() => {
      return Ember.RSVP.resolve(false);
    });
  },

});