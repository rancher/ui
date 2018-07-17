import Component from '@ember/component';
import es from 'logging/mixins/target-elasticsearch';
import { get, set } from '@ember/object';

export default Component.extend(es, {
  showAdvanced: false,

  requestsCpuChanged: function() {
    const requestsCpu = get(this, 'requestsCpu');

    set(this, 'config.requestsCpu', requestsCpu * 1000);
  }.observes('requestsCpu'),

  limitsCpuChanged: function() {
    const limitsCpu = get(this, 'limitsCpu');

    set(this, 'config.limitsCpu', limitsCpu * 1000);
  }.observes('limitsCpu'),
  init() {
    this._super(...arguments);
    const requestsCpu = get(this, 'config.requestsCpu');
    const limitsCpu = get(this, 'config.limitsCpu');

    set(this, 'requestsCpu', requestsCpu / 1000);
    set(this, 'limitsCpu', limitsCpu / 1000);
  },

  didInsertElement() {
    this.$('#embedded-cpuRequests').focus()
  },

});
