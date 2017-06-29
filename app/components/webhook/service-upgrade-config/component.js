import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  registryChoices: [
    { label: 'newReceiver.registry.dockerhub', value: 'dockerhub' },
    { label: 'newReceiver.registry.alicloud', value: 'alicloud' }
  ],

  actions: {
    optionsChanged: function (opt) {
      this.get('model').setProperties(opt);
    }
  }
});
