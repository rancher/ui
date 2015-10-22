import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('ie');
  this.route('index');
  this.route('failWhale', { path: '/fail' });

  this.route('login');
  this.route('logout');
  this.route('authenticated', { path: '/'}, function() {

    // Settings
    this.resource('settings', function() {
      this.route('apikeys', {path: '/api'});

      this.route('projects', { path: '/environments' });
      this.route('project-detail', { path: '/environments/:project_id' });

      this.route('registries', { path: '/registries' });
      this.route('registry-new', { path: '/registries/add' });
      this.route('registry-detail', { path: '/registries/:registry_id' });
    });

    // Admin
    this.resource('admin-tab', {path: '/admin'}, function() {
      this.route('auth', {path: '/access'}, function() {
        this.route('github');
        this.route('ldap');
        this.route('localauth', {path: 'local'});
      });

      this.route('host');

      this.route('accounts', {path: '/accounts'}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'});
      });

      this.route('processes', {path: '/processes'}, function() {
        this.route('index', {path: '/'});
        this.route('process', {path: '/:process_id'});
      });
    });

    // Infrastructure
    this.resource('infrastructure-tab', {path: '/infra'}, function() {
      this.resource('hosts', { path: '/hosts'}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'}, function() {
          this.route('amazonec2');
          this.route('digitalocean');
          this.route('exoscale');
          this.route('openstack');
          this.route('packet');
          this.route('rackspace');
          this.route('ubiquity');
          this.route('other');
          this.route('custom');
        });

        this.resource('host', { path: '/:host_id' }, function() {
          this.route('containers');
          this.route('storage', {path: '/storage'});
        });
      });

      this.resource('containers', function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});

        this.resource('container', { path: '/:container_id' }, function() {
          this.route('edit');
        });
      });

      this.resource('certificates', function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});
        this.route('detail', {path: '/:certificate_id'});
      });
    });

    // Applications
    this.resource('applications-tab', {path: '/apps'}, function() {
      this.resource('splash', {path: '/welcome'});
      this.resource('service.new', {path: '/add-service'});
      this.resource('service.new-balancer', {path: '/add-balancer'});
      this.resource('service.new-alias', {path: '/add-alias'});
      this.resource('service.new-external', {path: '/add-external'});
      this.resource('environments', {path: '/'}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'});

        this.resource('environment', {path: '/:environment_id'}, function() {
          this.route('index', {path: '/'});
          this.route('code', {path: '/code'});
          this.route('graph', {path: '/graph'});
          this.route('chart', {path: '/chart'});

          this.resource('service', {path: '/services/:service_id'}, function() {
            this.route('containers');
            this.route('edit');
          });
        });
      });
      this.route('catalog', {path: '/catalog/:type'});
    });

    // End: Authenticated
  });

  // Modals
  this.modal('delete-confirmation', {
    dismissWithOutsideClick: false,
    dialogClass: 'small',
    withParams: { 'confirmDeleteResources': 'resources' },
    actions: { confirm: 'confirmDelete' }
  });

  this.modal('modal-about', {
    dismissWithOutsideClick: false,
    withParams: 'showAbout',
    dialogClass: 'about',
  });

  this.modal('modal-shell', {
    dismissWithOutsideClick: false,
    withParams: 'showShell',
    otherParams: 'originalModel',
    dialogClass: 'modal-shell',
  });

  this.modal('modal-container-logs', {
    dismissWithOutsideClick: false,
    withParams: 'showContainerLogs',
    otherParams: 'originalModel',
    dialogClass: 'modal-logs',
  });

  this.modal('edit-container', {
    dismissWithOutsideClick: false,
    withParams: 'editContainer',
    otherParams: 'originalModel',
  });

  this.modal('edit-host', {
    dismissWithOutsideClick: false,
    withParams: 'editHost',
    otherParams: 'originalModel',
  });

  this.modal('edit-apikey', {
    dismissWithOutsideClick: false,
    withParams: 'editApikey',
    otherParams: {'originalModel': 'originalModel', 'editApikeyIsNew': 'justCreated'}
  });

  this.modal('edit-project', {
    dismissWithOutsideClick: false,
    dialogClass: 'full-height',
    withParams: 'editProject',
    otherParams: 'originalModel',
  });

  this.modal('edit-registry', {
    dismissWithOutsideClick: false,
    withParams: 'editRegistry',
    otherParams: 'originalModel',
  });

  this.modal('edit-environment', {
    dismissWithOutsideClick: false,
    withParams: 'editEnvironment',
    otherParams: 'originalModel',
  });

  this.modal('edit-service', {
    dismissWithOutsideClick: false,
    withParams: 'editService',
    otherParams: 'originalModel',
  });

  this.modal('edit-aliasservice', {
    dismissWithOutsideClick: false,
    withParams: 'editAliasService',
    otherParams: 'originalModel',
  });

  this.modal('edit-externalservice', {
    dismissWithOutsideClick: false,
    withParams: 'editExternalService',
    otherParams: 'originalModel',
  });

  this.modal('edit-loadbalancerservice', {
    dismissWithOutsideClick: false,
    withParams: 'editLoadBalancerService',
    otherParams: 'originalModel',
  });

  this.modal('edit-account', {
    dismissWithOutsideClick: false,
    withParams: 'editAccount',
    otherParams: 'originalModel',
  });

  this.modal('modal-catalog-launch', {
    dismissWithOutsideClick: true,
    withParams: 'launchCatalog',
    otherParams: {originalModel: 'originalModel', environmentResource: 'environmentResource'}
  });

  this.modal('modal-process-error', {
    dismissWithOutsideClick: true,
    withParams: 'openProcessesError',
    otherParams: 'exception'
  });
  // End: Modals
});

export default Router;
