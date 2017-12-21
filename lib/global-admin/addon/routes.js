import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('accounts', function() {
    this.route('index', {path: '/'});
    this.route('new', {path: '/add'});
    this.route('detail', {path: '/:user_id'});
  });

  this.route('clusters', function() {
    this.route('index', {path: '/'});
    this.route('new', {path: '/add'}, function() {
      this.route('cloud');
      this.route('rke');
      this.route('import');
    });
  });

  this.route('catalog');

  this.route('machine-drivers');

  this.route('machines', {path: '/nodes'}, function() {
    this.route('index', {path: '/'});
    this.route('templates');
    this.route('launch', {path: '/launch/:template_id'});
    this.route('configure');
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


  // @TODO-2.0 move/remove these
  this.route('settings', function() {
    this.route('registration');
    this.route('advanced');
  });

});
