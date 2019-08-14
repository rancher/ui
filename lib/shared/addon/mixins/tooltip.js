import { scheduleOnce } from '@ember/runloop';
import { get, set, observer } from '@ember/object';
import { on } from '@ember/object/evented';
import $ from 'jquery';
import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import ThrottledResize from 'shared/mixins/throttled-resize';

export default Mixin.create(ThrottledResize, {
  tooltipContent: null,
  originalNode:   null,
  router:         service(),
  currentRoute:   null,
  tooltipService: service('tooltip'),

  didInsertElement() {
    let $el    = $(get(this, 'element'));
    let markup = `<div class ='tooltip-caret'></div>`;

    $(markup).appendTo($el);
  },

  mouseEnter() {
    get(this, 'tooltipService').cancelTimer();
  },
  mouseLeave() {
    this.destroyTooltip();
  },

  routeObserver: on('init', observer('router.currentRouteName', function() {
    // On init
    if (!get(this, 'currentRoute')) {
      set(this, 'currentRoute', get(this, 'router.currentRouteName'));
    }

    // if we change routes tear down the tooltip
    if (get(this, 'currentRoute') !== get(this, 'router.currentRouteName')) {
      this.destroyTooltip();
    }
  })),

  tooltipConstructor: on('init', observer('tooltipService.tooltipOpts', function() {
    scheduleOnce('afterRender', this, function() {
      if (get(this, 'tooltipService.tooltipOpts')) {
        this.constructTooltip();
      }
    });
  })),

  constructTooltip() {
    let tts           = get(this, 'tooltipService');
    let node          = $(this.element);
    let eventPosition = tts.get('tooltipOpts.eventPosition');
    let position      = this.positionTooltip(node, $().extend({}, eventPosition));
    let css           = { visibility: 'visible' };
    let classes       = position.placement;

    if ( tts.get('tooltipOpts.isCopyTo') ) {
      css.width = position.width + 1;
    }

    if (tts.tooltipOpts.baseClass) {
      classes += ` ${ tts.tooltipOpts.baseClass }`;
    }

    node.offset(position).addClass(classes).css(css);
    if (position.caret) {
      node.find('.tooltip-caret').css('left', position.caret);
    }
  },

  destroyTooltip() {
    get(this, 'tooltipService').startTimer();
  },

  positionTooltip(tooltipNode, position) {
    let windowWidth       = window.innerWidth;
    let eventNode         = get(this, 'tooltipService.tooltipOpts.originalNode');
    let eventNodeWidth    = eventNode.outerWidth();
    let eventNodeHeight   = eventNode.outerHeight();
    let tooltipNodeHeight = tooltipNode.outerHeight();
    let tooltipNodeWidth  = tooltipNode.outerWidth();
    let overridePlacement = get(this, 'tooltipService.tooltipOpts.placement');

    if ( overridePlacement ) {
      position.placement = overridePlacement;
    } else if (tooltipNodeWidth >= position.left) {
      position.placement = 'left';
    } else if (tooltipNodeWidth >= (windowWidth - position.left)) {
      position.placement = 'right';
    } else if (tooltipNodeHeight >= position.top) {
      position.placement = 'bottom';
    } else {
      position.placement = 'top';
    }

    switch ( position.placement ) {
    case 'left':
      position.left      = horizontalViewport(position.left + eventNodeWidth + 7, position);
      position.top       = position.top + (eventNodeHeight / 2) - (tooltipNodeHeight / 2);
      break;
    case 'right':
      position.left      = horizontalViewport(position.left - tooltipNodeWidth - 7, position);
      position.top       = position.top + (eventNodeHeight / 2) - (tooltipNodeHeight / 2);
      break;
    case 'bottom':
      position.left      = horizontalViewport(position.left + (eventNodeWidth / 2) - (tooltipNodeWidth / 2), position);
      position.top       = position.top +  eventNodeHeight + 7;
      break;
    default:
      position.left      = horizontalViewport(position.left + (eventNodeWidth / 2) - (tooltipNodeWidth / 2), position);
      position.top       = position.top -  (tooltipNodeHeight + 7);
      break;
    }


    function horizontalViewport(leftEdge2CenterPoint, position) {
      if (leftEdge2CenterPoint < (tooltipNodeWidth / 2)) {
        let pushFromLeft     = 10;

        leftEdge2CenterPoint = Math.max(0, leftEdge2CenterPoint) + pushFromLeft;
        position.caret       = position.left - leftEdge2CenterPoint;
      }

      return leftEdge2CenterPoint;
    }

    position.width = tooltipNodeWidth;

    return position;
  },
});
