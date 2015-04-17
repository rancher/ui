import Ember from 'ember';
import Util from 'ui/utils/util';

export default Ember.Mixin.create({
  needs: ['authenticated'],

  actions: {
    machineConfig: function() {
      var url;
      if ( this.get('type') === 'machine' )
      {
        url = this.linkFor('config');
      }
      else
      {
        url = this.get('machine').linkFor('config');
      }

      url = this.get('controllers.authenticated').addAuthParams(url);
      Util.download(url);
    }
  }
});
