import Ember from 'ember';

export default Ember.Controller.extend({
  sortBy: 'name',
  headers: [
    {
      translationKey: 'generic.name',
      name: 'name',
      sort: ['name'],
    },
    {
      translationKey: 'processesPage.summary.table.running',
      name: 'running',
      sort: ['running','name'],
    },
    {
      translationKey: 'processesPage.summary.table.ready',
      name: 'ready',
      sort: ['ready','name'],
    },
    {
      translationKey: 'processesPage.summary.table.delay',
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
