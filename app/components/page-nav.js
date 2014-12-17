import Ember from "ember";

export default Ember.Component.extend({
  tagName: 'nav',
  expand: false,

  actions: {
    toggleExpand: function() {
      this.set('expand', !this.get('expand'));
    }
  },

  didInsertElement: function() {
    var self = this;
    var lis = this.$('LI');

    lis.tooltip({
      placement: 'right',
      trigger: 'manual'
    });

    lis.on('mouseenter', function(event) {
      if ( !self.get('expand') )
      {
        $(event.target).tooltip('show');
      }
    });

    lis.on('mouseleave', function(event) {
      $(event.target).tooltip('hide');
    });
  },

  expandDidChange: function() {
    if ( this.get('expand') )
    {
      this.$('LI').tooltip('hide');
    }
  }.observes('expand')
});
