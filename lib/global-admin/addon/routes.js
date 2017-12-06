import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('accounts', function() {
    this.route('index', {path: '/'});
    this.route('new', {path: '/add'});
  });

  this.route('clusters', function() {
    this.route('index', {path: '/'});
    this.route('new', {path: '/add'}, function() {
      this.route('cloud');
      this.route('rke');
      this.route('import');
    });
  });

  this.route('security', function() {
    this.route('index', {path: '/'});

    this.route('roles', function() {
      this.route('index', {path: '/'});
      this.route('edit', {path: '/edit/:role_id'});
      this.route('detail', {path: '/:role_id'});
      this.route('new', {path: '/add'});
    });

    this.route('policies', function() {
      this.route('index', {path: '/'});
      this.route('edit', {path: '/:policy_id'});
      this.route('new', {path: '/add'});
    });

    this.route('authentication', function() {
      this.route('activedirectory');
      this.route('azuread');
      this.route('github');
      this.route('openldap');
      this.route('localauth', {path: 'local'});
      this.route('shibboleth');
    });
  });

  this.route('machines', {path: '/nodes'}, function() {
    this.route('index', {path: '/'});
    this.route('templates');
  });

  this.route('catalog');

  this.route('settings', function() {

    this.route('machine');
    this.route('registration');
    this.route('advanced');
  });

});
