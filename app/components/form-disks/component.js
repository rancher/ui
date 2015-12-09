import Ember from 'ember';

export default Ember.Component.extend({
  instance: null,

  disksArray: Ember.computed.alias('instance.disks'),


  didInitAttrs() {
    this.set('instance.disks', (this.get('instance.disks')||[]).slice());
  },

  actions: {
    addDisk() {
      this.get('instance.disks').pushObject({name: '', size: '', driver: 'convoy-gluster'});
    },

    removeDisk(obj) {
      this.get('instance.disks').removeObject(obj);
    },
  },
});
