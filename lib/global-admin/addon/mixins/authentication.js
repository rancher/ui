import Mixin from '@ember/object/mixin';
import Errors from 'ui/utils/errors';
import { get, set, setProperties, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Mixin.create({
  router: service(),

  isEnabled: computed('authConfig.enabled', 'testing', function() {
    const testing = get(this, 'testing');
    const enabled = get(this, 'authConfig.enabled');

    return enabled && !testing;
  }),

  editing:    false,
  authConfig: null,

  actions: {

    cancel() {
      if (this.editing) {
        set(this, 'editing', false);
      }

      this.router.transitionTo('global-admin.security.authentication')
    },

    edit() {
      set(this, 'editing', true);
    },

    waitAndRefresh(url) {
      $('#loading-underlay, #loading-overlay').removeClass('hide').show();  // eslint-disable-line

      setTimeout(() => {
        window.location.href = url || window.location.href;
      }, 1000);
    },

    gotError(err) {
      if ( err.message ) {
        this.send('showError', err.message + (err.detail ? `(${ err.detail })` : ''));
      } else {
        this.send('showError', `Error (${ err.status  } - ${  err.code })`);
      }

      setProperties(this, {
        testing: false,
        saving:  false,
      });
    },

    showError(err) {
      set(this, 'errors', [Errors.stringify(err)]);

      window.scrollY = 0;
    },

    clearError() {
      set(this, 'errors', null);
    },

    disable() {
      this.send('clearError');

      const model = get(this, 'authConfig');
      const accessMode = get(model, 'id') === 'github' || get(model, 'id') === 'googleoauth' ? 'restricted' : 'unrestricted';

      setProperties(model, {
        enabled:             false,
        accessMode,
        allowedPrincipalIds: []
      });

      model.doAction('disable').then(() => {
        this.send('waitAndRefresh');
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        set(this, 'confirmDisable', false);
      });
    },

  }
});
