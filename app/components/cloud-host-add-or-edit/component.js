import Ember from 'ember';
import Driver from 'ui/mixins/driver';

export default Ember.Component.extend(Driver, {
  model: null,
  config: null,
  hostTemplates: null,
  selectedHostTemplate: null,
  providerClass: Ember.computed('config.provider', function() {
    var provider = this.get('config.provider');

    switch (provider) {
    case 'Amazon':
      return 'amazonec2';
    case 'Digital Ocean':
      return 'digitalocean';
    case 'Packet':
      return 'packet';
    default:
      return '';
    }
  }),
  actions: {
    setLabels() {
    },
    saveTemp() {
      if (this.get('selectedHostTemplate')) {
        if (this.get('selectedHostTemplate.accountId')) {
          // we have a hosttemplate so well send it with the driver
          // debugger;
          Ember.run.later(() => {
            // TODO Actually save this model now that the template is saved
            var model = this.get('model');
            model.setProperties({
              hostTemplateId: this.get('selectedHostTemplate.id'),
              rancherConfig: {
                flavor: this.get('config.id')
              }
            });
            model.save().then((result) => {
              // result;
              // debugger;
              this.sendAction('save');
            }).catch((err) => {
              console.log('err: ', err);
            });
          }, 1000);
        } else {
          this.get('selectedHostTemplate').save().then((hstTemplate) => {
            hstTemplate.waitForNotTransitioning.then(() => {
              Ember.run.later(() => {
                // TODO Actually save this model now that the template is saved
                var model = this.get('model');
                model.setProperties({
                  hostTemplateId: this.get('selectedHostTemplate.id'),
                  rancherConfig: {
                    flavor: this.get('config.id')
                  }
                });
                model.save().then((result) => {
                  // result;
                  // debugger;
                  this.sendAction('save');
                }).catch((err) => {
                  console.log('err: ', err);
                });
              }, 1000);
            });
          });
        }
      } else {
        // debugger;
      }
    },
  },
});
