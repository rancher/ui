import Mixin from '@ember/object/mixin';
import Errors from 'ui/utils/errors';
import {
  get, set, setProperties
} from '@ember/object';

export default Mixin.create({
  authConfig: null,

  actions: {

    edit() {
      set(this, 'editing', true);
    },

    waitAndRefresh: function(url) {

      $('#loading-underlay, #loading-overlay').removeClass('hide').show();  // eslint-disable-line

      setTimeout(function() {
        window.location.href = url || window.location.href;
      }, 1000);

    },

    gotError: function(err) {

      if ( err.message ) {

        this.send('showError', err.message + (err.detail? '('+err.detail+')' : ''));

      } else {

        this.send('showError', 'Error ('+err.status + ' - ' + err.code+')');

      }

      setProperties(this, {
        testing: false,
        saving: false,
      });

    },

    showError: function(err) {

      set(this, 'errors', [Errors.stringify(err)]);

      window.scrollY = 0;

    },

    clearError: function() {

      set(this, 'errors', null);

    },

    disable: function() {

      this.send('clearError');

      const model = get(this, 'authConfig');

      setProperties(model, {
        enabled:  false,
        accessMode: 'unrestricted'
      });

      model.doAction('disable').then(() => {

        model.save().then( () => {

          this.send('waitAndRefresh');

        });

      }).catch((err) => {

        this.send('gotError', err);

      }).finally(() => {

        set(this, 'confirmDisable', false);

      });
    },

  }
});
