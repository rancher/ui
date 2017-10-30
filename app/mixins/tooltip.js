import Ember from 'ember';
import ThrottledResize from 'ui/mixins/throttled-resize';

export default Ember.Mixin.create(ThrottledResize, {
  tooltipContent : null,
  originalNode   : null,
  router         : Ember.inject.service(),
  currentRoute   : null,
  tooltipService : Ember.inject.service('tooltip'),

  didInsertElement() {
    let $el    = Ember.$(this.get('element'));
    let markup = `<div class ='tooltip-caret'></div>`;
    Ember.$(markup).appendTo($el);
  },

  mouseEnter: function() {
    this.get('tooltipService').cancelTimer();
  },
  mouseLeave: function() {
    this.destroyTooltip();
  },

  routeObserver: Ember.on('init', Ember.observer('router.currentRouteName', function() {
    // On init
    if (!this.get('currentRoute')) {
      this.set('currentRoute', this.get('router.currentRouteName'));
    }

    // if we change routes tear down the tooltip
    if (this.get('currentRoute') !== this.get('router.currentRouteName')) {
      this.destroyTooltip();
    }
  })),

  tooltipConstructor: Ember.on('init', Ember.observer('tooltipService.tooltipOpts', function() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      if (this.get('tooltipService.tooltipOpts')) {
        this.constructTooltip();
      }
    });
  })),

  constructTooltip: function() {
    let tts           = this.get('tooltipService');
    let node          = Ember.$(this.element);
    let eventPosition = tts.get('tooltipOpts.eventPosition');
    let position      = this.positionTooltip(node, Ember.$().extend({}, eventPosition));
    let css           = {visibility: 'visible'};
    let classes       = position.placement;

    if ( tts.get('tooltipOpts.isCopyTo') ) {
      css.width = position.width + 1;
    }

    if (tts.tooltipOpts.baseClass) {
      classes += ` ${tts.tooltipOpts.baseClass}`;
    }

    node.offset(position).addClass(classes).css(css);
    if (position.caret) {
      node.find('.tooltip-caret').css('left', position.caret);
    }
  },

  destroyTooltip: function() {
    this.get('tooltipService').startTimer();
  },

  positionTooltip: function(node, position) {

    let windowWidth        = window.innerWidth;
    let eventNode          = this.get('tooltipService.tooltipOpts.originalNode');
    let originalNodeWidth  = eventNode.outerWidth();
    let originalNodeHeight = eventNode.outerHeight();
    let nodeHeight         = node.outerHeight();
    let nodeWidth          = node.outerWidth();
    let overridePlacement  = this.get('tooltipService.tooltipOpts.placement');
    let self               = this;

    if ( overridePlacement ) {
      position.placement = overridePlacement;
    } else if (nodeWidth >= position.left) {
      position.placement = 'left';
    } else if (nodeWidth >= (windowWidth - position.left)) {
      position.placement = 'right';
    } else if (nodeHeight >= position.top) {
      position.placement = 'bottom';
    } else {
      position.placement = 'top';
    }

    switch ( position.placement ) {
    case 'left':
      position.left      = horizontalViewport(position.left + originalNodeWidth + 7, position);
      position.top       = position.top + (originalNodeHeight/2) - (nodeHeight/2);
      break;
    case 'right':
      position.left      = horizontalViewport(position.left - nodeWidth - 7, position);
      position.top       = position.top + (originalNodeHeight/2) - (nodeHeight/2);
      break;
    case 'bottom':
      position.left      = horizontalViewport(position.left + (originalNodeWidth/2) - (nodeWidth/2), position);
      position.top       = position.top +  originalNodeHeight + 7;
      break;
    default:
      position.left      = horizontalViewport(position.left + (originalNodeWidth/2) - (nodeWidth/2), position);
      position.top       = position.top -  (nodeHeight + 7);
      break;
    }


    function horizontalViewport(left, position) {
      if (left < (nodeWidth/2)) {
        let centerOfDot  =  self.get('tooltipService.tooltipOpts.originalNode').offset().left + (originalNodeWidth/2);
        let widthOfEvent = originalNodeWidth;
        let pushFromLeft = 10;
        left             = pushFromLeft;
        position.caret = centerOfDot - pushFromLeft - widthOfEvent/2;
      }
      return left;
    }

    position.width = nodeWidth;

    return position;
  },
});
