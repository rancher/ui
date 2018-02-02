import Component from '@ember/component';
import layout from './template';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,
  intl: service(),

  policies: null,
  config: null,

  init() {
    this._super(...arguments);
    if (!this.get('expand')) {
      this.set('expand', function(item) {
        item.toggleProperty('expanded');
      });
    }
  },

  choices: computed('policies.@each.{name,id}', function() {
    const out = [
      {name: get(this,'intl').t('generic.none'), id: null},
    ]

    out.pushObjects(get(this,'policies')||[]);

    return out;
  }),

});
