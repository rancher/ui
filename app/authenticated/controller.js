import { schedule } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import C from 'ui/utils/constants';

export default Controller.extend({
  application: controller(),
  settings:    service(),
  prefs:       service(),
  scope:       service(),
  error:       null,

  isPopup:     alias('application.isPopup'),
  pageScope:   alias('scope.currentPageScope'),

  bootstrap: function() {
    schedule('afterRender', this, () => {
      this.get('application').setProperties({
        error: null,
        error_description: null,
        state: null,
      });

      let bg = this.get(`prefs.${C.PREFS.BODY_BACKGROUND}`);
      if ( bg ) {
        $('BODY').css('background', bg);
      }
    });
  }.on('init'),

  hasHosts: function() {
    return (this.get('model.hosts.length') > 0);
  }.property('model.hosts.length'),

});
