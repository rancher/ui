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
  selectedTemplateKey: null,
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
      Ember.run.later(() => {
        this.sendAction('save');
      }, 1000);
    },
  },
});
