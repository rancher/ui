import Ember from 'ember';
import Stats from 'ui/utils/stats';

export default Ember.Component.extend({
  stats: null,

  didInsertElement: function() {
    this._super();

    this.set('stats', Stats.create({
      resource: this.get('model'),
      cpuCanvas: '#cpuGraph',
      memoryCanvas: '#memoryGraph'
    }));

  },

  willDestroyElement: function() {
    this._super();
    this.get('stats').disconnect();
  },
});
