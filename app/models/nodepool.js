import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { cancel, later } from '@ember/runloop'
import { get, set, computed } from '@ember/object';

export default Resource.extend({
  type: 'nodePool',
  nodeTemplate: reference('nodeTemplateId'),

  quantityTimer: null,
  incrementQuantity(by) {
    let quantity = get(this,'quantity');
    quantity += by;
    quantity = Math.max(0, quantity);

    set(this, 'quantity', quantity);

    if ( get(this, 'quantityTimer') ) {
      cancel(get(this, 'quantityTimer'));
    }

    var timer = later(this, function() {
      this.save().catch((err) => {
        get(this, 'growl').fromError('Error updating node pool scale',err);
      });
    }, 500);

    set(this, 'quantityTimer', timer);
  },

  availableActions: computed('links.{remove}', function() {
    //let a = get(this,'actionLinks');
    let l = get(this,'links');

    let out = [
      { label: 'action.remove',     icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true},
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi',      enabled: true},
    ];

    return out;
  }),

});
