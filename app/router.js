import Ember from 'ember';
import config from './config/environment';
import {getDrivers} from 'ui/hosts/new/controller';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('ie');
  this.route('index');
  this.route('failWhale', {path: '/fail'});

  this.route('login');
  this.route('logout');
  this.route('authenticated', {path: '/'}, function() {

    // Settings
    this.route('settings', {resetNamespace: true}, function() {
      this.route('projects', {path: '/environments'});
      this.route('project-detail', {path: '/environments/:project_id'});
    });

    // Admin
    this.route('admin-tab', {path: '/admin', resetNamespace: true}, function() {
      this.route('auth', {path: '/access'}, function() {
        this.route('activedirectory');
        this.route('github');
        this.route('openldap');
        this.route('localauth', {path: 'local'});
      });

      this.route('settings');

      this.route('accounts', {path: '/accounts'}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'});
      });

      this.route('processes', {path: '/processes'}, function() {
        this.route('index', {path: '/'});
        this.route('process', {path: '/:process_id'});
      });

      this.route('audit-logs');
    });

    // Infrastructure
    this.route('infrastructure-tab', {path: '/infra', resetNamespace: true}, function() {
      this.route('hosts', {path: '/hosts', resetNamespace: true}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'}, function() {
          getDrivers().forEach((driver) => {
            this.route(driver.name);
          });
        });

        this.route('host', {path: '/:host_id', resetNamespace: true}, function() {
          this.route('containers');
          this.route('storage', {path: '/storage'});
          this.route('labels');
        });
      });

      this.route('containers', {resetNamespace: true}, function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});

        this.route('container', {path: '/:container_id', resetNamespace: true}, function() {
          this.route('edit');
          this.route('ports');
          this.route('volumes');
          this.route('labels');
        });
      });

      this.route('virtualmachines', {path: '/vms', resetNamespace: true}, function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});

        this.route('virtualmachine', {path: '/:virtualmachine_id', resetNamespace: true}, function() {
          this.route('labels');
        });
      });

      this.route('certificates', {resetNamespace: true}, function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});
        this.route('detail', {path: '/:certificate_id'});
      });

      this.route('storagepools', {resetNamespace: true}, function() {
        this.route('index', {path: '/'});
        this.route('detail', {path: '/:storagepool_id'});
      });
      this.route('storagepools.new-volume', {path: '/add-volume', resetNamespace: true});

      this.route('registries', {path: '/registries', resetNamespace: true}, function() {
        this.route('new', { path: '/add' });
        this.route('index', {path: '/'});
      });
    });

    // Applications
    this.route('applications-tab', {path: '/apps', resetNamespace: true}, function() {
      this.route('splash', {path: '/welcome', resetNamespace: true});
      this.route('service.new', {path: '/add-service', resetNamespace: true});
      this.route('service.new-virtualmachine', {path: '/add-vm-service', resetNamespace: true});
      this.route('service.new-balancer', {path: '/add-balancer', resetNamespace: true});
      this.route('service.new-alias', {path: '/add-alias', resetNamespace: true});
      this.route('service.new-external', {path: '/add-external', resetNamespace: true});
      this.route('environments', {path: '/', resetNamespace: true}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'});

        this.route('environment', {path: '/:environment_id', resetNamespace: true}, function() {
          this.route('index', {path: '/'});
          this.route('code', {path: '/code'});
          this.route('graph', {path: '/graph'});
          this.route('chart', {path: '/chart'});

          this.route('service', {path: '/services/:service_id', resetNamespace: true}, function() {
            this.route('containers');
            this.route('labels');
            this.route('ports');
            this.route('edit');
            this.route('links');
          });
        });
      });

      this.route('catalog', {path: '/catalog'}, function() {
        this.route('index', {path: '/'});
        this.route('launch', {path: '/:template'});
      });
    });

    this.route('help');

    this.route('apikeys', {path: '/api'});
    // End: Authenticated
  });



  // Modals
  this.modal('delete-confirmation', {
    dismissWithOutsideClick: false,
    dialogClass: 'small',
    withParams: {'confirmDeleteResources': 'resources'},
    actions: {confirm: 'confirmDelete'}
  });

  this.modal('modal-about', {
    dismissWithOutsideClick: false,
    withParams: 'showAbout',
    dialogClass: 'about',
  });

  this.modal('modal-shell', {
    dismissWithOutsideClick: false,
    dismissWithEscape: false,
    withParams: 'showShell',
    otherParams: 'originalModel',
    dialogClass: 'modal-shell',
  });

  this.modal('modal-console', {
    dismissWithOutsideClick: false,
    dismissWithEscape: false,
    withParams: 'showConsole',
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


  this.modal('modal-auditlog-info', {
    dismissWithOutsideClick: true,
    withParams: 'showAuditLogResponses',
    otherParams: {requestObject: 'requestObject', responseObject: 'responseObject'},
  });
  // End: Modals

});

export default Router;
