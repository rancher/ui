import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('accounts', {path: '/accounts'}, function() {
    this.route('index', {path: '/'});
    this.route('new', {path: '/add'});
  });

  this.route('audit-logs');
  this.route('catalog');
  this.route('ha');

  this.route('settings', function() {
    this.route('auth', {path: '/access'}, function() {
      this.route('activedirectory');
      this.route('azuread');
      this.route('github');
      this.route('openldap');
      this.route('localauth', {path: 'local'});
      this.route('shibboleth');
    });

    this.route('machine');
    this.route('registration');
    this.route('advanced');
  });

  this.route('processes', {path: '/processes'}, function() {
    this.route('index', {path: '/'});
    this.route('pools', {path: '/pools'});
    this.route('list', {path: '/list'});
  });
  this.route('process', {path: '/processes/:process_id'});
});
