import Ember from 'ember';
import Stats from 'ui/utils/stats';

export default Ember.Component.extend({
  model: null,
  stats: null,

  didRender: function() {
    this._super();

    if ( !this.get('stats') )
    {
      this.set('stats', Stats.create({
        resource: this.get('model'),
        cpuCanvas: '#cpuGraph',
        memoryCanvas: '#memoryGraph'
      }));
    }
  },

  willDestroyElement: function() {
    this._super();
    var stats = this.get('stats');
    if ( stats )
    {
      stats.disconnect();
    }
  },
});
