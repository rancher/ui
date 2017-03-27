import Ember from 'ember';

const HOST_DETAILS = [
  {
    driver: 'rancher',
    flavorPrefix: 'Amazon',
    name: null,
    publicValues: {
      accessKey: ''
    },
    secretValues: {
      secretKey: ''
    },
  },
  {
    driver: 'rancher',
    flavorPrefix: 'Digital Ocean',
    name: null,
    secretValues: {
      accessToken: ''
    },
  },
  {
    driver: 'rancher',
    flavorPrefix: 'Packet',
    name: null,
    publicValues: {
      projectId: '',
    },
    secretValues: {
      apiKey: ''
    },
  },
];
// this component really doesn't care about the host provider
// all its going to do is validate and save so the partial could
// load the template for adding and saving keys
export default Ember.Component.extend({
  store: Ember.inject.service(),
  add:                false,
  templates:          null,
  hostTemplate:       null,
  selectedKey:        null,
  newSelectedKey:     null,
  provider:           null,
  providerKeyDetails: HOST_DETAILS,
  name:               null,
  secretValue:        null,
  publicValue:        null,
  newKeyObserver: Ember.observer('name', 'secretValue', 'publicValue', function() {
    var {name, secretValue, publicValue} = this.getProperties('name', 'secretValue', 'publicValue');
    var selectedKey = this.get('selectedKey');
    if (this.get('add')) {
      this.set('selectedKey.name', name);
      if (selectedKey.publicValues) {
        Object.keys(selectedKey.publicValues).forEach((pvk) => {
          selectedKey.publicValues[pvk] = publicValue;
        });
      }
      if (selectedKey.secretValues) {
        Object.keys(selectedKey.secretValues).forEach((svk) => {
          selectedKey.secretValues[svk] = secretValue;
        });
      }
    }
    console.log(selectedKey);
  }),
  actions:            {
    addKey() {
      var hostTemplate = this.get('store').createRecord({type: 'hostTemplate'});
      var provider = Ember.$.extend(hostTemplate, this.get('providerKeyDetails').findBy('flavorPrefix', this.get('provider')));
      this.set('selectedKey', this.set('newSelectedKey', provider));
      this.set('add', true);
    },
    cancelAdd(){
      this.set('selectedKey', null);
      this.set('add', false);
    }
  },
  setHostTemplate: Ember.observer('hostTemplate', function() {
    if (this.get('hostTemplate')) {
      this.set('selectedKey', this.get('templates').findBy('id', this.get('hostTemplate')));
    } else {
      this.set('selectedKey', null);
    }
  }),
});
