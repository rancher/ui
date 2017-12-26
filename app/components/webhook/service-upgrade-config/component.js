import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  payloadFormatChoices: null,
  addressTypeChoices: null,

  init() {
    this._super(...arguments);
    this.set('payloadFormatChoices', this.getChoices('payloadFormat'));
    this.set('addressTypeChoices', this.getChoices('addressType'));
  },

  getChoices(field) {
    const serviceUpgradeSchema = this.get('webhookStore').getById('schema', 'serviceupgrade');
    const schema = serviceUpgradeSchema.resourceFields[field];
    let choices = [];
    if (schema) {
      choices = schema.options.map(option => {
        return { label: `newReceiver.${field}.${option}`, value: option };
      });
    }
    return choices;
  },

  actions: {
    optionsChanged: function (opt) {
      this.get('model').setProperties(opt);
    }
  }
});
