import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('cluster-setting');
  this.route('graph');
  this.route('metrics');
  this.route('rules');
  this.route('rule-detail', { path: '/rule-detail/:rule_id' });
});
