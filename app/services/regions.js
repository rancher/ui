import Ember from 'ember';

export default Ember.Service.extend({
  userStore: Ember.inject.service('user-store'),

  getAll: function() {
    var opt = {
      url: 'regions',
    };

    return this.get('userStore').find('region', null, opt);
  }
});
