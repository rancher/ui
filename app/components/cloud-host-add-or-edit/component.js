import Ember from 'ember';

const HOST_TEMPLATES = [
  {
    provider: 'amazonec2',
    name: 'West USAmazon',
    as: '11111111112kljsd',
  },
  {
    provider: 'digitalocean',
    name: 'Digital Ocean East',
    as: '11111111112kljsd',
  },
  {
    provider: 'packet',
    name: 'Packet East Key',
    as: '11111111112kljsd',
  },
];

export default Ember.Component.extend({
  host: null,
  hostTemplates: null,
  selectedHostTemplate: null,
  providerClass: Ember.computed('host.provider', function() {
    var provider = this.get('host.provider');

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
      if (this.get('selectedTemplateKey')) {
        if (this.get('selectedTemplateKey.accountId')) {
          // we have a hosttemplate so well send it with the driver
          Ember.run.later(() => {
            // TODO Actually save this model now that the template is saved
            this.sendAction('save');
          }, 1000);
        } else {
          this.get('selectedTemplateKey').save().then((hstTemplate) => {
            hstTemplate.waitForNotTransitioning(() => {
              Ember.run.later(() => {
                // TODO Actually save this model now that the template is saved
                this.sendAction('save');
              }, 1000);
            });
          });
        }
      }
    },
  },
});
