import Ember from 'ember';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  tagName: 'footer',
  className: 'clearfix',

  settings: Ember.inject.service(),

  actions: {
    showAbout() {
      this.sendAction('showAbout');
    },

    composeDownload(os) {
      var url = this.get('settings').get(C.SETTING.COMPOSE_URL[os.toUpperCase()]);
      if ( url )
      {
        Util.download(url);
      }
    },
  }
});


