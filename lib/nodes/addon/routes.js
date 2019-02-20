import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  // Define your engine's route map here
  this.route('custom-drivers', { path: '/drivers' }, function() {
    this.route('node-drivers', { path: '/node' });
    this.route('cluster-drivers', { path: '/cluster' });
  });
  this.route('node-templates');
});
