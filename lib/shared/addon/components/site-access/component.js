import { inject as service } from '@ember/service';
import Component from '@ember/component';
import Errors from 'ui/utils/errors';
import layout from './template';
import { get, set, observer } from '@ember/object';

export default Component.extend({
  layout,
  tagName:     'section',
  classNames:  ['well'],
  settings:    service(),
  access:      service(),
  github:      service(),

  model:       null,
  individuals: 'siteAccess.users',
  collection:  'siteAccess.groups',
  principals:  null,

  saved:       true,
  errors:      null,

  init() {
    this._super(...arguments);
    this.accessModeChanged();
  },

  actions: {
    addAuthorized(principal) {
      if ( !principal ) {
        return;
      }

      this.send('clearError');
      set(this, 'saved', false);
      get(this, 'model.allowedPrincipalIds').pushObject(principal.id);
    },

    removeAuthorized(id) {
      set(this, 'saved', false);
      get(this, 'model.allowedPrincipalIds').removeObject(id);
    },

    save(btnCb) {
      this.send('clearError');

      if ( get(this, 'model.accessMode') === 'required' && !get(this, 'model.allowedPrincipalIds.length') )
      {
        this.send('gotError', 'You must add at least one authorized entry');
        btnCb();
        return;
      }

      set(this, 'saved', false);

      let model = get(this, 'model');
      model.save().then(() => {
        set(this, 'saved', true);
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        btnCb();
      });
    },

    gotError(err) {
      set(this, 'errors', [Errors.stringify(err)]);
    },

    clearError() {
      set(this, 'errors', null);
    },
  },

  showList: function() {
    return get(this, 'model.accessMode') !== 'unrestricted';
  }.property('model.accessMode'),

  accessModeChanged: observer('model.accessMode', function() {
    set(this, 'saved',false);

    let allowedPrincipals = get(this, 'model.allowedPrincipalIds') || []; // ['princ_id1://yada']

    if ( get(this, 'model.accessMode') !== 'unrestricted' ) {

      let me = get(this, 'access.principal')||[];

      let found = allowedPrincipals.filter(ident => get(me, 'id') === ident).length > 0;

      if ( !found ) {
        allowedPrincipals.pushObject(get(me, 'id'));
      }
    }

    set(this, 'model.allowedPrincipalIds', allowedPrincipals);
  }),

});
