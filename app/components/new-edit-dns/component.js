import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

const HOSTNAME = 'externalhostname';
const IP = 'externalip';
const ALIAS = 'dnsservice';
const SELECTOR = 'service';

function modeToType(mode) {
  if ( mode === HOSTNAME || mode === IP ) {
    return 'externalservice';
  } else {
    return mode;
  }
}

export default Ember.Component.extend(NewOrEdit, {
  intl: Ember.inject.service(),

  record: null,
  editing: true,

  primaryResource: Ember.computed.alias('record'),

  mode: null,
  targetServicesAsMaps: null,
  targetIpArray: null,
  stack: null,
  stackErrors:                null,

  actions: {
    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },

    setTargetServices(array, resources) {
      let store = this.get('store');
      this.set('record.serviceLinks', resources.map((r) => {
        return store.createRecord({
          type: 'link',
          name: r.serviceName,
        });
      }));
    },

    addTargetIp() {
      this.get('targetIpArray').pushObject({value: null});
    },

    removeTargetIp(obj) {
      this.get('targetIpArray').removeObject(obj);
    },
  },

  expand(item) {
    item.toggleProperty('expanded');
  },

  init() {
    this._super(...arguments);
    let record = this.get('originalModel').clone();
    let type = record.get('type').toLowerCase();
    let mode = type;

    if ( type === 'externalservice' ) {
      if ( record.get('hostname') ) {
        mode = HOSTNAME;
      } else {
        mode = IP;
      }
    }

    this.setProperties({
      record: record,
      mode: mode,
      targetServicesAsMaps: [], // Set by form-targets
      targetIpArray: (record.externalIpAddresses||[]).map((ip) => { return {value: ip}; }),
    });
  },

  canHealthCheck: function() {
    let mode = this.get('mode');
    return (mode === IP) || (mode === HOSTNAME);
  }.property('mode'),

  modeChanged: function() {
    let mode = this.get('mode');
    let type = modeToType(mode);
    let neu = this.get('store').createRecord(this.get('record').serialize(), {type: type});
    neu.set('type', type);
    this.set('record', neu);
  }.observes('mode'),

  targetIpArrayChanged: function() {
    this.set('record.externalIpAddresses', this.get('targetIpArray').map((x) => x.value).filter((x) => !!x));
  }.observes('targetIpArray.@each.value'),

  validate() {
    this._super(...arguments);
    let errors = this.get('errors')||[];

    switch ( this.get('mode') ) {
      case HOSTNAME:
        if ( !this.get('record.hostname') ) {
          errors.pushObject(this.get('intl').t('editDns.errors.hostnameRequired'));
        }
        break;
      case ALIAS:
        if ( !this.get('targetServicesAsMaps.length') ) {
          errors.pushObject(this.get('intl').t('editDns.errors.serviceRequired'));
        }
        break;
      case IP:
        if ( !this.get('record.externalIpAddresses.length') ) {
          errors.pushObject(this.get('intl').t('editDns.errors.ipRequired'));
        }
        break;
      case SELECTOR:
        if ( !this.get('record.selectorContainer.length') ) {
          errors.pushObject(this.get('intl').t('editDns.errors.selectorRequired'));
        }
        break;
    }

    errors.pushObjects(this.get('stackErrors')||[]);

    this.set('errors', errors);
    return errors.length === 0;
  },

  willSave() {
    if ( this.get('mode') === IP ) {
      this.set('record.hostname', null);
    } else if ( this.get('mode') === HOSTNAME ) {
      this.set('record.externalIpAddresses', null);
    }

    if ( !this.get('id') ) {
      // Set the stack ID
      if ( this.get('stack.id') ) {
        this.set('record.stackId', this.get('stack.id'));
      } else if ( this.get('stack') ) {
        return this.get('stack').save().then((newStack) => {
          this.set('record.stackId', newStack.get('id'));
        });
      }
    }

    return this._super(...arguments);
  },

  doneSaving() {
    this.send('cancel');
  },
});
