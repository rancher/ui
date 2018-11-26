import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import {
  get, set, setProperties, computed, observer
} from '@ember/object';
import Component from '@ember/component';
import { next } from '@ember/runloop';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import layout from './template';
import {
  ARECORD, CNAME, ALIAS, WORKLOAD, SELECTOR
} from 'ui/models/dnsrecord';
import ChildHook from 'shared/mixins/child-hook';

export default Component.extend(ViewNewEdit, ChildHook, {
  intl: service(),

  layout,
  model: null,

  recordType:      null,
  namespace:       alias('model.namespace'),

  init() {
    this._super(...arguments);

    let type = get(this, 'model.recordType') || ARECORD;

    setProperties(this, { recordType: type, });
  },

  actions: {
    setAlias(ids) {
      set(this, 'model.targetDnsRecordIds', ids);
    },

    setWorkload(ids) {
      set(this, 'model.targetWorkloadIds', ids);
    },

    setSelector(map) {
      set(this, 'model.selector', map);
    },
  },

  namespaceDidChange: observer('namespace.id', function() {
    if (get(this, 'recordType') === 'workload') {
      if ( get(this, 'model.targetWorkloads').some((target) => target.namespaceId !== get(this, 'namespace.id')) ) {
        set(this, 'model.targetWorkloadIds', null);
        set(this, 'recordType', null);

        next(() => {
          set(this, 'recordType', 'workload');
        });
      }
    }
  }),

  /*
  targetServicesAsMaps: null,
  targetIpArray: null,
  stack: null,
  stackErrors: null,
*/

  workloadsChoices: computed('namespace.id', 'workloads.[]', function() {
    const namespaceId = get(this, 'namespace.id');

    return (get(this, 'workloads') || []).filter((w) => get(w, 'namespaceId') === namespaceId);
  }),

  willSave() {
    get(this, 'model').clearTypesExcept(get(this, 'recordType'));
    set(this, 'model.namespaceId', get(this, 'namespace.id') || '__placeholder__');
    const self = this;
    const sup = this._super;

    if ( get(this, 'namespaceErrors.length') ) {
      return false;
    }

    return this.applyHooks('_beforeSaveHooks').then(() => {
      set(this, 'model.namespaceId', get(this, 'namespace.id'));

      return sup.apply(self, ...arguments);
    });
  },

  validate() {
    this._super(...arguments);
    const errors = get(this, 'errors') || [];
    const intl = get(this, 'intl');

    const aliasTargets = (get(this, 'model.targetDnsRecords') || []);
    const aliases = aliasTargets.length;
    const aliasesToCname = aliasTargets.filterBy('recordType', CNAME).length;
    const selectorKeys = Object.keys(get(this, 'model.selector') || {}).length;
    const workloads = (get(this, 'model.targetWorkloads') || []).length;

    switch ( get(this, 'recordType') ) {
    case ARECORD:
      if ( get(this, 'model.ipAddresses.length') < 1 ) {
        errors.pushObject(intl.t('editDns.errors.targetRequired'));
      }
      break;

    case CNAME:
      if ( !get(this, 'model.hostname') ) {
        errors.pushObject(intl.t('editDns.errors.targetRequired'));
      }
      break;

    case ALIAS:
      if ( aliases < 1 ) {
        errors.pushObject(intl.t('editDns.errors.targetRequired'));
      }

      if ( aliasesToCname > 1 ) {
        errors.pushObject(intl.t('editDns.errors.multipleCname'));
      }

      if ( aliasesToCname >= 1 && aliases > aliasesToCname ) {
        errors.pushObject(intl.t('editDns.errors.mixedAlias'));
      }
      break;

    case WORKLOAD:
      if ( workloads < 1 ) {
        errors.pushObject(intl.t('editDns.errors.targetRequired'));
      }
      break;

    case SELECTOR:
      if ( selectorKeys < 1 ) {
        errors.pushObject(intl.t('editDns.errors.selectorRequired'));
      }
      break;
    }

    errors.pushObjects(get(this, 'namespaceErrors') || []);

    set(this, 'errors', errors);

    return errors.length === 0;
  },
});
