import Ember from 'ember';
import ThrottledResize from 'ui/mixins/throttled-resize';

export default Ember.Mixin.create(ThrottledResize, {
  tooltipContent : null,
  originalNode   : null,
  router         : Ember.inject.service("-routing"),
  currentRoute   : null,

  tooltipService: Ember.inject.service('tooltip'),

  mouseEnter: function() {
    this.get('tooltipService').cancelTimer();
  },
  mouseLeave: function() {
    this.destroyTooltip();
  },

  routeObserver: Ember.observer('router.currentRouteName', function() {
    // On init
    if (!this.get('currentRoute')) {
      this.set('currentRoute', this.get('router.currentRouteName'));
    }

    // if we change routes tear down the tooltip
    if (this.get('currentRoute') !== this.get('router.currentRouteName')) {
      this.destroyTooltip();
    }
  }).on('init'),

  tooltipConstructor: function() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      if (this.get('tooltipService.tooltipOpts')) {
        this.constructTooltip();
      }
    });
  }.observes('tooltipService.tooltipOpts').on('init'),

  constructTooltip: function() {
    let tts           = this.get('tooltipService');
    let node          = Ember.$(this.element);
    let eventPosition = tts.get('tooltipOpts.eventPosition');
    let position      = this.positionTooltip(node, eventPosition);
    let css           = {visibility: 'visible'};
    let classes       = position.placement;

    if ( tts.get('tooltipOpts.isCopyTo') ) {
      css.width = position.width + 1;
    }

    if (tts.tooltipOpts.baseClass) {
      classes += ` ${tts.tooltipOpts.baseClass}`;
    }

    node.offset(position).addClass(classes).css(css);
  },

  destroyTooltip: function() {
    this.get('tooltipService').startTimer();
  },

  positionTooltip: function(node, position) {

    let windowWidth        = window.innerWidth;
    let originalNodeWidth  = this.get('tooltipService.tooltipOpts.originalNode').outerWidth();
    let originalNodeHeight = this.get('tooltipService.tooltipOpts.originalNode').outerHeight();
    let nodeHeight         = node.outerHeight();
    let nodeWidth          = node.outerWidth();
    let overridePlacement   = this.get('tooltipService.tooltipOpts.placement');

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
      position.top       = position.top + (originalNodeHeight/2) - (nodeHeight/2);
      position.left      = position.left + originalNodeWidth + 7;
      break;
    case 'right':
      position.left      = position.left - nodeWidth - 7;
      position.top       = position.top + (originalNodeHeight/2) - (nodeHeight/2);
      break;
    case 'bottom':
      position.top       = position.top +  originalNodeHeight + 7;
      position.left      = position.left + (originalNodeWidth/2) - (nodeWidth/2);
      break;
    default:
      position.top       = position.top -  (nodeHeight + 7);
      position.left      = position.left + (originalNodeWidth/2) - (nodeWidth/2);
    }

    position.width = nodeWidth;

    return position;
  },
});
