import Ember from 'ember';
import Stats from 'ui/utils/stats';

export default Ember.View.extend({
  classNames: ['host-detail'],
  isDetail: true,

  resizeFn: null,

  stats: null,

  didInsertElement: function() {
    this._super();

    this.set('resizeFn', this.onResize.bind(this));
    $(window).on('resize', this.get('resizeFn'));
    this.onResize();

    this.set('stats', Stats.create({
      resource: this.get('context.model'),
      cpuCanvas: '#cpuGraph',
      memoryCanvas: '#memoryGraph'
    }));

  },

  willDestroyElement: function() {
    $(window).off('resize', this.get('resizeFn'));
    this.get('stats').disconnect();
  },

  sectionWidth: null, // Will be reset on didInsertElement and resize
  columnWidth: 245, // Must also change public/css/host.css .instance-column

  onResize: function() {
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
    var instances = this.get('context.instances');
    if ( instances )
    {
      for ( i = 0 ; i < columnCount ; i++ )
      {
        out.push([]);
      }

      for ( i = 0 ; i < instances.get('length') ; i++ )
      {
        out[ i % columnCount ].pushObject(instances.objectAt(i));
      }
    }

    return out;
  }.property('context.instances.[]','columnCount'),
});
