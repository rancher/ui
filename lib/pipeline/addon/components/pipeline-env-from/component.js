import Component from '@ember/component';
import layout from './template'
import { get, set, observer } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  scope: service(),

  layout,

  sources:   null,
  namespace: null,

  init() {
    this._super(...arguments);

    if ( !get(this, 'sources') ) {
      set(this, 'sources', [])
    }

    get(this, 'sources').forEach((source) => {
      set(source, 'source', 'secret');
      if ( source.sourceKey === undefined ) {
        set(source, 'sourceKey', null);
      }
    });

    const projectId = get(this, 'scope.currentProject.id').split(':')[1];

    set(this, 'namespace', { id: `${ projectId }-pipeline` });
  },

  actions: {
    addSource() {
      let source = {
        source:    'secret',
        sourceKey: null
      };

      get(this, 'sources').addObject(source);
    },

    removeSource(source) {
      get(this, 'sources').removeObject(source);
    },
  },

  valueDidChange: observer('sources.@each.{sourceKey,sourceName,targetKey}', function() {
    if (this.changed) {
      this.changed(this.sources);
    }
  }),
});
