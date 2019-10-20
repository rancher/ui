import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import layout from './template';
import Errors from 'ui/utils/errors';
import ChildHook from 'shared/mixins/child-hook';
import { flattenLabelArrays } from 'shared/mixins/manage-labels';
import { removeEmpty } from 'shared/utils/util';
export default Component.extend(ViewNewEdit, ChildHook, {
  intl: service(),

  layout,

  model:     null,

  httpRoutes: alias('model.http'),
  namespace:  alias('model.namespace'),

  didInsertElement() {
    if ( this.isNew && get(this, 'httpRoutes.length') === 0 ) {
      this.send('addHttpRoute');
    }
  },

  actions: {
    addHttpRoute() {
      const httpRoute = {
        route:    [],
        fault:    {
          abort: {},
          delay: {}
        },
        redirect: {},
        rewrite:  {},
        mirror:   {},
        retries:  {},
      };

      this.httpRoutes.pushObject(httpRoute);
    },

    removeHttpRoute(httpRoute) {
      this.httpRoutes.removeObject(httpRoute);
    },

    setLabels(labels) {
      set(this, 'model.labels', flattenLabelArrays(labels));
    },

    setHosts(hosts) {
      set(this, 'model.hosts', hosts);
    },

    setGateways(gateways) {
      set(this, 'model.gateways', gateways);
    }
  },

  willSave() {
    set(this, 'model.namespaceId', this.namespace.id || '__placeholder__');
    const self = this;
    const sup = this._super;
    let errors = [];

    if ( (this.model.hosts || []).filter((h) => h).length === 0 )  {
      errors.pushObject(this.intl.t('cruVirtualService.hosts.error'));
    }

    (this.model.http || []).forEach((route) => {
      if ( get(route, 'route.length') > 0 ) {
        (route.route || []).forEach((destination) => {
          if ( !get(destination, 'destination.host') ) {
            errors.pushObject(this.intl.t('cruVirtualService.http.routes.destination.host.error'));
          }

          if ( !destination.weight && destination.weight !== 0 ) {
            errors.pushObject(this.intl.t('cruVirtualService.http.routes.destination.weight.error'));
          }
        })

        if ( get(route, 'redirect.uri') || get(route, 'redirect.authority') )  {
          errors.pushObject(this.intl.t('cruVirtualService.http.routes.redirect.error'));
        }
      }

      if ( get(route, 'match.length') > 0 ) {
        (get(route, 'match') || []).forEach((match) => {
          if ( Object.keys(match || {}).length === 0 ) {
            errors.pushObject(this.intl.t('cruVirtualService.http.routes.matches.error'));
          }
        })
      }
    });

    errors.pushObjects(this.namespaceErrors || []);
    errors = errors.uniq();
    set(this, 'errors', errors);

    if ( get(errors, 'length') !== 0 ) {
      return false;
    }

    return this.applyHooks('_beforeSaveHooks').then(() => {
      set(this, 'model.namespaceId', this.namespace.id);

      return sup.apply(self, ...arguments);
    }).catch((err) => {
      set(this, 'errors', [Errors.stringify(err)]);
    });
  },

  doSave(opt) {
    let clone = this.primaryResource.clone();

    const filteredHttp = [];

    if ( get(clone, 'gateways.length') === 0 ) {
      delete clone['gateways'];
    }

    if ( get(clone, 'hosts.length') === 0 ) {
      delete clone['hosts'];
    }

    (get(clone, 'http') || []).forEach((route) => {
      (get(route, 'route') || []).forEach((destination) => {
        const subset = get(destination, 'destination.subset');

        if ( !subset ) {
          delete destination.destination['subset']
        }
      });

      let filtered = removeEmpty(route);

      filtered = removeEmpty(filtered);
      filtered = removeEmpty(filtered);
      filteredHttp.pushObject(filtered);
    });

    set(clone, 'http', filteredHttp);

    opt = opt || {};
    opt.qp = { '_replace': 'true' };

    return clone.save(opt).then((newData) => {
      return this.mergeResult(newData);
    }).catch((err) => {
      set(this, 'errors', [Errors.stringify(err)]);
    });
  },
});
