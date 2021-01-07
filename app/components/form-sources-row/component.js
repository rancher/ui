import Component from '@ember/component';
import layout from './template';
import { get, set, computed, observer } from '@ember/object';

const SOURCES = [
  {
    id:       null,
    label:    'Key/Value Pair'
  },
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

const RESOURCE_KEY_OPTS = [
  {
    id:    'limits.cpu',
    label: 'limits.cpu'
  },
  {
    id:    'limits.ephemeral-storage',
    label: 'limits.ephemeral-storage'
  },
  {
    id:    'limits.memory',
    label: 'limits.memory'
  },
  {
    id:    'requests.cpu',
    label: 'requests.cpu'
  },
  {
    id:    'requests.ephemeral-storage',
    label: 'requests.ephemeral-storage'
  },
  {
    id:    'requests.memory',
    label: 'requests.memory'
  },
]

export default Component.extend({
  layout,
  tagName:         'tr',
  source:          null,
  editing:         true,
  secretOnly:      false,
  specificKeyOnly: false,

  selectedSecret:  null,
  sources:         SOURCES,
  resourceKeyOpts: RESOURCE_KEY_OPTS,

  onSourceChange: observer('source.source', function() {
    set(this, 'source.value', null);
    set(this, 'source.valueFrom', null);
    set(this, 'source.name', null);
  }),

  prefixOrKeys: computed('selectedConfigMap', 'selectedSecret', 'source.{source,name,valueFrom}', 'specificKeyOnly', function() {
    let prefix = {
      id:    null,
      label: 'All'
    };
    let sourceType = get(this, 'source.source');
    let valueFrom = get(this, 'source.valueFrom');
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

    if (valueFrom) {
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
