import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('index');
  this.route('failWhale', { path: '/fail' });

  this.route('login');
  this.route('logout');
  this.route('authenticated', { path: '/'}, function() {
    this.resource('settings', function() {
      this.route('auth');
    });

    this.resource('projects', { path: '/projects' }, function() {
      this.route('new', {route: '/add'});
    });

    this.resource("project", { path: '/projects/:project_id' }, function() {
      this.route("edit");
    });

    this.resource('hosts', { path: '/hosts'}, function() {
      this.route('index', {path: '/'});
      this.route('setup', {path: '/setup'});
      this.route('new', {path: '/add'}, function() {
        this.route('digitalocean');
        this.route('amazon');
        this.route('openstack');
        this.route('custom');
      });

      this.resource('host', { path: '/:host_id' }, function() {
        this.route('index', { path: '/monitoring'});
        this.route('hostContainers', { path: '/containers'});
      });
    });

    this.resource('containers', { path: '/containers'}, function() {
      this.route('new', {path: '/add'});
      this.route('index', {path: '/'});

      this.resource('container', { path: '/:container_id' }, function() {
        this.route('shell');
        this.route('logs');
        this.route('edit');
      });
    });


    this.resource('apikeys', {path: '/api'}, function() {
      this.route('new', {path: '/api/add'});
      this.resource('apikey', {path: '/:apikey_id'}, function() {
        this.route('edit');
      });
    });

    this.resource('volumes', {path: '/volumes'}, function() {
      this.resource('volume', {path: '/:volume_id'}, function() {
      });
    });

    this.resource('registries', {path: '/registries'}, function() {
      this.route('new', {path: '/add'});
      this.route('index', {path: '/'});

      this.resource('registry', {path: '/:registry_id'}, function() {
        this.route('edit');
        this.route('new-credential', {path: '/add-credential'});

        this.resource('registryCredential', {path: '/credentials/:credential_id'}, function() {
    //      this.route('edit');
        });
      });
    });

    this.resource('balancing', {path: '/balancing'}, function() {
      this.resource('loadbalancers', {path: '/balancers'}, function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});

        this.resource('loadbalancer', {path: '/:loadbalancer_id'}, function() {
          this.route('index', { path: '/monitoring'});
          this.route('config', { path: '/config'});
          this.route('hosts', { path: '/hosts'}, function() {
            this.route('new', { path: '/add'});
          });
          this.route('targets', { path: '/targets'}, function() {
            this.route('new', { path: '/add'});
          });
          this.route('edit');
        });
      });

      this.resource('loadbalancerconfigs', {path: '/configs'}, function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});

        this.resource('loadbalancerconfig', {path: '/:loadbalancerconfig_id'}, function() {
          this.route('index', {path: '/'});
          this.route('edit');
        });
      });
    });

    this.resource('environments.new', {path: '/environments/add'});
    this.resource('service.new', {path: '/environments/add-service'});
    this.resource('environments', {path: '/environments'}, function() {
      this.route('index', {path: '/'});
      this.resource('environment', {path: '/:environment_id'}, function() {
        this.route('index', {path: '/'});
        this.route('code', {path: '/code'});
        this.route('edit');

        this.resource('service', {path: '/services/:service_id'}, function() {

        });
      });
    });

    // End: Authenticated
  });
});

export default Router;
