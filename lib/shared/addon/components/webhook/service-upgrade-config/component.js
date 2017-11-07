import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  tagName: '',
  payloadFormatChoices: null,

  init() {
    this._super(...arguments);
    this.initPayloadFormatChoices();
  },

  initPayloadFormatChoices() {
    const serviceUpgradeSchema = this.get('webhookStore').getById('schema', 'serviceupgrade');
    const payloadFormatSchema = serviceUpgradeSchema.resourceFields.payloadFormat;
    const choices = payloadFormatSchema.options.map(option => {
      return { label: `newReceiver.payloadFormat.${option}`, value: option };
    });
    this.set('payloadFormatChoices', choices);
  },

  actions: {
    optionsChanged: function (opt) {
      this.get('model').setProperties(opt);
    }
  }
});
