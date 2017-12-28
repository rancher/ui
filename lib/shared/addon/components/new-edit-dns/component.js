import { reject } from 'rsvp';
import { next } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import Errors from 'ui/utils/errors';
import StackState from 'shared/mixins/stack-memory';
import layout from './template';

const HOSTNAME = 'externalhostname';
const IP = 'externalip';
const ALIAS = 'dnsservice';
const SELECTOR = 'selectorservice';

export default Component.extend(NewOrEdit, StackState, {
  layout,
  intl: service(),

  record: null,
  editing: true,

  primaryResource: alias('record'),

  mode: null,
  targetServicesAsMaps: null,
  targetIpArray: null,
  stack: null,
  stackErrors: null,

  actions: {
    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },

    addTargetIp() {
      this.get('targetIpArray').pushObject({value: null});
      next(() => {
        this.$('.target-ip').last()[0].focus();
      });
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
        if ( !this.get('record.serviceLinks.length') ) {
          errors.pushObject(this.get('intl').t('editDns.errors.serviceRequired'));
        }
        break;
      case IP:
        if ( !this.get('record.externalIpAddresses.length') ) {
          errors.pushObject(this.get('intl').t('editDns.errors.ipRequired'));
        }
        break;
      case SELECTOR:
        if ( !this.get('record.selector.length') ) {
          errors.pushObject(this.get('intl').t('editDns.errors.selectorRequired'));
        }
        break;
    }

    errors.pushObjects(this.get('stackErrors')||[]);

    this.set('errors', errors);
    return errors.length === 0;
  },

  willSave() {
    let ok = this._super(...arguments);
    if (ok) {
      if ( this.get('mode') === IP ) {
        this.set('record.hostname', null);
      } else if ( this.get('mode') === HOSTNAME ) {
        this.set('record.externalIpAddresses', null);
      }

      if ( !this.get('record.id') ) {
        // Set the stack ID
        if ( this.get('stack.id') ) {
          this.set('record.stackId', this.get('stack.id'));
        } else if ( this.get('stack') ) {
          return this.get('stack').save().then((newStack) => {
            this.set('record.stackId', newStack.get('id'));
            return true;
          }).catch((err) => {
            let errors = this.get('errors')||[];
            errors.push(Errors.stringify(err));
            this.set('errors', errors);
            return false;
          });
        } else {
          return reject('No Stack');
        }
      }

    }
    return ok;
  },
});
