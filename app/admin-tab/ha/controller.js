import Ember from 'ember';
import Util from 'ui/utils/util';

export default Ember.Controller.extend({
  settings: Ember.inject.service(),
  growl: Ember.inject.service(),
  cookies: Ember.inject.service(),
  projects: Ember.inject.service(),

  csrf: Ember.computed.alias('cookies.CSRF'),

  userUrl: '',
  selfSign: true,
  generating: false,
  justGenerated: false,
  errors: null,
  confirmPanic: false,
  haProject: null,

  configExecute: function() {
    return 'sudo bash ./rancher-ha.sh rancher/server:' + (this.get('settings.rancherVersion') || 'latest');
  }.property('settings.rancherVersion'),

  runCode: function() {
    let version = this.get('settings.rancherVersion') || 'latest';

    return `sudo docker run -d --restart=always -p 8080:8080 \\
-e CATTLE_DB_CATTLE_MYSQL_HOST=<hostname or IP of MySQL instance> \\
-e CATTLE_DB_CATTLE_MYSQL_PORT=<port> \\
-e CATTLE_DB_CATTLE_MYSQL_NAME=<Name of database> \\
-e CATTLE_DB_CATTLE_USERNAME=<Username> \\
-e CATTLE_DB_CATTLE_PASSWORD=<Password> \\
rancher/server:${version}`;
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
      clone.save().then(() => {
        orig.set('enabled', false);
      }).catch((err) => {
        this.get('growl').fromError(err);
      });
    },

    generateConfig() {
      if ( !this.validate() ) {
        return;
      }

      this.set('generating',true);
      this.set('haProject', null);

      Ember.run.later(() => {
        this.set('generating',false);
        this.set('justGenerated',true);
      }, 500);
    },

    downloadConfig() {
      var form = $('#haConfigForm')[0];
      form.submit();
      this.set('downloaded',true);

      Ember.run.later(() => {
        var ha = this.get('model.haConfig');
        var clone = ha.clone();
        clone.set('enabled',true);
        clone.save(}).then((neu) => {
          ha.merge(neu);
          this.findProject();
        });
      }, 500);
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
    this.set('model.createScript.hostRegistrationUrl', 'https://'+val);
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

  findProject: function() {
    this.get('userStore').find('project', null, {filter: {all: true}, forceReload: true}).then((projects) => {
      var matches = projects.filter((project) => {
        return project.get('uuid').match(/^system-ha-(\d+)$/) || project.get('uuid').match(/^system-management-(\d+)$/);
      });

      if ( matches.length )
      {
        this.set('haProject', matches.objectAt(0));
        if ( this.get('projects.current.id') === this.get('haProject.id') )
        {
          this.getHosts();
        }
        else
        {
          this.send('switchProject', this.get('haProject.id'), false);
        }
      }
      else
      {
        Ember.run.later(this,'findProject', 5000);
      }
    });
  },

  hosts: null,
  getHosts: function() {
    return this.get('store').findAll('host', null, {forceReload: true}).then((hosts) => {
      this.set('hosts', hosts);
    });
  }.observes('haProject'),

  expectedHosts: Ember.computed.alias('model.haConfig.clusterSize'),
  activeHosts: function() {
    return (this.get('hosts')||[]).filterBy('state','active').get('length');
  }.property('hosts.@each.state'),

  hostBlurb: function() {
    clearInterval(this.get('hostTimer'));
    var total = this.get('expectedHosts');
    var active = this.get('activeHosts');

    if ( active < total )
    {
      this.set('hostTimer', setInterval(() => {
        this.getHosts();
      }, 5000));
      return active + '/' + total;
    }
    else
    {
      return total;
    }
  }.property('hosts.@each.state','model.haConfig.clusterSize'),

  cert: null,
  getCertificate: function() {
    return this.get('store').find('certificate', null, {filter: {name: 'system-ssl'}}).then((certs) => {
      this.set('cert', certs.objectAt(0));
      this.getHosts();
    });
  }.observes('haProject'),
});
