import Ember from 'ember';
import ThrottledResize from 'ui/mixins/throttled-resize';

export default Ember.Mixin.create(ThrottledResize, {
  tooltipContent  : null,
  originalNode    : null,

  tooltipService: Ember.inject.service('tooltip'),

  mouseEnter: function() {
    this.get('tooltipService').cancelTimer();
  },
  mouseLeave: function() {
    this.destroyTooltip();
  },

  tooltipConstructor: function() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      if (this.get('tooltipService.tooltipOpts')) {
        this.constructTooltip();
      }
    });
  }.observes('tooltipService.tooltipOpts').on('init'),

  constructTooltip: function() {
    var node          = Ember.$(this.element);
    var eventPosition = this.get('tooltipService.tooltipOpts.eventPosition');
    var position      = this.positionTooltip(node, eventPosition);

    node.offset(position).addClass(position.placement).css('visibility', 'visible');
  },

  destroyTooltip: function() {
    this.get('tooltipService').startTimer();
  },

  positionTooltip: function(node, position) {

    var windowWidth        = window.innerWidth;
    var originalNodeWidth  = this.get('tooltipService.tooltipOpts.originalNode').outerWidth();
    var originalNodeHeight = this.get('tooltipService.tooltipOpts.originalNode').outerHeight();
    var nodeHeight         = node.outerHeight();
    var nodeWidth          = node.outerWidth();

    if (nodeWidth >= position.left) {
      position.placement = 'left';
      position.top       = position.top + (originalNodeHeight/2) - (nodeHeight/2);
      position.left      = position.left + originalNodeWidth + 7;

    } else if (nodeWidth >= (windowWidth - position.left)) {
      position.placement = 'right';
      position.left      = position.left - nodeWidth - 7;
      position.top       = position.top + (originalNodeHeight/2) - (nodeHeight/2);

    } else if (nodeHeight >= position.top) {
      position.placement = 'bottom';
      position.top       = position.top +  originalNodeHeight + 7;
      position.left      = position.left + (originalNodeWidth/2) - (nodeWidth/2);

    } else {
      position.placement = 'top';
      position.top       = position.top -  (nodeHeight + 7);
      position.left      = position.left + (originalNodeWidth/2) - (nodeWidth/2);

    }

    return position;
  },
});
