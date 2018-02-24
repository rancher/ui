import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { get, set, setProperties, computed, observer } from '@ember/object';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import layout from './template';
import { ARECORD, CNAME, ALIAS, WORKLOAD, SELECTOR, UNKNOWN } from 'ui/models/dnsrecord';
import ChildHook from 'shared/mixins/child-hook';

export default Component.extend(ViewNewEdit, ChildHook, {
  layout,
  intl: service(),

  model: null,

  recordType: null,
  namespaceErrors: null,

/*
  targetServicesAsMaps: null,
  targetIpArray: null,
  stack: null,
  stackErrors: null,
*/

  actions: {
  },

  init() {
    this._super(...arguments);

    let type = get(this,'model.recordType') || ARECORD;
    setProperties(this, {
      recordType: type,
    });
  },

  willSave() {
    get(this,'model').clearTypesExcept(get(this,'recordType'));
    set(this,'model.namespaceId', get(this,'namespace.id')||'__placeholder__');
    const self = this;
    const sup = this._super;
    return this.applyHooks('_beforeSaveHooks').then(() => {
      return sup.apply(self, ...arguments);
    });
  },

  validate() {
    this._super(...arguments);
    const errors = get(this, 'errors')||[];
    const intl = get(this, 'intl');

    const store = get(this, 'store');
    const aliasTargets = (get(this, 'model.targetDnsRecords')||[]).map((id) => store.getById('dnsRecord', id));
    const aliases = aliasTargets.length;
    const aliasesToCname = aliasTargets.filterBy('recordType',CNAME).length;
    const selectorKeys = Object.keys(get(this,'model.selector')||{}).length;
    const workloads = Object.keys(get(this,'model.targetWorkloadIds')||[]).length;

    switch ( get(this,'recordType') ) {
      case ARECORD:
        if ( get(this,'model.ipAddresses.length') < 1 ) {
          errors.pushObject(intl.t('editDns.errors.targetRequired'));
        }
        break;

      case CNAME:
        if ( !get(this,'model.hostname') ) {
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

      case SELECTOR:
        if ( selectorKeys < 1 ) {
          errors.pushObject(intl.t('editDns.errors.selectorRequired'));
        }
        break;

      case WORKLOAD:
        if ( workloads < 1 ) {
          errors.pushObject(intl.t('editDns.errors.targetRequired'));
        }
        break;
    }

    errors.pushObjects(get(this,'namespaceErrors')||[]);

    set(this,'errors', errors);
    return errors.length === 0;
  },
});
