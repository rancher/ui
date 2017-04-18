import Ember from 'ember';

// this component really doesn't care about the host provider
// all its going to do is validate and save so the partial could
// load the template for adding and saving keys
export default Ember.Component.extend({
  store:              Ember.inject.service(),
  cloudPlans:         Ember.inject.service(),
  add:                false,
  templates:          null,
  hostTemplate:       null,
  selectedKey:        null,
  newSelectedKey:     null,
  provider:           null,
  providerKeyDetails: Ember.computed.alias('cloudPlans.hostDetails'),
  name:               null,
  secretValue:        null,
  publicValue:        null,
  noSelect:           false,
  init() {
    this._super(...arguments);
    if (this.get('add') && this.get('selectedKey')) {
      this.set('newSelectedKey', this.get('selectedKey'));
    }
  },
  createNewTemplate: function() {
    return Ember.$.extend(this.get('store').createRecord({type: 'hostTemplate'}), this.get('providerKeyDetails').findBy('flavorPrefix', this.get('provider')));
  },
  newKeyObserver: Ember.on('init', Ember.observer('name', 'secretValue', 'publicValue', function() {
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
  })),
  actions: {
    addKey() {
      this.set('selectedKey', this.set('newSelectedKey', this.createNewTemplate()));
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
