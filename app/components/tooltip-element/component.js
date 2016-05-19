import Ember from 'ember';

const DELAY = 100;

export default Ember.Component.extend({
  classNameBindings : ['inlineBlock:inline-block','clip:clip'],
  tooltipService   : Ember.inject.service('tooltip'),
  inlineBlock      : true,
  clip             : false,
  model            : null,
  size             : 'default',
  ariaRole         : ['tooltip'],
  textChangedEvent : null,

  showTimer        : null,

  textChanged: Ember.observer('textChangedEvent', function() {
    this.show(this.get('textChangedEvent'));
  }),

  mouseEnter(evt) {
    if ( !this.get('tooltipService.requireClick') )
      {
        let tgt = Ember.$(evt.currentTarget);

        if (this.get('tooltipService.tooltipOpts')) {
          this.set('tooltipService.tooltipOpts', null);
        }

        // Wait for a little bit of time so that the mouse can pass through
        // another tooltip-element on the way to the dropdown trigger of a
        // tooltip-action-menu without changing the tooltip.
        this.set('showTimer', Ember.run.later(() => {
          this.show(tgt);
        }, DELAY));
      }
  },

  show(node) {
    if ( this._state === 'destroying' )
    {
      return;
    }

    let svc = this.get('tooltipService');

    this.set('showTimer', null);
    svc.cancelTimer();

    let out = {
      type          : this.get('type'),
      baseClass     : this.get('baseClass'),
      eventPosition : node.offset(),
      originalNode  : node,
      model         : this.get('model'),
      template      : this.get('tooltipTemplate'),
    };

    if ( this.get('isCopyTo') ) {
      out.isCopyTo = true;
    }

    svc.set('tooltipOpts', out);
  },

  mouseLeave: function() {
    if (!this.get('tooltipService.openedViaContextClick')) {
      if ( this.get('showTimer') ) {
        Ember.run.cancel(this.get('showTimer'));
      }
      else {
        this.get('tooltipService').leave();
      }
    }
  },

  modelObserver: Ember.observer('model', 'textChangedEvent', function() {
    let opts = this.get('tooltipService.tooltipOpts');
    if (opts) {
      this.set('tooltipService.tooltipOpts.model', this.get('model'));
    }
  })
});
