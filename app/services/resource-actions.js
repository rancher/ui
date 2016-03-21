import Ember from 'ember';
import BootstrapFixes from 'ui/utils/bootstrap-fixes';

export default Ember.Service.extend({
  scrolling      : Ember.inject.service(),

  model          : null,
  open           : false,
  tooltipActions : null,
  actionToggle   : null,
  actionMenu     : null,

  show: function(model,trigger,toggle) {
    var $parent = this.set('actionParent', $('#resource-actions-parent'));
    var $menu = this.set('actionMenu', $('#resource-actions'));
    var $toggle = this.set('actionToggle', $(toggle||trigger));

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

      $menu.removeClass('hide');
      $toggle.addClass('open');
      $parent.addClass('open');

      this.set('open',true);
      $('#resource-actions-first')[0].focus();
      BootstrapFixes.positionDropdown($menu, trigger, true);
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

  openChanged: function() {
    if ( this.get('open') )
    {
      this.get('scrolling').disable();
    }
    else
    {
      this.get('scrolling').enable();
    }
  }.observes('open'),

  triggerAction: function(actionName) {
    this.get('model').send(actionName);
  },

  activeActions: function() {
    var list = (this.get('model.availableActions')||[]).filter(function(act) {
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
    var last = null;
    list = list.filter(function(act) {
      var cur = (act.divider === true);
      var ok = !cur || (cur && !last);
      last = cur;
      return ok;
    });

    return list;
  }.property('model.availableActions.[]','model.availableActions.@each.enabled'),
});
