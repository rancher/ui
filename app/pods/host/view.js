import Ember from 'ember';
import Stats from 'ui/utils/stats';
import ThrottledResize from 'ui/mixins/throttled-resize';

export default Ember.View.extend(ThrottledResize, {
  classNames: ['host-detail'],

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
    this._super();
    this.get('stats').disconnect();
  },

  sectionWidth: null, // Will be reset on didInsertElement and resize
  columnWidth: 134, // Must also change public/css/host.css .instance-column

  onResize: function() {
    console.log('onResize 2');
    this.set('sectionWidth', $('.instances').width());
  },

  columnCount: function() {
    var colWidth = this.get('columnWidth');
    var mainWidth = this.get('sectionWidth');
    if ( !mainWidth )
    {
      // The width isn't known until after the first render...
      return 3;
    }

    return Math.max(1,Math.floor(mainWidth/colWidth));
  }.property('sectionWidth','columnWidth'),

  columns: function() {
    var columnCount = this.get('columnCount');

    var out = [];
    var i;

    for ( i = 0 ; i < columnCount ; i++ )
    {
      out.push([]);
    }

    var instances = this.get('context.instances');
    if ( instances )
    {

      for ( i = 0 ; i < instances.get('length') ; i++ )
      {
        out[ i % columnCount ].pushObject(instances.objectAt(i));
      }
    }

    return out;
  }.property('context.instances.[]','columnCount'),
});
