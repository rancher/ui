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
      this.route('new');
    });

    this.resource("project", { path: '/projects/:project_id' }, function() {
      this.route("edit");
      this.route("delete");
    });

    this.resource('hosts', { path: '/hosts'}, function() {
      this.route('setup', {path: '/setup'});
      this.route('new', {path: '/new'}, function() {
        this.route('digitalocean');
        this.route('openstack');
        this.route('custom');
      });

      this.resource('host', { path: '/:host_id' }, function() {
        this.route('index', { path: '/monitoring'});
        this.route('hostContainers', { path: '/containers'});
        this.route('delete');
      });

      this.route('index', {path: '/'});
    });

    this.resource('containers', { path: '/containers'}, function() {
      this.route('new', {path: '/new'});
      this.route('index', {path: '/'});

      this.resource('container', { path: '/:container_id' }, function() {
        this.route('shell');
        this.route('logs');
        this.route('edit');
        this.route('delete');
      });
    });


    this.resource('apikeys', {path: '/api'}, function() {
      this.route('new', {path: '/api/new'});
      this.resource('apikey', {path: '/:apikey_id'}, function() {
        this.route('edit');
        this.route('delete');
      });
    });

    this.resource('volumes', {path: '/volumes'}, function() {
      this.resource('volume', {path: '/:volume_id'}, function() {
        this.route('delete');
      });
    });

    this.resource('registries', function() {
      this.route('new');
    });

    this.resource('registry', {path: '/registries/:registry_id'}, function() {
      this.route('edit');
      this.route('delete');
      this.route('new-credential', {path: '/new-credential'});

      this.resource('registryCredential', {path: '/registry-credentials/:credential_id'}, function() {
  //      this.route('edit');
        this.route('delete');
      });
    });

  });
});

export default Router;
