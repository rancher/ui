import Ember from 'ember';
import Driver from 'ui/mixins/driver';

export default Ember.Component.extend(Driver, {
  errors: null,
  model: null,
  config: null,
  selectedHostTemplate: null,
  actions: {
    saveTemp() {
      if (this.get('selectedHostTemplate')) {
        if (this.get('selectedHostTemplate.accountId')) {
          this.buildModelOut(this.get('model'), this.get('selectedHostTemplate.id')).then((/*result*/) => {
            this.sendAction('save');
          });
        } else {
          this.get('selectedHostTemplate').save().then((hstTemplate) => {
            hstTemplate.waitForNotTransitioning().then(() => {
              this.buildModelOut(this.get('model'), this.get('selectedHostTemplate.id')).then((/*result*/) => {
                this.sendAction('save');
              });
            });
          });
        }
      } else {
        this.buildModelOut(this.get('model')).then((/*result*/) => {
          this.sendAction('save');
        });
      }
    },
  },
  buildModelOut: function(modelIn, hostId=null) {
    var modelOut = modelIn;

    if (hostId) {
      Ember.$.extend(modelOut, {hostTemplateId: hostId});
    }

    modelOut.setProperties({
      rancherConfig: {
        flavor: this.get('config.uiOptions.id')
      }
    });

    let errors = [];
    return modelOut.save().catch((err) => {
      errors.pushObject(err);
    }).finally(() => {
      if ( errors.length ) {
        this.set('errors', errors);
      } else {
        this.set('errors', null);
      }
    });
  }
});
