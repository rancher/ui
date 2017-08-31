import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  payloadFormatChoices: [
    { label: 'newReceiver.payloadFormat.dockerhub', value: 'dockerhub' },
    { label: 'newReceiver.payloadFormat.alicloud', value: 'alicloud' }
  ],

  actions: {
    optionsChanged: function (opt) {
      this.get('model').setProperties(opt);
    }
  }
});
