import Component from '@ember/component';
import layout from './template';
import { computed, get } from '@ember/object';
import StatefulPromise from 'shared/utils/stateful-promise';

export default Component.extend({
  layout,

  optionValues:  computed.mapBy('asyncOptions.value', 'value'),
  asyncOptions: computed('content', function() {
    return StatefulPromise.wrap(get(this, 'options'), []);
  }),
  valueArray: computed('values', function() {
    const values = get(this, 'values');

    return Array.isArray(values)
      ? values
      : [values];
  }),
  missingValues: computed('valueArray', 'optionValues', function() {
    const optionValues = get(this, 'optionValues');

    if (optionValues.length === 0) {
      return [];
    }

    return get(this, 'valueArray').filter((value) => {
      return optionValues.indexOf(value) === -1
    });
  }),
  showMessaging: computed('values', 'missingValues.length', function() {
    return get(this, 'values') && get(this, 'missingValues.length') > 0;
  })
});
