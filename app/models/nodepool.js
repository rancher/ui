import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { cancel, later } from '@ember/runloop'
import { get, set } from '@ember/object';
import { alias } from '@ember/object/computed';

const NodePool = Resource.extend({
  type:          'nodePool',
  quantityTimer: null,
  nodeTemplate:  reference('nodeTemplateId'),

  displayProvider: alias('nodeTemplate.displayProvider'),

  incrementQuantity(by) {
    let quantity = get(this, 'quantity');

    quantity += by;
    quantity = Math.max(0, quantity);

    set(this, 'quantity', quantity);

    if ( get(this, 'quantityTimer') ) {
      cancel(get(this, 'quantityTimer'));
    }

    var timer = later(this, function() {
      this.save().catch((err) => {
        get(this, 'growl').fromError('Error updating node pool scale', err);
      });
    }, 500);

    set(this, 'quantityTimer', timer);
  },
});

NodePool.reopenClass({
  mangleOut(data) {
    if ( data && data.hostnamePrefix ) {
      data.hostnamePrefix = data.hostnamePrefix.toLowerCase();
    }

    return data;
  }
});

export default NodePool;
