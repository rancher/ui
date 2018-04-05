import { isArray } from '@ember/array';
import { get, set, computed, observer} from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  intl: service(),

  // Inputs
  value: null,
  namespace: null,
  selectClass: 'form-control',
  valueKey: 'name', // What to set the value as.. 'name' or 'id'

  // For use as a catalog question
  field: null,              // Read default from a schema resourceField
  value: null,              // name or id output string

  selected: null,  // Selected secret ID
  projectSecrets: null,
  namespaceSecrets: null,

  findSecret() {

  },

  init() {
    this._super(...arguments);

    set(this,'projectSecrets', get(this,'store').all('secret'));
    set(this,'namespaceSecrets', get(this,'store').all('namespacedSecret'));

    let def = get(this,'field.default');
    if ( def && !get(this,'selected') ) {
      var exact;

      get(this,'projectSecrets').forEach((secret) => {
        if ( def === get(secret,'name') ) {
          exact = get(secret,'id');
        }
      });

      const namespaceId = get(this,'namespace.id');
      if ( !exact && namespaceId ) {
        get(this,'namespaceSecrets').forEach((secret) => {
          if ( def === get(secret,'name') && get(secret,'namespaceId') === namespaceId) {
            exact = get(secret,'id');
          }
        });
      }

      set(this,'selected', exact || null);
    }
  },

  filtered: computed('projectSecrets.[]','namespaceSecrets.[]','namespace.id', function() {
    const intl = get(this,'intl');

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

    let exclude = get(this,'exclude');
    if ( exclude ) {
      if ( !isArray(exclude) ) {
        exclude = [exclude];
      }

      out = out.filter(x => !exclude.includes(x.value));
    }

    return out.sortBy('group','label');
  }),

  selectedChanged: observer('selected', function() {
    let id = get(this,'selected');
    let str = null;

    if ( id ) {
      let secret = get(this, 'projectSecrets').findBy('id', id) || get(this, 'namespaceSecrets').findBy('id', id);
      if ( secret ) {
        get(this, 'selectedSecret')(secret);
        str = get(secret,get(this,'valueKey'));
      } else {
        get(this, 'selectedSecret')(null);
      }
    }

    set(this,'value', str);
  }),
});
