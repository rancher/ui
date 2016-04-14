import Ember from 'ember';
import config from './config/environment';
import {applyRoutes} from 'ui/utils/additional-routes';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('ie');
  this.route('index');
  this.route('failWhale', {path: '/fail'});
  this.route('not-found', {path: '*path'});

  this.route('login');
  this.route('logout');
  this.route('authenticated', {path: '/'}, function() {

    // Settings
    this.route('settings', {resetNamespace: true}, function() {
      this.route('projects', {path: '/env'}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'});
        this.route('detail', {path: '/:project_id'});
      });
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
      this.route('ha');
    });

    this.route('project', {path: '/env/:project_id'}, function() {
      this.route('index', {path: '/'});

      // Infrastructure
      this.route('infrastructure-tab', {path: '/infra', resetNamespace: true}, function() {
        // console popup route
        this.route('console', {path: '/console', resetNamespace: true});
        // container logs route
        this.route('container-log', {path: '/container-log', resetNamespace: true});

        this.route('console-vm', {path: '/console-vm', resetNamespace: true});

        this.route('vm-log', {path: '/vm-log', resetNamespace: true});

        this.route('hosts', {path: '/hosts', resetNamespace: true}, function() {
          this.route('index', {path: '/'});
          this.route('new', {path: '/add'}, function() {
            this.route('index', {path: '/'});
          });

          this.route('host', {path: '/:host_id', resetNamespace: true}, function() {
            this.route('containers');
            this.route('ports');
            this.route('storage', {path: '/storage'});
            this.route('labels');
          });
        });

        this.route('containers', {resetNamespace: true}, function() {
          this.route('new', {path: '/add'});
          this.route('index', {path: '/'});

          this.route('container', {path: '/:container_id', resetNamespace: true}, function() {
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
        this.route('index', {path: '/'});
        this.route('splash', {path: '/welcome', resetNamespace: true});
        this.route('service.new', {path: '/add-service', resetNamespace: true});
        this.route('service.new-virtualmachine', {path: '/add-vm-service', resetNamespace: true});
        this.route('service.new-balancer', {path: '/add-balancer', resetNamespace: true});
        this.route('service.new-alias', {path: '/add-alias', resetNamespace: true});
        this.route('service.new-external', {path: '/add-external', resetNamespace: true});

        this.route('environments', {path: '/stacks', resetNamespace: true}, function() {
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
              this.route('links');
            });
          });
        });

        this.route('compose-projects', function() {
          this.route('index', {path: '/'});
          this.route('new', {path: '/add'});
          this.route('compose-project', {path: '/:compose_project_id'}, function() {
          });
        });

        this.route('compose-services', function() {
          this.route('index', {path: '/'});
          this.route('compose-service', {path: '/:compose_service_id'});
        });

        this.route('compose-console');
        this.route('compose-waiting');
      });

      // Catalog
      this.route('catalog-tab', {path: '/catalog', resetNamespace: true}, function() {
        this.route('index', {path: '/'});
        this.route('launch', {path: '/:template'});
      });

      // Kubernetes
      this.route('k8s-tab', {path: '/kubernetes', resetNamespace: true}, function() {
        this.route('index', {path: '/'});
        this.route('waiting', {path: '/waiting'});

        this.route('apply', {path: '/apply'});
        this.route('kubectl', {path: '/kubectl'});

        this.route('namespaces', {path: '/namespaces'}, function() {
          this.route('index', {path: '/'});
        });

        this.route('namespace', {path: '/:namespace_id'}, function() {
          this.route('index', {path: '/'});

          this.route('services', {path: '/services'}, function() {
            this.route('service', {path: '/:name'});
          });

          this.route('rcs', {path: '/rcs'}, function() {
            this.route('rc', {path: '/:name'});
          });

          this.route('pods', {path: '/pods'}, function() {
            this.route('pod', {path: '/:name'});
          });
        });
      });


      this.route('help');

      this.route('apikeys', {path: '/api'});
      // End: Authenticated
    });
  });



  // Modals
  this.modal('delete-confirmation', {
    dismissWithOutsideClick : false,
    dialogClass             : 'small',
    withParams              : {'confirmDeleteResources' : 'resources'},
    actions                 : {confirm                  : 'confirmDelete'}
  });

  this.modal('modal-about', {
    dismissWithOutsideClick : false,
    withParams              : 'showAbout',
    dialogClass             : 'about',
  });

  this.modal('modal-shell', {
    dismissWithOutsideClick : false,
    dismissWithEscape       : false,
    withParams              : 'showShell',
    otherParams             : 'originalModel',
    dialogClass             : 'modal-shell',
  });

  this.modal('modal-console', {
    dismissWithOutsideClick : false,
    dismissWithEscape       : false,
    withParams              : 'showConsole',
    otherParams             : 'originalModel',
    dialogClass             : 'modal-shell',
  });

  this.modal('modal-container-logs', {
    dismissWithOutsideClick : false,
    withParams              : 'showContainerLogs',
    otherParams             : 'originalModel',
    dialogClass             : 'modal-logs',
  });

  this.modal('edit-container', {
    dismissWithOutsideClick : false,
    withParams              : 'editContainer',
    otherParams             : 'originalModel',
  });

  this.modal('edit-host', {
    dismissWithOutsideClick : false,
    withParams              : 'editHost',
    otherParams             : 'originalModel',
  });

  this.modal('edit-apikey', {
    dismissWithOutsideClick : false,
    withParams              : 'editApikey',
    otherParams             : 'originalModel',
  });

  this.modal('edit-registry', {
    dismissWithOutsideClick : false,
    withParams              : 'editRegistry',
    otherParams             : 'originalModel',
  });

  this.modal('edit-environment', {
    dismissWithOutsideClick : false,
    withParams              : 'editEnvironment',
    otherParams             : 'originalModel',
  });

  this.modal('edit-service', {
    dismissWithOutsideClick : false,
    withParams              : 'editService',
    otherParams             : 'originalModel',
  });

  this.modal('edit-aliasservice', {
    dismissWithOutsideClick : false,
    withParams              : 'editAliasService',
    otherParams             : 'originalModel',
  });

  this.modal('edit-externalservice', {
    dismissWithOutsideClick : false,
    withParams              : 'editExternalService',
    otherParams             : 'originalModel',
  });

  this.modal('edit-loadbalancerservice', {
    dismissWithOutsideClick : false,
    withParams              : 'editLoadBalancerService',
    otherParams             : 'originalModel',
  });

  this.modal('edit-account', {
    dismissWithOutsideClick : false,
    withParams              : 'editAccount',
    otherParams             : 'originalModel',
  });

  this.modal('edit-certificate', {
    dismissWithOutsideClick : false,
    withParams              : 'editCertificate',
    otherParams             : 'originalModel',
  });

  this.modal('modal-catalog-launch', {
    dismissWithOutsideClick : true,
    withParams              : 'launchCatalog',
    otherParams             : {originalModel   : 'originalModel', environmentResource : 'environmentResource'}
  });

  this.modal('modal-process-error', {
    dismissWithOutsideClick : true,
    withParams              : 'openProcessesError',
    otherParams             : 'exception'
  });


  this.modal('modal-auditlog-info', {
    dismissWithOutsideClick : true,
    withParams              : 'showAuditLogResponses',
    otherParams             : {requestObject           : 'requestObject', responseObject : 'responseObject'},
  });

  this.modal('modal-confirm-deactivate', {
    dismissWithOutsideClick : true,
    dialogClass             : 'small',
    withParams              : 'showConfirmDeactivate',
    otherParams             : {originalModel           : 'originalModel', action : 'action'},
  });

  // End: Modals
  this.modal('modal-new-driver', {
    dismissWithOutsideClick : true,
    withParams              : 'showNewDriver',
    otherParams             : {originalModel: 'originalModel'},
  });

  // Load any custom routes from additional-routes
  applyRoutes(this);
});

export default Router;
