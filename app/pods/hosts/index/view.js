import Ember from 'ember';

export default Ember.View.extend({
  templateName: 'hosts/index',
  classNames: ['hosts','clearfix'],
  tagName: 'section',

  resizeFn: null,
  didInsertElement: function() {
    this._super();

    this.set('resizeFn', this.onResize.bind(this));
    $(window).on('resize', this.get('resizeFn'));
    this.onResize();
  },

  willDestroyElement: function() {
    $(window).off('resize', this.get('resizeFn'));
  },

  sectionWidth: null, // Will be reset on didInsertElement and resize
  columnWidth: 265, // Must also change public/css/host.css .host-column

  onResize: function() {
    this.set('sectionWidth', $('.hosts').width());
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

  sections: function() {
    var sections = this.get('context.byZone');
    var columnCount = this.get('columnCount');

    var out = Object.keys(sections).map(function(zoneId) {
      var zone = sections[zoneId].zone;
      var hosts = sections[zoneId].hosts;
      var columns = [];
      var idx;

      for ( var i = 0 ; i < hosts.get('length') ; i++ )
      {
        idx = i % columnCount;
        if ( !columns[idx] )
        {
          columns[idx] = [];
        }

        columns[idx].push(hosts.objectAt(i));
      }

      return {
        zone: zone,
        columns: columns
      };
    });

    out.sort(function(a,b) {
      var an = a.zone.get('name');
      var bn = b.zone.get('name');
      return (an < bn ? -1 : (an > bn ? 1 : 0) );
    });

    return out;
  }.property('context.byZone.[]','columnCount'),
});
