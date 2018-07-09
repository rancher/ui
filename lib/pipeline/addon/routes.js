import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {

  // Define your engine's route map here
  this.route('settings', { path: '/' });
  this.route('pipelines', { path: '/pipelines' });
  this.route('new-pipeline', { path: '/addPipeline' });
  this.route('view-config', { path: '/viewConfig/:pipeline_id' });
  this.route('import', { path: '/import' });
  this.route('pipeline', { path: '/pipelines/:pipeline_id' });

});
