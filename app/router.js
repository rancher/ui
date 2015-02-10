import Ember from 'ember';
import config from 'ui/config/environment';

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
      this.route('new', {path: '/new'});

      this.resource('containers', { path: '/'}, function() {
        this.route('new', {path: '/new-container'});
      });
    });

    this.resource('host', { path: '/hosts/:host_id' }, function() {
      this.route('delete');
    });

    this.resource('container', { path: '/containers/:container_id' }, function() {
      this.route('shell');
      this.route('logs');
      this.route('edit');
      this.route('delete');
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

  });
});

export default Router;
