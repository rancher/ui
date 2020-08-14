import { inject as service } from '@ember/service';
import Component from '@ember/component';
import Errors from 'ui/utils/errors';
import layout from './template';
import {
  get, set, observer, computed, setProperties
} from '@ember/object';
import { on } from '@ember/object/evented';

export default Component.extend({
  settings:    service(),
  access:      service(),
  intl:        service(),
  router:      service(),

  layout,
  tagName:     'section',
  classNames:  ['well'],
  model:       null,
  individuals: 'siteAccess.users',
  collection:  'siteAccess.groups',
  principals:  null,

  saved:       true,
  errors:      null,

  actions: {
    addAuthorized(principal) {
      if ( !principal ) {
        return;
      }

      this.send('clearError');

      set(this, 'saved', false);

      if (this.checkDuplicate(principal)) {
        this.send('gotError', get(this, 'intl').t('siteAccess.dupe'))
      } else {
        get(this, 'model.allowedPrincipalIds').pushObject(principal.id);
      }
    },

    refreshAllTokens() {
      set(this, 'refreshing', true);
      this.globalStore.request({
        url:    '/v3/users?action=refreshauthprovideraccess',
        method: 'POST',
        data:   {}
      })
        .catch((err) => {
          set(this, 'errors', [err.message]);
        })
        .finally(() => {
          set(this, 'refreshing', false);
        });
    },

    removeAuthorized(id) {
      set(this, 'saved', false);

      get(this, 'model.allowedPrincipalIds').removeObject(id);
    },

    save(btnCb) {
      this.send('clearError');

      if ( get(this, 'model.accessMode') !== 'unrestricted' && !get(this, 'model.allowedPrincipalIds.length') ) {
        this.send('gotError', get(this, 'intl').t('siteAccess.minimum'));

        btnCb();

        return;
      }

      set(this, 'saved', false);

      const model = get(this, 'model');

      model.save().then(() => {
        set(this, 'saved', true);
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        btnCb();
      });
    },

    cancel() {
      if (this.cancel) {
        this.cancel();
      } else {
        this.router.transitionTo('global-admin.security.authentication');
      }
    },

    gotError(err) {
      set(this, 'errors', [Errors.stringify(err)]);
    },

    clearError() {
      set(this, 'errors', null);

      setProperties(this, { errors: null, });
    },
  },

  showList: computed('model.accessMode', function() {
    return get(this, 'model.accessMode') !== 'unrestricted';
  }),

  accessModeChanged: on('init', observer('model.accessMode', function() {
    set(this, 'saved', false);

    const allowedPrincipals = get(this, 'model.allowedPrincipalIds') || []; // ['princ_id1://yada']

    if ( get(this, 'model.accessMode') !== 'unrestricted' ) {
      let found    = false;

      const myPIds = get(this, 'access.me.principalIds');

      myPIds.forEach( (id) => {
        if (allowedPrincipals.indexOf(id) >= 0) {
          found = true;
        }
      });

      if ( !found && !allowedPrincipals.length) {
        allowedPrincipals.pushObject(get(this, 'access.principal.id'));
      }
    }

    set(this, 'model.allowedPrincipalIds', allowedPrincipals);
  })),

  checkDuplicate(principal) {
    return (get(this, 'model.allowedPrincipalIds') || []).includes(principal.id) ? true : false;
  },

});
