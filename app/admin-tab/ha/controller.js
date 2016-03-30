import Ember from 'ember';
import Util from 'ui/utils/util';

export default Ember.Controller.extend({
  settings: Ember.inject.service(),
  growl: Ember.inject.service(),

  userUrl: '',
  selfSign: false,

  isLocalDb: function() {
    return (this.get('model.dbHost')||'').toLowerCase() === 'localhost';
  }.property('model.haConfig.dbHost'),

  actions: {
    exportDatabase() {
      Util.download(this.get('model.haConfig').linkFor('dbdump'));
    },

    readFile(field, text) {
      this.set('model.createScript.'+field, text.trim());
    },

    generateConfig() {
      var ha = this.get('model.haConfig');
      var cs = this.get('model.createScript');
      cs.doAction('createscript', cs).then(() => {
        ha.save().then(() => {
        });
      }).catch((err) => {
        this.get('growl').fromError(err);
      });
    },
  },

  setup: (function() {
    this.set('userUrl', this.get('model.hostRegistrationUrl'));
  }).on('init'),

  userUrlChanged: function() {
    let val = this.get('userUrl')||'';
    let match = val.match(/^https?:\/\//);
    if ( match )
    {
      val = val.substr(match[0].length);
    }

    if ( match = val.match(/^(.*):(\d+)$/) )
    {
      let port = parseInt(match[2],10);
      if ( port > 0 )
      {
        this.set('model.httpsPort', port);
      }
    }

    let pos = val.indexOf('/',1);
    if ( pos >= 1 && val.substr(pos-2,2) !== ':/' && val.substr(pos-2,2) !== 's:' )
    {
      val = val.substr(0,pos);
    }

    this.set('userUrl', val);

  }.observes('userUrl'),
});
