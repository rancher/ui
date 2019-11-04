import Component from '@ember/component';
import { computed, get } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import StatefulPromise from 'shared/utils/stateful-promise';



export default Component.extend({
  keyContent:           [],
  keyValuePairs:               [],
  addButtonClass:       'btn bg-link icon-btn mt-10',
  keyLabel:             'formKeyValue.key.label',
  valueLabel:           'formKeyValue.value.label',
  keyPlaceholder:       'formKeyValue.key.placeholder',
  valuePlaceholder:     'formKeyValue.value.placeholder',
  actions:          {
    onAdd() {
      const keyValuePairs = get(this, 'keyValuePairs');

      // We push a null keyValuePair and replace it so that we can get the filteredContent
      // with the newly selected value visible to the provider of the contetFilter method.
      keyValuePairs.pushObject(null);
      keyValuePairs.replace(-1, 1, [{
        key:   get(this, 'filteredKeyContent.firstObject.value'),
        value: ''
      }]);
    },
    onRemove(index) {
      get(this, 'keyValuePairs').removeAt(index);
    }
  },
  asyncKeyContent: computed('keyContent', function() {
    return StatefulPromise.wrap(get(this, 'keyContent'), []);
  }),
  selections: computed('keyValuePairs.[]', 'asyncKeyContent.value', function() {
    return this.keyValuePairs
      .slice(0, -1)
      .map((kvp) => {
        const option = get(this, 'asyncKeyContent.value').find((v) => v.value === kvp.key);

        return  ObjectProxy.create({
          content: kvp,
          label:   option ? option.label : '',
        });
      });
  }),
  lastValue: computed('keyValuePairs', 'keyValuePairs.[]', {
    get() {
      return get(this, 'keyValuePairs').objectAt(get(this, 'keyValuePairs.length') - 1);
    },
    set(key, value) {
      get(this, 'keyValuePairs').set(get(this, 'keyValuePairs.length') - 1, value);

      return value;
    }
  }),
  canAddMore: computed('filteredKeyContent', function() {
    return get(this, 'filteredKeyContent.length') > 1
            || get(this, 'filteredKeyContent.length') > 0 && get(this, 'keyValuePairs.length') === 0;
  }),
  lastIndex: computed('keyValuePairs.[]', function() {
    return get(this, 'keyValuePairs.length') - 1;
  }),
  filteredKeyContent: computed('asyncKeyContent.value', 'keyValuePairs.@each', 'keyValuePairs.[]', 'keyValuePairs', function() {
    if (!get(this, 'keyContentFilter')) {
      return get(this, 'asyncKeyContent.value') || [];
    }

    return this.keyContentFilter(get(this, 'asyncKeyContent.value'), get(this, 'keyValuePairs').slice(0, -1)) || [];
  }),
});
