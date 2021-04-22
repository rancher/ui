import { schedule } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import C from 'ui/utils/constants';
import { computed } from '@ember/object';
import { on } from '@ember/object/evented';

export default Controller.extend({
  settings:    service(),
  prefs:       service(),
  scope:       service(),
  application: controller(),
  error:       null,

  isPopup:     alias('application.isPopup'),
  pageScope:   alias('scope.currentPageScope'),

  hasHosts: computed.gt('model.hosts.length', 0),

  bootstrap: on('init', function() {
    schedule('afterRender', this, () => {
      this.get('application').setProperties({
        error:             null,
        error_description: null,
        state:             null,
      });

      let bg = this.get(`prefs.${ C.PREFS.BODY_BACKGROUND }`);

      if ( bg ) {
        $('BODY').css('background', bg); // eslint-disable-line
      }

      // Add class to hide Page Header and Footer when embedded
      const embedded = window.top !== window;

      if (embedded) {
        $('BODY').addClass('embedded'); // eslint-disable-line
      }
    });
  }),

});
