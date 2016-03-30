import Ember from 'ember';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  settings: Ember.inject.service(),
  growl: Ember.inject.service(),

  userUrl: '',
  selfSign: true,
  generating: false,
  justGenerated: false,
  configScript: null,
  errors: null,
  confirmPanic: false,

  configExecute: function() {
    return 'bash ./awesome-script.sh rancher/server:' + (this.get('settings.rancherVersion') || 'latest');
  }.property('settings.rancherVersion'),

  isLocalDb: function() {
    return (this.get('model.haConfig.dbHost')||'').toLowerCase() === 'localhost';
  }.property('model.haConfig.dbHost'),

  actions: {
    exportDatabase() {
      Util.download(this.get('model.haConfig').linkFor('dbdump'));
    },

    readFile(field, text) {
      this.set('model.createScript.'+field, text.trim());
    },

    promptPanic() {
      this.set('confirmPanic', true);
      Ember.run.later(() => {
        if ( this._state !== 'destroying' )
        {
          this.set('confirmPanic', false);
        }
      }, 5000);
    },

    panic() {
      var orig = this.get('model.haConfig');
      var clone = orig.clone();
      clone.set('enabled', false);
      clone.save({headers: {[C.HEADER.PROJECT]: undefined}}).then(() => {
        orig.set('enabled', false);
      }).catch((err) => {
        this.get('growl').fromError(err);
      });
    },

    generateConfig() {
      var ha = this.get('model.haConfig');
      var cs = this.get('model.createScript');

      if ( !this.validate() ) {
        return;
      }

      this.set('generating',true);

      ha.doAction('createscript', cs, {headers: {[C.HEADER.PROJECT]: undefined}}).then((script) => {
        var clone = ha.clone();
        clone.set('enabled',true);
        clone.save({headers: {[C.HEADER.PROJECT]: undefined}}).then(() => {
          ha.set('enabled', true);
          this.set('justGenerated',true);
          this.set('configScript', script.trim());
        });
      }).catch((err) => {
        this.get('growl').fromError(err);
      }).finally(() => {
        this.set('generating', false);
      });
    },
  },

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
    this.set('model.createScript.hostRegistrationUrl', val);
  }.observes('userUrl'),

  selfSignChanged: function() {
    if ( this.get('selfSign') )
    {
      this.get('model.createScript').setProperties({
        key: null,
        cert: null,
        certChain: null,
      });
    }
  }.observes('selfSign'),

  validate() {
    var errors = this.get('model.createScript').validationErrors();
    this.set('errors',errors);
    return errors.length === 0;
  },
});
