import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import layout from './template'

export default Component.extend({
  intl: service(),
  layout,

  model:       null,
  tagName:     'TR',
  classNames:  'main-row',
  bulkActions: true,

  showNotifierValue: computed('model.notifierType', function() {
    const t = get(this, 'model.notifierType');

    return t === 'slack' || t === 'email';
  }),
});
