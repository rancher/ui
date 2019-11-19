import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('clusters', function() {
    this.route('index', { path: '/' });
    this.route('new', { path: '/add' }, function() {
      this.route('select', { path: '/select' });
      this.route('launch', { path: '/launch/:provider' });
    });
  });

  this.route('catalog');
  this.route('global-registry');

  this.route('global-dns', { path: '/dns' }, function() {
    this.route('entries',  function() {
      this.route('index');
      this.route('new', { path: '/add' });
    });
    this.route('providers',  function() {
      this.route('index');
      this.route('new', { path: '/add' });
    });
  });

  this.route('multi-cluster-apps', { path: '/apps' }, function() {
    this.route('index', { path: '/' });
    this.route('catalog', { path: '/catalog' }, function() {
      this.route('index');
      this.route('launch', { path: '/:template' });
    });
  });

  this.route('settings', function() {
    this.route('advanced', { path: '/advanced' });
    this.route('features', { path: '/feature-flags' });
  });

  this.route('security', function() {
    this.route('index', { path: '/' });

    this.route('accounts', function() {
      this.route('groups', { path: '/groups' });
      this.route('users', { path: '/users' });
      this.route('new', { path: '/add' });
      this.route('new-group', { path: '/add-group' });
      this.route('edit-group', { path: '/edit-group/:role_id' });
      this.route('detail', { path: '/detail/:user_id' });
      this.route('edit', { path: '/edit/:user_id' });
    });


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
      this.route('okta');
      this.route('freeipa');
      this.route('googleoauth');
    });

    this.route('cloud-credentials', function() {
      this.route('index', { path: '/' });
    });
  });

  this.route('cluster-templates', { path: '/rke-templates' }, function() {
    this.route('index');
    this.route('new', { path: '/add' });
    this.route('new-revision', { path: '/add-revision/:template_id' });
    this.route('detail', { path: '/:template_revision_id' });
  });
});
