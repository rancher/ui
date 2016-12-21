import Ember from 'ember';
import config from './config/environment';
import {applyRoutes, clearRoutes} from 'ui/utils/additional-routes';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('ie');
  this.route('index');
  this.route('failWhale', {path: '/fail'});
  this.route('not-found', {path: '*path'});

  this.route('login', function() {
    this.route('index', {path: '/'});
    this.route('shibboleth-auth');
  });
  this.route('logout');
  this.route('authenticated', {path: '/'}, function() {

    this.route('dummy-dev', {path: '/dev'});
    // Settings
    this.route('settings', {resetNamespace: true}, function() {
      this.route('projects', {path: '/env'}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'});
        this.route('new-template', {path: '/add-template'});
        this.route('edit-template', {path: '/template/:template_id'});
        this.route('detail', {path: '/:project_id'});
      });
    });

    // Admin
    this.route('admin-tab', {path: '/admin', resetNamespace: true}, function() {
      this.route('auth', {path: '/access'}, function() {
        this.route('activedirectory');
        this.route('azuread');
        this.route('github');
        this.route('openldap');
        this.route('localauth', {path: 'local'});
        this.route('shibboleth');
      });

      this.route('settings');
      this.route('ha');

      this.route('accounts', {path: '/accounts'}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'});
      });

      this.route('processes', {path: '/processes'}, function() {
        this.route('index', {path: '/'});
        this.route('process', {path: '/:process_id'});
      });

      this.route('audit-logs');
      this.route('machine');
    });

    this.route('project', {path: '/env/:project_id'}, function() {
      this.route('index', {path: '/'});
      this.route('waiting');

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
            this.route('commands');
            this.route('networking');
            this.route('healthcheck');
            this.route('scheduling');
            this.route('security');
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

        this.route('backuptargets', {resetNamespace: true}, function() {
          this.route('index', {path: '/'});
        });
        this.route('backuptargets.new-target', {path: '/add-target', resetNamespace: true});

        this.route('storagepools', {resetNamespace: true}, function() {
          this.route('index', {path: '/'});
          this.route('pools', {path: '/pools'});
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
        this.route('service.new', {path: '/add-service', resetNamespace: true});
        this.route('service.new-virtualmachine', {path: '/add-vm-service', resetNamespace: true});
        this.route('service.new-balancer', {path: '/add-balancer', resetNamespace: true});
        this.route('service.new-alias', {path: '/add-alias', resetNamespace: true});
        this.route('service.new-external', {path: '/add-external', resetNamespace: true});

        this.route('stacks', {path: '/stacks', resetNamespace: true}, function() {
          this.route('index', {path: '/'});
          this.route('advanced', {path: '/advanced'});
          this.route('new', {path: '/add'});

          this.route('stack', {path: '/:stack_id', resetNamespace: true}, function() {
            this.route('index', {path: '/'});
            this.route('code', {path: '/code'});
            this.route('graph', {path: '/graph'});
            this.route('chart', {path: '/chart'});

            this.route('service', {path: '/services/:service_id', resetNamespace: true}, function() {
              this.route('containers');
              this.route('labels');
              this.route('ports');
              this.route('links');
              this.route('log');
              this.route('port-rules');
              this.route('certificates');
            });
          });
        });
      });

      this.route('swarm-tab', {path: '/swarm', resetNamespace: true}, function() {
        this.route('console');
      });

      // Mesos
      this.route('mesos-tab', {path: '/mesos', resetNamespace: true}, function() {
      });

      // Catalog
      this.route('catalog-tab', {path: '/catalog', resetNamespace: true}, function() {
        this.route('index', {path: '/'});
        this.route('launch', {path: '/:template'});
      });

      // Kubernetes
      this.route('k8s-tab', {path: '/kubernetes', resetNamespace: true}, function() {
        this.route('index', {path: '/'});
        this.route('error', {path: '/error'});

        this.route('apply', {path: '/apply'});
        this.route('kubectl', {path: '/kubectl'});
        this.route('dashboard', {path: '/dashboard'});

        this.route('namespaces', {path: '/namespaces'}, function() {
          this.route('index', {path: '/'});
        });

        this.route('namespace', {path: '/:namespace_id'}, function() {
          this.route('index', {path: '/'});

          this.route('stacks', {path: '/stacks'}, function() {
            this.route('stack', {path: '/:name'});
          });

          this.route('deployments', {path: '/deployments'}, function() {
            this.route('deployment', {path: '/:name'});
          });

          this.route('services', {path: '/services'}, function() {
            this.route('service', {path: '/:name'});
          });

          this.route('replicasets', {path: '/replicasets'}, function() {
            this.route('replicaset', {path: '/:name'});
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


  // Load any custom routes from additional-routes
  var cb = applyRoutes("application");
  if( cb ) {
    cb.apply(this);
  }
  clearRoutes();
});


export default Router;
