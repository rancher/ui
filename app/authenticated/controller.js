import { schedule } from '@ember/runloop';
import { alias, equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import C from 'ui/utils/constants';
import { computed } from '@ember/object';
import { on } from '@ember/object/evented';

export default Controller.extend({
  application: controller(),
  settings:    service(),
  prefs:       service(),
  scope:       service(),
  error:       null,

  sidebar:     equal(`prefs.${C.PREFS.MENU}`, 'left'),
  isPopup:     alias('application.isPopup'),
  pageScope:   alias('scope.currentPageScope'),
  hideMenu:    equal(`session.${C.SESSION.HIDE_MENU}`, true),

  bootstrap: on('init', function() {
    schedule('afterRender', this, () => {
      this.get('application').setProperties({
        error: null,
        error_description: null,
        state: null,
      });

      let bg = this.get(`prefs.${C.PREFS.BODY_BACKGROUND}`);
      if ( bg ) {
        $('BODY').css('background', bg); // eslint-disable-line
      }
    });
  }),

  hasHosts: computed('model.hosts.length', function() {
    return (this.get('model.hosts.length') > 0);
  }),

});
