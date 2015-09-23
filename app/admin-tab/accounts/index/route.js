import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').find('account', null, {forceReload: true});
  },
});
