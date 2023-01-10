import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import { get, computed } from '@ember/object';

export default Component.extend({
  scope:   service(),
  session:  service(),

  layout,
  model:   null,
  idx:     '',
  disk:    {},
  disks:   [],

  bootOrderContent: computed('disk.bootOrder', 'disks.@each.bootOrder', 'idx', function() {
    let bootOrderContent = [];
    const bootOrder = get(this, 'disk').bootOrder;
    const bootOrders = get(this, 'disks').map((disk) => {
      return disk.bootOrder;
    })

    const disks = get(this, 'disks') || [];
    const idx = get(this, 'idx');

    for (let i = 0; i < disks.length + 1; i++) {
      if (!bootOrders.includes(i) || i === 0 || i === bootOrder) {
        if (!(idx === 0 && i === 0)) {
          bootOrderContent.push({
            label: i === 0 ? 'N/A' : `${ i }`,
            value: i
          });
        }
      }
    }


    return bootOrderContent
  }),
});
