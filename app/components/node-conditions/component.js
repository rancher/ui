import Component from '@ember/component';
import { get, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from './template';
const FALSE = 'False';
const TRUE = 'True';

export default Component.extend({
  intl: service(),
  layout,

  conditionsSource: null,

  conditions: null,

  init() {
    this._super(...arguments);
    this.setConditions();
  },

  updateConditions: observer('conditionsSource.@each.{status,reason,message}', function() {
    this.setConditions();
  }),
  setConditions() {
    const conditions = get(this, 'conditionsSource');

    const outOfDisk = conditions.find((c) => c.type === 'OutOfDisk');
    const diskPressure = conditions.find((c) => c.type === 'DiskPressure');
    const memoryPressure = conditions.find((c) => c.type === 'MemoryPressure');
    const ready = conditions.find((c) => c.type === 'Ready');

    this.set('conditions', [{
      name:    get(this, 'intl').t('hostsPage.hostPage.conditions.diskSpace'),
      healthy: !outOfDisk || get(outOfDisk, 'status') === FALSE,
    },
    {
      name:    get(this, 'intl').t('hostsPage.hostPage.conditions.diskPressure'),
      healthy: !diskPressure || get(diskPressure, 'status') === FALSE,
    },
    {
      name:    get(this, 'intl').t('hostsPage.hostPage.conditions.memoryPressure'),
      healthy: !memoryPressure || get(memoryPressure, 'status') === FALSE,
    },
    {
      name:    get(this, 'intl').t('hostsPage.hostPage.conditions.ready'),
      healthy: ready && get(ready, 'status') === TRUE,
    }
    ]);
  },

});
