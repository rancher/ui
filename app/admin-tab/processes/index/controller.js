import Ember from 'ember';

export default Ember.Controller.extend({
  sortBy: 'name',
  headers: [
    {
      displayName: 'Name',
      name: 'name',
      sort: ['name'],
    },
    {
      displayName: 'Running',
      name: 'running',
      sort: ['running','name'],
    },
    {
      displayName: 'Ready',
      name: 'ready',
      sort: ['ready','name'],
    },
    {
      displayName: 'Delayed',
      name: 'delay',
      sort: ['delay','name'],
    },
  ],

  total: Ember.computed('model.summary.[]', function() {
    let running = 0;
    let ready = 0;
    let delay = 0;

    this.get('model.summary').forEach((summary) => {
      running += summary.get('running')||0;
      ready += summary.get('ready')||0;
      delay += summary.get('delay')||0;
    });

    return Ember.Object.create({
      processName: 'Total',
      running: running,
      ready: ready,
      delay: delay,
    });
  }),
});
