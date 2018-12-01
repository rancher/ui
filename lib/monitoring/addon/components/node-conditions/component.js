import Component from '@ember/component';
import { get, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from './template';

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

    this.set('conditions', [{
      name:    get(this, 'intl').t('hostsPage.hostPage.conditions.diskSpace'),
      healthy: (conditions.find((c) => c.type === 'OutOfDisk') || {}).status === 'False',
    },
    {
      name:    get(this, 'intl').t('hostsPage.hostPage.conditions.diskPressure'),
      healthy: (conditions.find((c) => c.type === 'DiskPressure') || {}).status === 'False',
    },
    {
      name:    get(this, 'intl').t('hostsPage.hostPage.conditions.memoryPressure'),
      healthy: (conditions.find((c) => c.type === 'MemoryPressure') || {}).status === 'False',
    },
    {
      name:    get(this, 'intl').t('hostsPage.hostPage.conditions.ready'),
      healthy: (conditions.find((c) => c.type === 'Ready') || {}).status === 'True',
    }
    ]);
  },

});
