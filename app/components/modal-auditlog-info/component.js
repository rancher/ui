import Ember from 'ember';

export default Ember.Component.extend({
  requestObject  : null,
  requestJSON    : null,
  responseObject : null,
  responseJSON   : null,

  init() {
    this._super(...arguments);

    // Pretty-ify the JSON
    this.set('requestJSON', JSON.stringify(JSON.parse(this.get('requestObject')),null,2));
    this.set('responseJSON', JSON.stringify(JSON.parse(this.get('responseObject')),null,2));
  },

  actions: {
    dismiss: function() {
      this.sendAction('dismiss');
    }
  },
});
