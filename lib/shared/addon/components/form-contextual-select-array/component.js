import Component from '@ember/component';
import layout from './template';
import { computed, get, set } from '@ember/object';
import StatefulPromise from 'shared/utils/stateful-promise';

export default Component.extend({
  layout,
  content:        [],
  values:         [],
  addButtonClass:   'btn bg-link icon-btn mt-10',
  contentFilter:  null,
  init() {
    this._super(...arguments);
    if (!get(this, 'content')) {
      set(this, 'content', []);
    }

    if (!get(this, 'values')) {
      set(this, 'values', []);
    }
  },
  actions: {
    onAdd() {
      const values = get(this, 'values');

      // We push a null values and replace it so that we can get the filteredContent
      // with the newly selected valu visible to the provider of the contetFilter method.
      values.pushObject(null);
      values.replace(-1, 1, [get(this, 'filteredContent.firstObject.value')]);
    },
    onRemove(index) {
      get(this, 'values').removeAt(index);
    }
  },
  lastValue: computed('values', 'values.[]', {
    get() {
      return get(this, 'values').objectAt(get(this, 'values.length') - 1);
    },
    set(key, value) {
      get(this, 'values').set(get(this, 'values.length') - 1, value);

      return value;
    }
  }),
  canAddMore: computed('filteredContent', function() {
    return get(this, 'filteredContent.length') > 1
      || get(this, 'filteredContent.length') > 0 && get(this, 'values.length') === 0;
  }),
  lastIndex: computed('values.[]', function() {
    return get(this, 'values.length') - 1;
  }),
  asyncContent: computed('content', function() {
    return StatefulPromise.wrap(this.content, []);
  }),
  selections: computed('values.[]', 'asyncContent.value', function() {
    return this.values
      .slice(0, -1)
      .map((value) => {
        const option = get(this, 'asyncContent.value').find((v) => v.value === value);

        return option ? option.label : '';
      });
  }),
  filteredContent: computed('asyncContent.value', 'values.@each', 'values.[]', 'values', function() {
    if (!get(this, 'contentFilter')) {
      return get(this, 'asyncContent.value') || [];
    }

    return this.contentFilter(get(this, 'asyncContent.value'), get(this, 'values').slice(0, -1)) || [];
  }),
});
