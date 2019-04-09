import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import C from 'ui/utils/constants';
import { resolve } from 'rsvp';
import { later } from '@ember/runloop';

export default Mixin.create({
  globalStore: service(),
  growl:       service(),

  app:        null,
  appName:    null,
  nsName:     null,
  appVersion: null,
  cluster:    null,
  project:    null,

  enabled:        false,
  ready:          false,
  saved:          false,
  confirmDisable: false,
  timeOutAnchor:  null,

  init() {
    this._super(...arguments);

    set(this, 'enabled', !!get(this, 'app') && get(this, 'app.state') !== 'removing');
    set(this, 'ready', !!get(this, 'app') && C.ACTIVEISH_STATES.includes(get(this, 'app.state')));
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
            window.location.href = window.location.href;
          }, 1000);
        })
        .catch((err) => {
          get(this, 'growl').fromError(get(err, 'body.message'));
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

        set(this, 'ready', C.ACTIVEISH_STATES.includes(get(app, 'state')));
      }).finally(() => {
        this.startAppStatusChecker();
      });
    } else {
      set(this, 'ready', false);
    }
  },

  save(cb, answers) {
    const customAnswers = get(this, 'customAnswers') || {};

    Object.keys(customAnswers).forEach((key) => {
      answers[key] = customAnswers[key];
    });

    set(this, 'answers', answers);

    if ( get(this, 'enabled') ) {
      this.update(cb);
    } else {
      this.create(cb);
    }
  },

  update(cb) {
    get(this, 'globalStore').rawRequest({
      url:    get(this, 'app.actionLinks.upgrade'),
      method: 'POST',
      data:   {
        answers:    get(this, 'answers'),
        externalId: get(this, 'app.externalId'),
      }
    }).then(() => {
      set(this, 'saved', true);
    }).finally(() => {
      cb();
    });
  },

  create(cb) {
    let promise;

    if ( get(this, 'nsExists') ) {
      promise = resolve();
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
            app:     res.body,
          });
          set(this, 'saved', true);
        })
        .catch((err) => {
          get(this, 'growl').fromError(get(err, 'body.message'));
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
        get(this, 'growl').fromError(get(err, 'body.message'));
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
});
