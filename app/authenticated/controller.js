import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  application : Ember.inject.controller(),
  settings    : Ember.inject.service(),
  prefs       : Ember.inject.service(),
  projects    : Ember.inject.service(),
  error       : null,

  isPopup: Ember.computed.alias('application.isPopup'),

  bootstrap: function() {
    Ember.run.schedule('afterRender', this, () => {
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

  pageScope: 'none',
  setPageScope(scope) {
    this.set('pageScope', scope);
  },
});
