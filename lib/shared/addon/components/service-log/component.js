import { cancel, later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  growl: service(),
  prefs: service(),

  model: null,

  pollInterval: 5000,
  pollTimer: null,

  init() {
    this._super();
    this.poll().then(() => {
      this.scheduleTimer();
    });
  },

  willDestroyElement() {
    cancel(this.get('pollTimer'));
  },

  logs: null,
  poll() {
    return this.get('model').followLink('serviceLogs').then((logs) => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      this.set('logs', logs);
    });
  },

  scheduleTimer() {
    cancel(this.get('pollTimer'));
    this.set('pollTimer', later(() => {
      this.poll().then(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.scheduleTimer();
      }).catch((err) => {
        this.get('growl').fromError(err);
      });
    }, this.get('pollInterval')));
  },

  sortBy: 'time',

  headers: [
    {
      name: 'time',
      sort: ['createdTs:desc','id:desc'],
      searchField: 'created',
      translationKey: 'serviceLog.time',
      width: 150,
    },
    {
      name: 'level',
      sort: ['level','createdTs:desc','id:desc'],
      translationKey: 'serviceLog.level',
      width: 100,
    },
    {
      name: 'detail',
      sort: ['description','createdTs:desc','id:desc'],
      searchField: 'description',
      translationKey: 'serviceLog.detail',
    },
  ],
});
