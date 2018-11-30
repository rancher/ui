import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  // Define your engine's route map here
  this.route('custom-drivers', { path: '/custom-drivers' }, function() {
    this.route('node-drivers', { path: '/node-drivers' });
    this.route('cluster-drivers', { path: '/cluster-drivers' });
  });
  this.route('node-templates');
});
