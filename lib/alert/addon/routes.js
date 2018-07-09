import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {

  this.route('index', { path: '/' });
  this.route('new', { path: '/add' });
  this.route('edit', { path: '/edit/:alert_id' });

});
