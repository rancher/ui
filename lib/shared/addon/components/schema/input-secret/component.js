import { isArray } from '@ember/array';
import { next } from '@ember/runloop';
import { ucFirst } from 'shared/utils/util';
import { get, set, computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  intl: service(),

  layout,
  // Inputs
  type:        'secret',
  namespace:   null,
  selectClass: 'form-control',
  valueKey:    'name', // What to set the value as.. 'name' or 'id'

  // For use as a catalog question
  field: null,              // Read default from a schema resourceField
  value: null,              // name or id output string

  selected:         null,  // Selected secret ID
  projectSecrets:   null,
  namespaceSecrets: null,

  init() {
    this._super(...arguments);

    set(this, 'projectSecrets', get(this, 'store').all('secret').filterBy('type', get(this, 'type')));
    set(this, 'namespaceSecrets', get(this, 'store').all('namespacedSecret').filterBy('type', `namespaced${ ucFirst(get(this, 'type')) }`));

    let def = get(this, 'value') || get(this, 'field.default');

    if ( def && !get(this, 'selected') ) {
      var exact;

      get(this, 'projectSecrets').forEach((secret) => {
        if ( def === get(secret, get(this, 'valueKey')) ) {
          exact = get(secret, 'id');
        }
      });

      const namespaceId = get(this, 'namespace.id');

      if ( !exact && namespaceId ) {
        get(this, 'namespaceSecrets').forEach((secret) => {
          if ( def === get(secret, get(this, 'valueKey')) && get(secret, 'namespaceId') === namespaceId) {
            exact = get(secret, 'id');
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
      let secret = get(this, 'projectSecrets').findBy('id', id) || get(this, 'namespaceSecrets').findBy('id', id);

      if ( secret ) {
        set(this, 'selectedSecret', secret);
        str = get(secret, get(this, 'valueKey'));
      } else {
        set(this, 'selectedSecret', null);
      }
    }

    set(this, 'value', str);
  }),
  filtered: computed('projectSecrets.[]', 'namespaceSecrets.[]', 'namespace.id', function() {
    const intl = get(this, 'intl');

    let out = get(this, 'projectSecrets').map((secret) => {
      return {
        label: get(secret, 'name'),
        value: get(secret, 'id'),
        group: intl.t('generic.project'),
      };
    });

    const namespaceId = get(this, 'namespace.id');

    if ( namespaceId ) {
      get(this, 'namespaceSecrets').filterBy('namespaceId', namespaceId).forEach((secret) => {
        out.push({
          label: get(secret, 'name'),
          value: get(secret, 'id'),
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
