import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import C from 'ui/utils/constants';
import { resolve } from 'rsvp';
import { later } from '@ember/runloop';
import { getOwner } from '@ember/application';

export default Mixin.create({
  globalStore:    service(),
  growl:          service(),
  router:         service(),

  app:            null,
  appName:        null,
  nsName:         null,
  appVersion:     null,
  cluster:        null,
  project:        null,
  timeOutAnchor:  null,

  enabled:        false,
  ready:          false,
  saved:          false,
  confirmDisable: false,
  forceUpgrade:   false,

  init() {
    this._super(...arguments);

    setProperties(this, {
      enabled: !!get(this, 'app') && get(this, 'app.state') !== 'removing',
      ready:   !!get(this, 'app') && C.ACTIVEISH_STATES.includes(get(this, 'app.state'))
    })

    this.startAppStatusChecker();
  },

  actions: {
    disable() {
      const url = get(this, 'app.links.self');

      get(this, 'globalStore')
        .rawRequest({
          url,
          method: 'DELETE',
        })
        .then(() => {
          setTimeout(() => {
            window.location.href = window.location.href; // eslint-disable-line no-self-assign
          }, 1000);
        })
        .catch((err) => {
          this.showError(err)
        })
    },

    promptDisable() {
      set(this, 'confirmDisable', true);
      later(this, function() {
        set(this, 'confirmDisable', false);
      }, 10000);
    },
  },

  startAppStatusChecker() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    const timeOutAnchor = setTimeout(() => {
      this.queryStatus();
    }, 30000);

    set(this, 'timeOutAnchor', timeOutAnchor);
  },

  queryStatus(){
    const url = get(this, 'app.links.self');

    if ( url ) {
      get(this, 'globalStore').rawRequest({
        url,
        method: 'GET',
      }).then((res) => {
        const app = get(res, 'body');

        setProperties(this, {
          enabled: get(app, 'state') !== 'removing',
          ready:   C.ACTIVEISH_STATES.includes(get(app, 'state')),
          app:     get(this, 'globalStore').createRecord({
            type: 'app',
            ...app
          }),
        })
      }).finally(() => {
        this.startAppStatusChecker();
      });
    } else {
      set(this, 'ready', false);
    }
  },

  save(cb, answers, refresh = false) {
    const customAnswers = get(this, 'customAnswers') || {};

    Object.keys(customAnswers).forEach((key) => {
      answers[key] = customAnswers[key];
    });

    set(this, 'answers', answers);

    if ( get(this, 'enabled') ) {
      this.update(cb);
      if (get(this, 'actions.upgrade')) {
        this.send('upgrade');
      }
    } else {
      this.create(cb);
    }
    if (refresh) {
      this.refresh()
    }
  },

  update(cb) {
    const {
      templateVersion,
      app,
    } = this;
    const { externalIdInfo } = app;
    const currentVersion   = get(this, 'apps.firstObject.externalIdInfo.version');

    if ( !templateVersion || !currentVersion ) {
      return cb(false);
    }

    const data = {
      answers:    get(this, 'answers'),
      externalId: get(app, 'externalId')
        .replace(`version=${ get(externalIdInfo, 'version') }`, `version=${ templateVersion }`),
    };

    if (this.forceUpgrade) {
      set(data, 'forceUpgrade', true);
    }

    get(this, 'globalStore').rawRequest({
      url:    get(this, 'app.actionLinks.upgrade'),
      method: 'POST',
      data
    })
      .then(() => {
        set(this, 'saved', true);
      })
      .catch((err) => {
        this.showError(err)
      })
      .finally(() => {
        cb();
      });
  },

  create(cb) {
    let promise;

    if ( get(this, 'nsExists') ) {
      if (get(this, 'nsNeedMove')) {
        promise = this.moveNamespace(cb);
      } else {
        promise = resolve();
      }
    } else {
      promise = this.createNamespace(cb);
    }
    promise.then(() => {
      get(this, 'globalStore')
        .rawRequest({
          url:    `/v3/projects/${ get(this, 'project.id') }/app`,
          method: 'POST',
          data:   {
            answers:         get(this, 'answers'),
            externalId:      get(this, 'appVersion'),
            name:            get(this, 'appName'),
            projectId:       get(this, 'project.id'),
            targetNamespace: get(this, 'nsName')
          }
        })
        .then((res) => {
          setProperties(this, {
            enabled: true,
            app:     get(this, 'globalStore').createRecord({
              ...res.body,
              type: 'app',
            }),
          });
          set(this, 'saved', true);
          if (this.doneSaving) {
            this.doneSaving()
          }
        })
        .catch((err) => {
          this.showError(err)
        })
        .finally(() => {
          cb();
        });
    })
  },

  createNamespace(cb) {
    return get(this, 'globalStore')
      .rawRequest({
        url:    `/v3/clusters/${ get(this, 'cluster.id') }/namespace`,
        method: 'POST',
        data:   {
          name:      get(this, 'nsName'),
          projectId: get(this, 'project.id')
        }
      })
      .catch((err) => {
        this.showError(err)
        cb();
      })
  },

  moveNamespace(cb) {
    return get(this, 'globalStore')
      .rawRequest({
        url:    `/v3/clusters/${ get(this, 'cluster.id') }/namespace/${ get(this, 'namespace.id') }?action=move`,
        method: 'POST',
        data:   { projectId: get(this, 'project.id') }
      })
      .catch((err) => {
        this.showError(err)
        cb();
      })
  },

  willDestroyElement() {
    this.clearTimeOut();
    this._super();
  },

  clearTimeOut() {
    const timeOutAnchor = get(this, 'timeOutAnchor');

    if ( timeOutAnchor ){
      clearTimeout(timeOutAnchor);
      set(this, 'timeOutAnchor', timeOutAnchor);
    }
  },

  refresh() {
    const currentRouteName = get(this, 'router.currentRouteName');
    const routeAddons = ['global-admin.']
    let routeName = currentRouteName

    routeAddons.map((r) => {
      if (currentRouteName.startsWith(r)) {
        routeName = currentRouteName.replace(r, '')
      }
    })

    const currentRouteInstance = getOwner(this).lookup(`route:${ routeName }`);

    currentRouteInstance.send('refresh');
  },

  showError(err) {
    get(this, 'growl').fromError('Error', get(err, 'body.message'));
  },
});
