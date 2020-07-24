import Component from '@ember/component';
import layout from './template';
import { INSTANCE_TYPES } from 'shared/utils/amazon';
import { set } from '@ember/object';

export default Component.extend({
  layout,
  classNames:    ['row', 'mb-20'],
  editing:       true,
  instanceTypes: INSTANCE_TYPES,
  keyPairs:      null,

  actions: {
    setTags(section) {
      const { model: { tags = {} } } = this;

      for (let key in section) {
        tags[key] = section[key];
      }

      set(this, 'model.tags', tags);
    },

    setLabels(section) {
      const { model: { labels = {} } } = this;

      for (let key in section) {
        labels[key] = section[key];
      }

      set(this, 'model.labels', labels);
    },
  },

  removeNodeGroup() {
    throw new Error('remove node group action is required!');
  },

});
