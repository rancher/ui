import Ember from 'ember';
import Util from 'ui/utils/util';

export default Ember.Component.extend({
  tagName: 'footer',
  className: 'clearfix',

  settings: Ember.inject.service(),
  
  actions: {
    showAbout() {
      this.sendAction('showAbout');
    },

   composeDownload(os) {
      this.get('store').find('setting',null,{filter: {all: 'false'}}).then((settings) => {
        var map = {};
        settings.forEach((setting) => {
          var name = setting.get('name').replace(/\./g,'_').toLowerCase();
          map[name] = setting.get('value');
        });

        var url = map['rancher_compose_'+os+'_url'];
        if ( url )
        {
          Util.download(url);
        }
      });
    },
  }
});


