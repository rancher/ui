import { get } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Service.extend({
  model:          null,
  open:           false,
  tooltipActions: null,
  actionToggle:   null,
  actionMenu:     null,
  actionContext:  null,
  app:            service(),

  setActionItems(model, context) {
    this.set('model', model);
    this.set('context', context);
  },

  triggerAction(actionName) {
    this.get('model').send(actionName, this.get('context'));
  },

  activeActions: computed('model._availableActions.@each.{enabled,single,divider}', 'modelo', function() {
    let list = (this.get('model._availableActions') || []).filter((act) => {
      if ( get(act, 'single') === false || get(act, 'enabled') === false ) {
        return false;
      }

      return true;
    });

    // Remove dividers at the beginning
    while ( list.get('firstObject.divider') === true ) {
      list.shiftObject();
    }

    // Remove dividers at the end
    while ( list.get('lastObject.divider') === true ) {
      list.popObject();
    }

    // Remove consecutive dividers
    let last = null;

    list = list.filter((act) => {
      let cur = (act.divider === true);
      let ok = !cur || (cur && !last);

      last = cur;

      return ok;
    });

    return list;
  }),
});
