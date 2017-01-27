import Ember from 'ember';

const DEFAULT_UID = '0';
const DEFAULT_GID = '0';
const DEFAULT_MODE = '444';

export default Ember.Component.extend({
  intl: Ember.inject.service(),
  secrets: null,
  showPermissions: false,

  init: function() {
    this._super(...arguments);
    let secrets = this.get('secrets');
    if ( !secrets ) {
      secrets = [];
      this.set('secrets', secrets);
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
});
