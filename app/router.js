import { inject as service } from '@ember/service';
import EmberRouter from '@ember/routing/router';
import config from './config/environment';

//const Router = Ember.Router.extend({
const Router = EmberRouter.extend({
  modalService: service('modal'),
  location: config.locationType,
  willTransition(){
    if (this.get('modalService.modalVisible')) {
      this.get('modalService').toggleModal();
    }
  },
});

Router.map(function() {
  this.mount('login', {path: '/login'});

  this.route('ie');
  this.route('index');
  this.route('failWhale', {path: '/fail'});
  this.route('not-found', {path: '*path'});

  this.route('signup', {path: '/signup'});
  this.route('verify', {path: '/verify/:verify_token'});
  this.route('verify-reset-password', {path: '/verify-reset-password/:verify_token'});

  // this.route('login', function() {
  //   this.route('index', {path: '/'});
  //   this.route('shibboleth-auth');
  // });
  this.route('logout');

  this.route('verify-auth');
  this.route('authenticated', {path: '/'}, function() {
    // Global
    this.mount('global-admin', { path: '/g', resetNamespace: true});
    this.route('dummy-dev', {path: '/dev'});

    this.route('apikeys');
    this.route('node-templates');
    this.route('prefs');

    // Per-Cluster
    this.route('cluster', {path: '/c/:cluster_id'}, function() {
      this.route('index', {path: '/'});
      this.route('edit');

      this.mount('pipeline');

      this.route('ns', {path: '/namespaces'}, function() {
        this.route('index', {path: '/'});
        this.route('edit', {path: '/:namespace_id'});
        this.route('new', {path: '/add'});
      });

      this.route('nodes', function() {
        this.route('index', {path: '/'});
        this.route('node', {path: '/:node_id', resetNamespace: true});
      });

      this.route('projects', {path: '/projects'}, function() {
        this.route('index', {path: '/'});
        this.route('edit', {path: '/:project_id'});
        this.route('new', {path: '/add'});
      });

      this.route('security', function() {
        this.route('index', {path: '/'});
        this.route('members', function() {
          this.route('index', {path: '/'});
          this.route('edit', {path: '/edit/:role_id'});
          this.route('new', {path: '/add'});
        });
      });

      this.mount('logging', {path: '/logging'});
      this.mount('alert', {path: '/alerts'});
      this.route('notifier', {path: '/notifiers'}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'});
        this.route('edit', {path: '/:notifier_id'});
      });

      this.route('storageClasses', {path: '/storage-classes'}, function() {
        this.route('index', {path: '/'});
        this.route('edit', {path: '/:storage_class_id'});
        this.route('new', {path: '/add'});
      });
    });

    // Per-Project
    this.route('project', {path: '/p/:project_id'}, function() {
      this.route('index', {path: '/'});

      // alert/logging
      this.mount('logging', {path: '/logging'});
      this.mount('alert', {path: '/alerts'});

      this.mount('pipeline');

      // Workload
      this.route('containers', {resetNamespace: true}, function() {
        this.route('run', {path: '/run'});
        this.route('index', {path: '/'});

        this.route('container', {path: '/:container_id', resetNamespace: true});
      });

      this.route('ingresses', {resetNamespace: true}, function() {
        this.route('run', {path: '/run'});
        this.route('index', {path: '/'});

        this.route('ingress', {path: '/:ingress_id', resetNamespace: true});
      });

      this.route('dns', function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});
        this.route('detail', {path: '/:record_id'}, function() {
          this.route('edit');
        });
      });

      this.route('volumes', {path: '/volumes', resetNamespace: true}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'});

        this.route('volume', {path: '/volume/:volume_id', resetNamespace: true});
      });

      this.route('workload', {path: '/workload/:workload_id', resetNamespace: true});
      this.route('new-stack', {path: '/import-yaml', resetNamespace: true});


      // Catalog
      this.route('apps-tab', {path: '/apps', resetNamespace: true}, function() {
        this.route('index', {path: '/'});

        this.route('catalog-tab', {path: '/catalog', resetNamespace: true}, function() {
          this.route('index', {path: '/'});
          this.route('launch', {path: '/:template'});
        });
      });

      // Resources

      // @TODO-2.0
      this.route('stack', {path: '/stack/:stack_id', resetNamespace: true}, function() {
        this.route('index', {path: '/'});
        this.route('code',  {path: '/code'});
        this.route('graph', {path: '/graph'});
        this.route('chart', {path: '/chart'});
      });

      this.route('security', function() {
        this.route('index', {path: '/'});
        this.route('members', function() {
          this.route('index', {path: '/'});
          this.route('edit', {path: '/edit/:role_id'});
          this.route('new', {path: '/add'});
        });
      });

      this.route('certificates', function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});
        this.route('detail', {path: '/:certificate_id'}, function() {
          this.route('edit');
        });
      });

      this.route('registries', function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});
        this.route('detail', {path: '/:registry_id'}, function() {
          this.route('edit');
        });
      });

      this.route('secrets', function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});
        this.route('detail', {path: '/:secret_id'}, function() {
          this.route('edit');
        });
      });

      this.route('hooks', {path: '/api/hooks'}, function() {
        this.route('new-receiver', {path: '/add-receiver'});
        this.route('edit-receiver', {path: '/receiver/:receiver_id'});
      });

      this.route('help');

      // Popup Routes
      this.route('console', {path: '/console', resetNamespace: true});
      this.route('container-log', {path: '/container-log', resetNamespace: true});

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
