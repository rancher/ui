import Ember from 'ember';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

const DEFAULT_UID = '0';
const DEFAULT_GID = '0';
const DEFAULT_MODE = '444';

export default Ember.Component.extend({
  intl:            Ember.inject.service(),
  secrets:         null,
  editing:         false,
  showPermissions: false,

  allSecrets:      null,
  haveAny:         Ember.computed.gte('allSecrets.length',1),

  init: function() {
    this._super(...arguments);

    let allSecrets = this.set('allSecrets', this.get('store').all('secret'));
    let secrets = this.get('secrets');
    let instance = this.get('instance');

    if ( !secrets ) {
      secrets = [];
      this.set('secrets', secrets);
    }

    if (instance && instance.get('secrets.length')) {
      instance.get('secrets').forEach((secret) => {
        let selected = allSecrets.findBy('id', secret.secretId);
        secret.set('alias', selected.get('name'));
        secrets.push(secret);
      });
    }

    for ( var i = 0 ; i < secrets.get('length') ; i++ ) {
      let secret = secrets.objectAt(i);
      let uid = secret.get('uid');
      let gid = secret.get('gid');
      let mode = secret.get('mode');
      if ( (uid && uid !== DEFAULT_UID) ||
           (gid && gid !== DEFAULT_GID) ||
           (mode && mode !== DEFAULT_MODE) ) {
        this.set('showPermissions', true);
        break;
      }
    }
  },

  actions: {
    addSecret() {
      this.get('secrets').pushObject(this.get('store').createRecord({
        type: 'secretReference',
        uid: this.get('secrets.lastObject.uid') || DEFAULT_UID,
        gid: this.get('secrets.lastObject.gid') || DEFAULT_GID,
        mode: this.get('secrets.lastObject.mode') || DEFAULT_MODE,
        name: '',
        secretId: null,
      }));
    },

    removeSecret(secret) {
      this.get('secrets').removeObject(secret);
    },

    showPermissions() {
      this.set('showPermissions', true);
    },
  },

  statusClass: null,
  status: function() {
    let k = STATUS.NONE;
    let count = this.get('secrets').filter((x) => !!x.get('secretId')).get('length') || 0;

    if ( count ) {
      if ( this.get('errors.length') ){
        k = STATUS.INCOMPLETE;
      } else {
        k = STATUS.COUNTCONFIGURED;
      }
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`, {count: count});
  }.property('secrets.@each.secretId','errors.length')
});
