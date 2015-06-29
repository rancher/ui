import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('ie');
  this.route('index');
  this.route('failWhale', { path: '/fail' });

  this.route('login');
  this.route('logout');
  this.route('authenticated', { path: '/'}, function() {
    this.resource('about');

    // Settings
    this.resource('settings', function() {
      this.route('auth');
      this.route('host');

      this.resource('apikeys', {path: '/api'}, function() {
        this.route('new', {path: '/api/add'});
        this.resource('apikey', {path: '/:apikey_id'}, function() {
          this.route('edit');
        });
      });

      this.resource('registries', {path: '/registries'}, function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});

        this.resource('registry', {path: '/:registry_id'}, function() {
          this.route('edit');
        });
      });

      this.resource('projects', { path: '/environments' }, function() {
        this.route('new', {route: '/add'});
        this.route('index', {path: '/'});

        this.resource('project', { path: '/:project_id' }, function() {
          this.route('index', {path: '/'});
          this.route('edit');
        });
      });
    });

    // Infrastructure
    this.resource('infrastructure-tab', {path: '/infra'}, function() {
      this.resource('hosts', { path: '/hosts'}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'}, function() {
          this.route('amazonec2');
          this.route('digitalocean');
          this.route('packet');
          this.route('openstack');
          this.route('rackspace');
          this.route('custom');
        });

        this.resource('host', { path: '/:host_id' }, function() {
          this.route('edit');
          this.route('containers');
          this.route('storage', {path: '/storage'});
        });
      });

      this.resource('containers', function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});

        this.resource('container', { path: '/:container_id' }, function() {
          this.route('shell');
          this.route('logs');
          this.route('edit');
        });
      });


      this.resource('volumes', function() {
        this.resource('volume', {path: '/:volume_id'}, function() {
        });
      });

      this.resource('loadbalancers', {path: '/balancers'}, function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});

        this.resource('loadbalancer', {path: '/:loadbalancer_id'}, function() {
          this.route('edit');
          this.route('config', { path: '/config'});
          this.route('hosts', { path: '/hosts'}, function() {
            this.route('new', { path: '/add'});
          });
          this.route('targets', { path: '/targets'}, function() {
            this.route('new', { path: '/add'});
          });
        });
      });

      this.resource('loadbalancerconfigs', {path: '/balancer-configs'}, function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});

        this.resource('loadbalancerconfig', {path: '/:loadbalancerconfig_id'}, function() {
          this.route('index', {path: '/'});
          this.route('edit');
        });
      });
    });

    // Applications
    this.resource('stacks-tab', {path: '/stacks'}, function() {
      this.resource('splash', {path: '/welcome'});
      this.resource('service.new', {path: '/add-service'});
      this.resource('service.new-balancer', {path: '/add-balancer'});
      this.resource('service.new-alias', {path: '/add-alias'});
      this.resource('service.new-external', {path: '/add-external'});
      this.resource('environments', {path: '/'}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'});

        this.resource('environment', {path: '/:environment_id'}, function() {
          this.route('index', {path: '/'});
          this.route('code', {path: '/code'});
          this.route('graph', {path: '/graph'});
          this.route('edit');

          this.resource('service', {path: '/services/:service_id'}, function() {
            this.route('containers');
            this.route('edit');
          });
        });
      });
    });

    // End: Authenticated
  });
});

export default Router;
