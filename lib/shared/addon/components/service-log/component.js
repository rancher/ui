import Ember from 'ember';

export default Ember.Component.extend({
  growl: Ember.inject.service(),
  prefs: Ember.inject.service(),

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
    Ember.run.cancel(this.get('pollTimer'));
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
    Ember.run.cancel(this.get('pollTimer'));
    this.set('pollTimer', Ember.run.later(() => {
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
