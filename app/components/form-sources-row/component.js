import Component from '@ember/component';
import layout from './template';
import { get, set, computed } from '@ember/object';

const SOURCES = [
  {
    id:       'configMap',
    label:    'Config Map',
  },
  {
    id:       'field',
    label:    'Field',
  },
  {
    id:       'resource',
    label:    'Resource',
  },
  {
    id:       'secret',
    label:    'Secret',
  }
];

export default Component.extend({
  layout,
  tagName:         'tr',
  source:          null,
  editing:         true,
  secretOnly:      false,
  specificKeyOnly: false,

  selectedSecret: null,
  sources:        SOURCES,

  prefixOrTarget: computed('source.sourceKey', {
    get() {
      if ( get(this, 'source.source') !== 'field' && (get(this, 'source.sourceKey') === null || get(this, 'source.sourceKey') === undefined) ) {
        return get(this, 'source.prefix');
      } else {
        return get(this, 'source.targetKey');
      }
    },
    set(key, value) {
      if ( get(this, 'source.source') !== 'field' && (get(this, 'source.sourceKey') === null || get(this, 'source.sourceKey') === undefined) ) {
        return set(this, 'source.prefix', value);
      } else {
        return set(this, 'source.targetKey', value);
      }
    }
  }),

  prefixOrKeys: computed('source.sourceName', 'selectedSecret', 'selectedConfigMap', function() {
    let prefix = {
      id:    null,
      label: 'All'
    };
    let sourceType = get(this, 'source.source');
    let sourceName = get(this, 'source.sourceName');
    let out = get(this, 'specificKeyOnly') ? [] : [prefix];
    let selected;

    switch (sourceType) {
    case 'secret':
      selected = get(this, 'selectedSecret');
      break;
    case 'configMap':
      selected = get(this, 'selectedConfigMap');
      break;
    }

    if (sourceName) {
      if (selected && get(selected, 'data')) {
        let keys = Object.keys(get(selected, 'data'));

        if (keys) {
          keys.forEach((sk) => {
            out.addObject({
              id:    sk,
              label: sk
            });
          })
        }
      }
    }

    return out;
  }),

});
