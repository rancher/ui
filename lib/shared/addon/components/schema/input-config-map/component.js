import { isArray } from '@ember/array';
import { next } from '@ember/runloop';
import { get, set, computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  intl: service(),

  layout,
  // Inputs
  namespace:   null,
  selectClass: 'form-control',
  valueKey:    'name', // What to set the value as.. 'name' or 'id'

  // For use as a catalog question
  field: null,              // Read default from a schema resourceField
  value: null,              // name or id output string

  selected:            null,  // Selected configMap ID
  namespaceConfigMaps: null,

  init() {
    this._super(...arguments);

    set(this, 'namespaceConfigMaps', get(this, 'store').all('configMap'));

    let def = get(this, 'value') || get(this, 'field.default');

    if ( def && !get(this, 'selected') ) {
      var exact;

      const namespaceId = get(this, 'namespace.id');

      if ( !exact && namespaceId ) {
        get(this, 'namespaceConfigMaps').forEach((configMap) => {
          if ( def === get(configMap, 'name') && get(configMap, 'namespaceId') === namespaceId) {
            exact = get(configMap, 'id');
          }
        });
      }

      next(() => {
        set(this, 'selected', exact || null);
      });
    }
  },

  selectedChanged: observer('selected', function() {
    let id = get(this, 'selected');
    let str = null;

    if ( id ) {
      let configMap = get(this, 'namespaceConfigMaps').findBy('id', id);

      if ( configMap ) {
        set(this, 'selectedConfigMap', configMap);
        str = get(configMap, get(this, 'valueKey'));
      } else {
        set(this, 'selectedConfigMap', null);
      }
    }

    set(this, 'value', str);
  }),
  filtered: computed('namespaceConfigMaps.[]', 'namespace.id', function() {
    const intl = get(this, 'intl');

    let out = [];

    const namespaceId = get(this, 'namespace.id');

    if ( namespaceId ) {
      get(this, 'namespaceConfigMaps').filterBy('namespaceId', namespaceId).forEach((configMap) => {
        out.push({
          label: get(configMap, 'name'),
          value: get(configMap, 'id'),
          group: intl.t('generic.namespace'),
        });
      });
    }

    let exclude = get(this, 'exclude');

    if ( exclude ) {
      if ( !isArray(exclude) ) {
        exclude = [exclude];
      }

      out = out.filter((x) => !exclude.includes(x.value));
    }

    return out.sortBy('group', 'label');
  }),

});
