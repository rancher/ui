import { inject as service } from '@ember/service';
import Component from '@ember/component';
import Errors from 'ui/utils/errors';
import layout from './template';
import { get, set, observer } from '@ember/object';
import { on } from '@ember/object/evented';

export default Component.extend({
  layout,
  tagName: 'section',
  classNames: ['well'],
  settings: service(),
  access: service(),
  github: service(),

  model: null,
  individuals: 'siteAccess.users',
  collection: 'siteAccess.groups',
  principals: null,

  saved: true,
  errors: null,

  showList: function() {
    return get(this, 'copy.accessMode') !== 'unrestricted';
  }.property('copy.accessMode'),

  actions: {
    addAuthorized: function(data) {
      this.send('clearError');
      set(this, 'saved', false);
      get(this, 'copy.allowedPrincipalIds').pushObject(data);
    },

    removeIdentity: function(ident) {
      set(this, 'saved', false);
      get(this, 'copy.allowedPrincipalIds').removeObject(ident);
    },

    save: function(btnCb) {
      this.send('clearError');

      if ( get(this, 'showList') && !get(this, 'copy.allowedPrincipalIds.length') )
      {
        this.send('gotError', 'You must add at least one authorized entry');
        btnCb();
        return;
      }

      set(this, 'saved', false);

      let copy = get(this, 'copy');
      get(this, 'github').save().then(() => { // TODO
        get(this, 'model').replaceWith(copy);
        set(this, 'copy.allowedPrincipalIds', get(this, 'copy.allowedPrincipalIds').slice());
        set(this, 'saved', true);
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        btnCb();
      });
    },

    gotError: function(err) {
      set(this, 'errors', [Errors.stringify(err)]);
    },

    clearError: function() {
      set(this, 'errors', null);
    },
  },

  didReceiveAttrs() {
    set(this, 'copy', get(this, 'model').clone());
    set(this, 'copy.allowedPrincipalIds', (get(this, 'copy.allowedPrincipalIds')||[]).slice());
  },

  accessModeChanged: on('init', observer('copy.accessMode', function() {
    set(this, 'saved',false);
    let identities = get(this, 'copy.allowedPrincipalIds'); // ['princ_id1://yada']
    if ( !identities )
    {
      identities = [];
      set(this, 'copy.allowedPrincipalIds', identities);
    }

    if ( get(this, 'copy.accessMode') !== 'unrestricted' )
    {
      let me = get(this, 'access.me.principalIds');
      let found = identities.filter((ident) => {
        return me.includes(ident);
      }).length > 0;
      if ( !found )
      {
        debugger;
        identities = identities.concat(me).uniq();
      }
    }
  })),

});
