import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').createRecord({
      type: 'backupTarget',
      name: '',
      description: null,
      nfsConfig: {
        server: null,
        share: null,
        mountOptions: null,
      },
    });
  }
});
