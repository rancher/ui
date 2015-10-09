import Ember from 'ember';

export default Ember.Mixin.create({
  isGlobal: null,
  isService: null,
  isRequestedHost: null,

  actions: {
    setGlobal: function(bool) {
      console.log('setGlobal',bool);
      this.set('isGlobal', bool);
    },
  },
});
