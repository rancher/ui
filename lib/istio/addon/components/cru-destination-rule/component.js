import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import layout from './template';
import Errors from 'ui/utils/errors';
import EmberObject from '@ember/object';
import ChildHook from 'shared/mixins/child-hook';
import { flattenLabelArrays } from 'shared/mixins/manage-labels';
import { isEmpty } from '@ember/utils';

export default Component.extend(ViewNewEdit, ChildHook, {
  intl: service(),

  layout,

  model:     null,

  subsets:   alias('model.subsets'),
  namespace: alias('model.namespace'),

  init() {
    this._super(...arguments);

    if ( !get(this, 'model.trafficPolicy') ) {
      set(this, 'model.trafficPolicy', {});
    }
  },

  didInsertElement() {
    if ( get(this, 'isNew') && get(this, 'subsets.length') === 0 ) {
      this.send('addSubset');
    }
  },

  actions: {
    addSubset() {
      const version = this.getNewVersion();
      const subset = EmberObject.create({
        name:    version,
        labels: { version }
      });

      get(this, 'subsets').pushObject(subset);
    },

    removeSubset(subset) {
      get(this, 'subsets').removeObject(subset);
    },

    setLabels(labels) {
      set(this, 'model.labels', flattenLabelArrays(labels));
    },
  },

  willSave() {
    const intl = get(this, 'intl');

    set(this, 'model.namespaceId', get(this, 'namespace.id') || '__placeholder__');
    const self = this;
    const sup = this._super;
    let errors = [];

    errors.pushObjects(get(this, 'namespaceErrors') || []);
    errors.pushObjects(get(this, 'tlsErrors') || []);

    if ( !get(this, 'model.host') )  {
      errors.pushObject(intl.t('cruDestinationRule.host.error'));
    }

    if (isEmpty(get(this, 'model.subsets'))) {
      delete this.model.subsets;
    } else {
      get(this, 'model.subsets').forEach((subset) => {
        if ( !get(subset, 'name') ) {
          errors.pushObject(intl.t('cruDestinationRule.subsets.name.error'));
        }

        if ( Object.keys(get(subset, 'labels') || {}).length === 0 ) {
          errors.pushObject(intl.t('cruDestinationRule.subsets.labels.error'));
        }
      })
    }

    if ( get(this, 'model.trafficPolicy.loadBalancer.consistentHash.httpHeaderName') === '' )  {
      errors.pushObject(intl.t('cruDestinationRule.loadBalancer.consistentHash.httpHeaderName.error'));
    }

    if ( get(this, 'model.trafficPolicy.loadBalancer.consistentHash.httpCookie.name') === '' )  {
      errors.pushObject(intl.t('cruDestinationRule.loadBalancer.consistentHash.httpCookie.name.error'));
    }

    if ( get(this, 'model.trafficPolicy.loadBalancer.consistentHash.httpCookie.ttl') === '' )  {
      errors.pushObject(intl.t('cruDestinationRule.loadBalancer.consistentHash.httpCookie.ttl.error'));
    }

    if ( !get(this, 'model.host') )  {
      errors.pushObject(intl.t('cruDestinationRule.host.error'));
    }

    errors = errors.uniq();
    set(this, 'errors', errors);
    if ( get(errors, 'length') !== 0 ) {
      return false;
    }

    return this.applyHooks('_beforeSaveHooks').then(() => {
      set(this, 'model.namespaceId', get(this, 'namespace.id'));

      return sup.apply(self, ...arguments);
    }).catch((err) => {
      set(this, 'errors', [Errors.stringify(err)]);
    });
  },

  doSave(opt) {
    const primaryResource = get(this, 'primaryResource');
    let clone = primaryResource.clone();

    if ( Object.keys(get(clone, 'trafficPolicy') || {}).length === 0 ) {
      delete clone['trafficPolicy'];
    }

    if ( get(clone, 'trafficPolicy.connectionPool.tcp') && get(clone, 'trafficPolicy.connectionPool.tcp.connectTimeout') === '' ) {
      const tcp = get(clone, 'trafficPolicy.connectionPool.tcp');

      delete tcp['connectTimeout'];
    }

    opt = opt || {};
    opt.qp = { '_replace': 'true' };

    return clone.save(opt).then((newData) => {
      return this.mergeResult(newData);
    });
  },

  getNewVersion() {
    const name = get(this, 'subsets.lastObject.name');

    if ( name ) {
      const matches = name.match(/\d+$/);

      if ( matches.length > 0) {
        const prefix = name.slice(0, name.length - matches[0].length);

        return `${ prefix }${ parseInt(matches[0], 10) + 1 }`
      }
    } else {
      return 'v1';
    }

    return '';
  }
});
