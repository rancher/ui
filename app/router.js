import { inject as service } from '@ember/service';
import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import { get } from '@ember/object';

const Router = EmberRouter.extend({
  modalService: service('modal'),
  location:     config.locationType,
  init() {
    this._super(...arguments);

    this.on('routeWillChange', ( /* transition */ ) => {
      if (get(this, 'modalService.modalVisible')) {
        get(this, 'modalService').toggleModal();
      }
    });
  }
});

Router.map(function() {
  this.mount('login', { path: '/login' });

  this.route('ie');
  this.route('index');
  this.route('failWhale', { path: '/fail' });
  this.route('not-found', { path: '*path' });

  this.route('signup', { path: '/signup' });
  this.route('verify', { path: '/verify/:verify_token' });
  this.route('verify-reset-password', { path: '/verify-reset-password/:verify_token' });

  this.route('logout');

  this.route('verify-auth');
  this.route('verify-auth-azure');
  this.route('update-password', { path: '/update-password' });
  this.route('update-critical-settings', { path: '/update-setting' });

  this.route('authenticated', { path: '/' }, function() {
    this.route('dashboard', { path: '/dashboard/*path' });

    this.mount('nodes', {
      path:           '/n',
      resetNamespace: true
    });
    // Global
    this.mount('global-admin', {
      path:           '/g',
      resetNamespace: true
    });
    this.route('dummy-dev', { path: '/dev' });

    this.route('apikeys');
    this.route('prefs');

    // Per-Cluster
    this.route('cluster', { path: '/c/:cluster_id' }, function() {
      this.route('index', { path: '/' });
      this.route('edit');
      this.route('cluster-catalogs', { path: '/catalogs' })

      this.route('cis/scan');
      this.route('cis/scan/detail', { path: '/cis/scan/detail/:scan_id' });


      this.route('backups', function() {
        this.route('index', { path: '/' });
      });

      this.route('nodes', function() {
        this.route('index', { path: '/' });
      });

      this.mount('monitoring');
      this.mount('istio');

      this.route('projects', { path: '/projects-namespaces' }, function() {
        this.route('index', { path: '/' });
        this.route('edit', { path: '/project/:project_id' });
        this.route('new', { path: '/project/add' });
        this.route('edit-ns', { path: '/ns/:namespace_id' });
        this.route('new-ns', { path: '/ns/add' });
      });

      this.route('security', function() {
        this.route('index', { path: '/' });
        this.route('members', function() {
          this.route('index', { path: '/' });
          this.route('edit', { path: '/edit/:role_id' });
          this.route('new', { path: '/add' });
        });
      });

      this.mount('logging', { path: '/logging' });
      this.mount('alert', { path: '/alerts' });
      this.route('notifier', { path: '/notifiers' }, function() {
        this.route('index', { path: '/' });
        this.route('new', { path: '/add' });
        this.route('edit', { path: '/:notifier_id' });
      });

      this.route('storage', function() {
        this.route('classes', function() {
          this.route('index', { path: '/' });
          this.route('new', { path: '/add' });
          this.route('detail', { path: '/:storage_class_id' }, function() {
            this.route('edit');
          });
        });

        this.route('persistent-volumes', function() {
          this.route('index', { path: '/' });
          this.route('new', { path: '/add' });
          this.route('detail', { path: '/:persistent_volume_id' }, function() {
            this.route('edit');
          });
        });
      });
    });

    // Per-Project
    this.route('project', { path: '/p/:project_id' }, function() {
      this.route('index', { path: '/' });

      this.route('ns', { path: '/ns' }, function() {
        this.route('index', { path: '/' });
      });

      // alert/logging
      this.mount('logging', { path: '/logging' });
      this.mount('alert', { path: '/alerts' });

      this.mount('pipeline');
      this.mount('monitoring');
      this.mount('istio');

      // Workload
      this.route('containers', {
        path:           '/workloads',
        resetNamespace: true
      }, function() {
        this.route('run', { path: '/run' });
        this.route('index', { path: '/' });

        this.route('pod', {
          path:           '/:pod_id',
          resetNamespace: true
        });

        this.route('container', {
          path:           '/:pod_id/container/:container_name',
          resetNamespace: true
        })
      });

      this.route('ingresses', { resetNamespace: true }, function() {
        this.route('run', { path: '/run' });
        this.route('index', { path: '/' });

        this.route('ingress', {
          path:           '/:ingress_id',
          resetNamespace: true
        });
      });

      this.route('dns', function() {
        this.route('new', { path: '/add' });
        this.route('index', { path: '/' });
        this.route('detail', { path: '/:record_id' }, function() {
          this.route('edit');
        });
      });

      this.route('hpa', function() {
        this.route('new', { path: '/add' });
        this.route('index', { path: '/' });
        this.route('detail', { path: '/:hpa_id' }, function() {
          this.route('edit');
        });
      });

      this.route('volumes', {
        path:           '/volumes',
        resetNamespace: true
      }, function() {
        this.route('index', { path: '/' });
        this.route('new', { path: '/add' });
        this.route('detail', { path: '/:volume_id' });
      });

      this.route('workload', {
        path:           '/workload/:workload_id',
        resetNamespace: true
      });


      this.route('project-catalogs', { path: '/catalogs' });

      // Catalog
      this.route('apps-tab', {
        path:           '/apps',
        resetNamespace: true
      }, function() {
        this.route('index', { path: '/' });
        this.route('detail', { path: '/:app_id' });


        this.route('catalog-tab', {
          path:           '/catalog',
          resetNamespace: true
        }, function() {
          this.route('index', { path: '/' });
          this.route('launch', { path: '/:template' });
        });
      });

      // Resources
      this.route('security', function() {
        this.route('index', { path: '/' });
        this.route('members', function() {
          this.route('index', { path: '/' });
          this.route('edit', { path: '/edit/:role_id' });
          this.route('new', { path: '/add' });
        });
      });

      this.route('certificates', function() {
        this.route('new', { path: '/add' });
        this.route('index', { path: '/' });
        this.route('detail', { path: '/:certificate_id' }, function() {
          this.route('edit');
        });
      });

      this.route('registries', function() {
        this.route('new', { path: '/add' });
        this.route('index', { path: '/' });
        this.route('detail', { path: '/:registry_id' }, function() {
          this.route('edit');
        });
      });

      this.route('secrets', function() {
        this.route('new', { path: '/add' });
        this.route('index', { path: '/' });
        this.route('detail', { path: '/:secret_id' }, function() {
          this.route('edit');
        });
      });

      this.route('config-maps', function() {
        this.route('new', { path: '/add' });
        this.route('index', { path: '/' });
        this.route('detail', { path: '/:config_map_id' }, function() {
          this.route('edit');
        });
      });

      this.route('hooks', { path: '/api/hooks' }, function() {
        this.route('new-receiver', { path: '/add-receiver' });
        this.route('edit-receiver', { path: '/receiver/:receiver_id' });
      });

      this.route('help');

      // Popup Routes
      this.route('console');
      this.route('container-log');
    });

    // End: Authenticated
  });


  // Load any custom routes from additional-routes
  // var cb = applyRoutes("application");
  // if( cb ) {
  //   cb.apply(this);
  // }
  // clearRoutes();
});


export default Router;
