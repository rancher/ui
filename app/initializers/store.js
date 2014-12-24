import Ember from 'ember';

export function initialize(container, application) {
  var store = container.lookup('store:main');
  store.set('removeAfterDelete', false);

  store.reopen({
    baseUrl: application.apiEndpoint,
    reallyAll: store.all,
    all: function(type) {
      type = this.normalizeType(type);
      var group = this._group(type);
      var proxy = Ember.ArrayProxy.create({
        allContent: group,
      });

      proxy.reopen({
        content: function() {
          return this.get('allContent').filter(function(obj) {
            return obj.get('state') !== 'purged';
          });
        }.property('allContent.[]','allContent.@each.state')
      });

      return proxy;
    }
  });
}

export default {
  name: 'store',
  after: 'ember-api-store',
  initialize: initialize
};
