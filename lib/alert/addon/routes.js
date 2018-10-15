import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('index', { path: '/' });
  this.route('new', { path: '/add' });
  this.route('edit', { path: '/edit/:alert_id' });
  this.route('edit-rule', { path: '/:group_id/rule/:rule_id' });
  this.route('new-rule', { path: '/:group_id/rule/add' });
});
