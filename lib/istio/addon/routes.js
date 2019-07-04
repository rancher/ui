import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('cluster-setting');
  this.route('project-istio', function() {
    this.route('graph');
    this.route('metrics');
    this.route('rules');
    this.route('rule-detail', { path: '/rule-detail/:rule_id' });
    this.route('destination-rules', function() {
      this.route('new', { path: '/add' });
      this.route('index', { path: '/' });
      this.route('detail', { path: '/:id' }, function() {
        this.route('edit');
      });
    });
    this.route('virtual-services', function() {
      this.route('new', { path: '/add' });
      this.route('index', { path: '/' });
      this.route('detail', { path: '/:id' }, function() {
        this.route('edit');
      });
    });
  });
});
