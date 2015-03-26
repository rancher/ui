import Ember from 'ember';
import Stats from 'ui/utils/stats';

export default Ember.View.extend({
  classNames: ['instance-detail'],

  stats: null,

  didInsertElement: function() {
    this._super();

    this.set('stats', Stats.create({
      resource: this.get('context.model'),
      cpuCanvas: '#cpuGraph',
      memoryCanvas: '#memoryGraph'
    }));
  },

  willDestroyElement: function() {
    this.get('stats').disconnect();
  },
});
