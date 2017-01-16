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
});
