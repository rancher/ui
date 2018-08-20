import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('accounts', function() {
    this.route('index', { path: '/' });
    this.route('new', { path: '/add' });
    this.route('detail', { path: 'detail/:user_id' });
    this.route('edit', { path: 'edit/:user_id' });
  });

  this.route('clusters', function() {
    this.route('index', { path: '/' });
    this.route('new', { path: '/add' });
  });

  this.route('catalog');

  this.route('settings', function() {
    this.route('index', { path: '/' });
    this.route('advanced', { path: '/advanced' });
  });

  this.route('security', function() {
    this.route('index', { path: '/' });

    this.route('roles', function() {
      this.route('index', { path: '/' });
      this.route('edit', { path: '/edit/:role_id' });
      this.route('detail', { path: '/:role_id' });
      this.route('new', { path: '/add' });
    });

    this.route('policies', function() {
      this.route('index', { path: '/' });
      this.route('edit', { path: '/edit/:policy_id' });
      this.route('detail', { path: '/:policy_id' });
      this.route('new', { path: '/add' });
    });

    this.route('authentication', function() {
      this.route('activedirectory');
      this.route('azuread');
      this.route('github');
      this.route('openldap');
      this.route('localauth', { path: 'local' });
      this.route('shibboleth');
      this.route('ping');
      this.route('keycloak');
      this.route('adfs');
      this.route('freeipa');
    });
  });
});
