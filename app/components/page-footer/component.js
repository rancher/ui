import Ember from 'ember';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  tagName: 'footer',
  className: 'clearfix',

  settings: Ember.inject.service(),
  access: Ember.inject.service(),

  issueBody: function() {
    var str = '*Describe your issue here*\n\n\n---\n| Useful | Info |\n| :-- | :-- |\n' +
      `|Versions|Rancher \`${this.get('settings.rancherVersion')||'-'}\` ` +
        `Cattle: \`${this.get('settings.cattleVersion')||'-'}\` ` +
        `UI: \`${this.get('settings.uiVersion')||'--'}\` |\n`;

      if ( this.get('access.enabled') )
      {
        str += `|Access|\`${this.get('access.provider').replace(/config/,'')}\`, \`${this.get('access.admin') ? 'admin' : ''}\`|\n`;
      }
      else
      {
        str += '|Access|`Disabled`}|\n';
      }

      str += `|Route|\`${this.get('application.currentRouteName')}\`|\n`;

    return encodeURIComponent(str);
  }.property(),

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


