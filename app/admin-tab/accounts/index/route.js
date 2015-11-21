import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').find('account', null, {filter: {'kind_ne': ['service','agent']}, forceReload: true});
  },
});
