import Ember from 'ember';
import { positionDropdown } from 'ui/utils/position-dropdown';

export default Ember.Service.extend({
  model          : null,
  open           : false,
  tooltipActions : null,
  actionToggle   : null,
  actionMenu     : null,

  show: function(model,trigger,toggle) {
    if (this.get('open') && this.get('actionMenu')) {
      this.hide();
    }
    let $parent = this.set('actionParent', $('#resource-actions-parent'));
    let $menu = this.set('actionMenu', $('#resource-actions'));
    let $toggle = this.set('actionToggle', $(toggle||trigger));

    if ( model === this.get('model') && this.get('open') )
    {
      event.preventDefault();
      return;
    }

    this.set('model', model);

    $('BODY').one('click', () => {
      // check to see if we've opened the menu
      // we can get into a state (via accessability navigation) where the
      // menu has been closed but the body click was never fired
      // this will just prevent an null error
      if (this.get('actionMenu') && this.get('actionToggle')) {
        this.hide();
      }
    });

    Ember.run.next(() => {

      if (this.get('tooltipActions')) {
        $menu.addClass('tooltip-actions');
      } else {
        if ($menu.hasClass('tooltip-actions')) {
          $menu.removeClass('tooltip-actions');
        }
      }

      $menu.css('visibility','hidden');
      $menu.removeClass('hide');
      $toggle.addClass('open');
      $parent.addClass('open');

      this.set('open',true);
      // Delay ensure it works in firefox
      Ember.run.next(() => {
        positionDropdown($menu, trigger, true);
        $('#resource-actions-first')[0].focus();
        $menu.css('visibility','visible');
      });
    });
  },

  hide() {
    this.get('actionToggle').removeClass('open');
    this.get('actionParent').removeClass('hide');
    this.get('actionMenu').addClass('hide');
    this.setProperties({
      actionToggle : null,
      actionMenu   : null,
      open         : false,
      model        : null,
    });
  },

  triggerAction: function(actionName) {
    this.get('model').send(actionName);
  },

  activeActions: function() {
    let list = (this.get('model.availableActions')||[]).filter(function(act) {
      return Ember.get(act,'enabled') !== false || Ember.get(act,'divider');
    });

    // Remove dividers at the beginning
    while ( list.get('firstObject.divider') === true )
    {
      list.shiftObject();
    }

    // Remove dividers at the end
    while ( list.get('lastObject.divider') === true )
    {
      list.popObject();
    }

    // Remove consecutive dividers
    let last = null;
    list = list.filter(function(act) {
      let cur = (act.divider === true);
      let ok = !cur || (cur && !last);
      last = cur;
      return ok;
    });

    return list;
  }.property('model.availableActions.[]','model.availableActions.@each.enabled', 'model'),
});
