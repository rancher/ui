import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  access: Ember.inject.service(),
  session          : Ember.inject.service(),
  language: Ember.inject.service('user-language'),

  beforeModel() {
    this._super.apply(this,arguments);

    let lang = C.LANGUAGE.DEFAULT;
    const session       = this.get('session');
    const fromSession     = session.get(C.SESSION.LANGUAGE); // get local language

    if (fromSession) {
      lang = fromSession;
    }

    return this.get('language').sideLoadLanguage(lang).then(() => {
      if ( !this.get('access.enabled') )
      {
        this.transitionTo('authenticated');
      }
    });
  },

  activate: function() {
    $('BODY').addClass('farm');
  },

  deactivate: function() {
    $('BODY').removeClass('farm');
  }
});
