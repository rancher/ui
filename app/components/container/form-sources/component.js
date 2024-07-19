import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';

export default Component.extend({
  intl:        service(),
  store:       service('store'),
  layout,
  sources:     null,
  statusClass: null,
  fetching:    false,
  editing:     true,
  headers:     [
    {
      name:           'source',
      sort:           ['source'],
      translationKey: 'formSources.type.label',
      searchField:    'source',
    },
    {
      name:           'sourceName',
      sort:           ['sourceName', 'source'],
      searchField:    'sourceName',
      translationKey: 'formSources.source.label',
    },
    {
      name:           'sourceKey',
      sort:           ['sourceKey', 'sourceName', 'source'],
      searchField:    'sourceKey',
      translationKey: 'formSources.prefixOrKey.label',
    },
    {
      name:           'targetKey',
      sort:           ['targetKey', 'sourceKey', 'sourceName', 'source'],
      searchField:    'targetKey',
      translationKey: 'formSources.prefix.label',
    }
  ],

  init() {
    this._super(...arguments);

    if (!this.sources ) {
      set(this, 'sources', [])
    }

    this.sources.forEach((source) => {
      if ( source.sourceKey === undefined ) {
        set(source, 'sourceKey', null);
      }
    });
  },
  actions: {
    addSource() {
      let source = {
        source:    'secret',
        sourceKey: null
      };

      this.sources.addObject(source);
    },
    removeSource(source) {
      this.sources.removeObject(source);
    },
  },

});
