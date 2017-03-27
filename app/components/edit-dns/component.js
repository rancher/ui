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
  record: null,
  editing: true,

  classNames: ['inline-form'],
  primaryResource: Ember.computed.alias('record'),

  mode: null,
  targetServicesMap: null,
  targetIpArray: null,


  actions: {
    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },

    setTargetServices(array, resources) {
      this.set('targetServicesMap', resources);
    },

    addTargetIp() {
      this.get('targetIpArray').pushObject({value: null});
    },

    removeTargetIp(obj) {
      this.get('targetIpArray').removeObject(obj);
    },
  },

  init() {
    this._super(...arguments);
    this.set('record', this.get('originalModel').clone());
    let type = this.get('record.type').toLowerCase();
    let mode = type;
    if ( type === 'externalservice' ) {
      if ( this.get('record.hostname') ) {
        mode = HOSTNAME;
      } else {
        mode = IP;
      }
    }

    this.set('mode', mode);

    this.set('targetServicesMap',[]);
    this.set('targetIpArray',[]);
  },

  modeChanged: function() {
    let mode = this.get('mode');
    let type = modeToType(mode);
    let neu = this.get('store').createRecord(this.get('record').serialize(), {type: type});
    neu.set('type', type);
    this.set('record', neu);
  }.observes('mode'),

  validate() {
    let errors = this._super(...arguments);
    switch ( this.get('mode') ) {
      case HOSTNAME:
        if ( !this.get('model.hostname') ) {
          return false;
        }
        break;
      case ALIAS:
        break;
      case IP:
        break;
      case SELECTOR:
        break;
    }

    this.set('errors', errors);
    return errors.length === 0;
  },

  willSave() {
    if ( this.get('mode') === IP ) {
      this.set('record.hostname', null);
    } else if ( this.get('mode') === HOSTNAME ) {
      this.set('record.externalIpAddresses', null);
    }

    return true;
  },

  didSave() {
    if ( this.get('mode') === ALIAS ) {
      return this.get('record').doAction('setservicelinks', {
        serviceLinks: this.get('targetServicesMap'),
      });
    }
  },

  doneSaving() {
    this.send('cancel');
  },
});
