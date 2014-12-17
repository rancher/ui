import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('failWhale', { path: '/failwhale' });

  this.resource('hosts', { path: '/hosts'}, function() {
    this.resource('host', { path: '/:host_id' }, function() {
      this.route('delete');
    });

    this.route('containerNew', {path: '/new-container/:host_id'});
    this.resource('container', { path: '/containers/:container_id' }, function() {
      this.route('console');
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
});

export default Router;
