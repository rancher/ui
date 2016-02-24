import Ember from 'ember';
import BootstrapFixes from 'ui/utils/bootstrap-fixes';

export default Ember.Service.extend({
  scrolling      : Ember.inject.service(),

  model          : null,
  open           : false,
  tooltipActions : null,

  show: function(model,trigger,toggle) {
    var $menu = $('#resource-actions');
    var $toggle = $(toggle||trigger);

    if ( model === this.get('model') && this.get('open') )
    {
      event.preventDefault();
      return;
    }

    this.set('model', model);

    $('BODY').one('click', () => {
      Ember.run(() => {
        $toggle.removeClass('open');
        $menu.addClass('hide');
        this.set('open', false);
        this.set('model', null);
      });
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

      this.set('open',true);

      BootstrapFixes.positionDropdown($menu, trigger, true);
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
