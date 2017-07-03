import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

const DRIVERS = ['scaleService','scaleHost','serviceUpgrade'];

export default Ember.Component.extend(NewOrEdit, {
  model: null,

  init() {
    this._super(...arguments);
    this.swapConfig(this.get('model.driver'));
  },

  swapConfig(driver) {
    let store = this.get('webhookStore');

    // Clear the config of the inactive drivers
    DRIVERS.forEach((name) => {
      if ( name !== driver ) {
        this.set(`model.${name}Config`, null);
      }
    });

    let def;
    switch ( driver ) {
    case 'scaleService':
      def = store.createRecord({
        type: 'scaleService',
        action: 'up',
        amount: 1,
        serviceId: null,
      });
      break;
    case 'scaleHost':
      def = store.createRecord({
        type: 'scaleHost',
        action: 'up',
        amount: 1,
        hostSelector: '',
        deleteOption: 'leastRecent',
      });
      break;
    case 'serviceUpgrade':
      def = store.createRecord({
        type: 'serviceUpgrade',
        tag: '',
        serviceSelector: '',
        batchSize: 1,
        interval: 2,
        startFirst: false,
      });
      break;
    }

    if ( !this.get(`model.${driver}Config`) ) {
      this.set(`model.${driver}Config`, def);
    }
  },

  scaleHostActionChanged: function() {
    let action = this.get('model.scaleHostConfig.action');
    if ( action === 'up' ) {
      this.set('model.scaleHostConfig.deleteOption', null);
    } else if ( action === 'down' && !this.get('model.scaleHostConfig.deleteOption') ) {
      this.set('model.scaleHostConfig.deleteOption', 'leastRecent');
    }
  }.observes('model.scaleHostConfig.action'),

  scaleTypeChoices: [
    {label: 'hookPage.scaleService.label', value: 'scaleService'},
    {label: 'hookPage.scaleHost.label', value: 'scaleHost'},
    {label: 'hookPage.serviceUpgrade.label', value: 'serviceUpgrade'},
  ],
  kind: Ember.computed({
    set(key, value) {
      let driver = value;
      this.swapConfig(driver);
      this.set('errors', null);
      return this.set('model.driver', driver);
    },
    get(/* key */) {
      return this.get('model.driver');
    },
  }),

  actions: {
    cancel() {
      this.sendAction('cancel');
    }
  },

  doSave: function(opt) {
    opt = opt || {};
    if ( !this.get('primaryResource.id') ) {
      opt.url = 'receivers';
    }

    return this._super(opt);
  },

  doneSaving() {
    this.send('cancel');
  },
});
