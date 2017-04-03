import Ember from 'ember';

export default Ember.Component.extend({
  host: null,
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
      debugger;
      if (this.get('selectedHostTemplate')) {
        if (this.get('selectedHostTemplate.accountId')) {
          // we have a hosttemplate so well send it with the driver
          Ember.run.later(() => {
            // TODO Actually save this model now that the template is saved
            this.sendAction('save');
          }, 1000);
        } else {
          this.get('selectedHostTemplate').save().then((hstTemplate) => {
            hstTemplate.waitForNotTransitioning.then(() => {
              Ember.run.later(() => {
                // TODO Actually save this model now that the template is saved
                var host = this.get('host');
                host.setProperties({
                  hostTemplateId: hstTemplate.id
                });
                this.sendAction('save');
              }, 1000);
            });
          });
        }
      }
    },
  },
});
