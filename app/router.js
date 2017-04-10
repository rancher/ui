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

  this.route('signup', {path: '/signup'});
  this.route('verify', {path: '/verify/:verify_token'});
  this.route('verify-reset-password', {path: '/verify-reset-password/:verify_token'});
  this.route('login', function() {
    this.route('index', {path: '/'});
    this.route('shibboleth-auth');
  });
  this.route('logout');

  this.route('authenticated', {path: '/'}, function() {

    this.route('style-guide', {path: '/style-guide'});
    this.route('dummy-dev', {path: '/dev'});

    this.route('user-settings', {path: '/user-settings', resetNamespace: true});

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
        this.route('pools', {path: '/pools'});
        this.route('list', {path: '/list'});
      });
      this.route('process', {path: '/processes/:process_id'});

      this.route('audit-logs');
      this.route('machine');
    });

    this.route('project', {path: '/env/:project_id'}, function() {
      this.route('index', {path: '/'});
      this.route('waiting');

      this.route('containers', {resetNamespace: true}, function() {
        this.route('new', {path: '/add'});
        this.route('index', {path: '/'});

        this.route('container', {path: '/:container_id', resetNamespace: true}, function() {
          this.route('commands');
          this.route('healthcheck');
          this.route('labels');
          this.route('networking');
          this.route('ports');
          this.route('scheduling');
          this.route('security');
          this.route('volumes');
        });
      });

      this.route('scaling-groups', {path: '/scaling-groups', resetNamespace: true}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'});
      });

      this.route('balancers', {path: '/balancers', resetNamespace: true}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'});
      });

      this.route('dns', {path: '/dns', resetNamespace: true}, function() {
        this.route('index', {path: '/'});
        this.route('new', {path: '/add'});
      });

      this.route('service', {path: '/services/:scaling_group_id', resetNamespace: true}, function() {
        this.route('containers');
        this.route('labels');
        this.route('ports');
        this.route('links');
        this.route('log');
        this.route('port-rules');
        this.route('certificates');
      });

      this.route('stack', {path: '/stack/:stack_id', resetNamespace: true}, function() {
        this.route('index', {path: '/'});
        this.route('code',  {path: '/code'});
        this.route('graph', {path: '/graph'});
        this.route('chart', {path: '/chart'});
      });

      this.route('new-stack', {path: '/import-compose', resetNamespace: true});

      this.route('hosts', {path: '/hosts', resetNamespace: true}, function() {
        this.route('index', {path: '/'});

        this.route('container-cloud', {path: '/container-cloud'}, function() {
          this.route('index', {path: '/'});
          this.route('add', {path: '/add/:cloud_id'});
        });

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

      // Infrastructure
      this.route('infrastructure-tab', {path: '/infra', resetNamespace: true}, function() {
        // Popup Routes
        this.route('console', {path: '/console', resetNamespace: true});
        this.route('container-log', {path: '/container-log', resetNamespace: true});

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

        this.route('secrets', {path: '/secrets', resetNamespace: true}, function() {
          this.route('new', {path: '/add'});
          this.route('index', {path: '/'});
          this.route('detail', {path: '/:certificate_id'});
        });
      });

      this.route('swarm-tab', {path: '/swarm', resetNamespace: true}, function() {
        this.route('console');
        this.route('dashboard');
      });

      // Mesos
      this.route('mesos-tab', {path: '/mesos', resetNamespace: true}, function() {
      });

      // Catalog
      this.route('apps-tab', {path: '/apps', resetNamespace: true}, function() {
        this.route('index', {path: '/'});

        this.route('catalog-tab', {path: '/catalog', resetNamespace: true}, function() {
          this.route('index', {path: '/'});
          this.route('launch', {path: '/:template'});
        });
      });

      this.route('k8s-tab', {path: '/kubernetes', resetNamespace: true});

      this.route('help');

      this.route('api', {path: '/api'}, function() {
        this.route('keys', {path: '/keys'});
        this.route('hooks', {path: '/hooks'}, function() {
          this.route('new-receiver', {path: '/add-receiver'});
          this.route('edit-receiver', {path: '/receiver/:receiver_id'});
        });
      });
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
