import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  // Define your engine's route map here
  this.route('index', { path: '/' });
  this.route('cluster-setting');
  this.route('project-setting');
  this.route('node-detail', { path: '/:node_id' });
  // Node metrics view for embedding in Cluster Dashboard
  this.route('node-graphs', { path: '/:node_id/metrics' });
});
