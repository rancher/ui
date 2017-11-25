import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('accounts', {path: '/accounts'}, function() {
    this.route('index', {path: '/'});
    this.route('new', {path: '/add'});
  });

  this.route('roles', {path: '/roles'}, function() {
    this.route('index', {path: '/'});
    this.route('edit', {path: '/:role_id'});
    this.route('new', {path: '/add'});
  });

  this.route('audit-logs');
  this.route('catalog');

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

});
