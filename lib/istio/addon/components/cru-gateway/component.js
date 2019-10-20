import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import layout from './template';
import Errors from 'ui/utils/errors';
import ChildHook from 'shared/mixins/child-hook';
import { flattenLabelArrays } from 'shared/mixins/manage-labels';
export default Component.extend(ViewNewEdit, ChildHook, {
  intl: service(),

  layout,

  model:     null,

  servers:   alias('model.servers'),
  namespace: alias('model.namespace'),

  didInsertElement() {
    if ( this.isNew && get(this, 'servers.length') === 0 ) {
      this.send('addServer');
    }
  },

  actions: {
    addServer() {
      const server = {
        hosts: [''],
        port:  {
          number:   null,
          protocol: 'HTTP'
        }
      };

      this.servers.pushObject(server);
    },

    removeServer(server) {
      this.servers.removeObject(server);
    },

    setSelector(selector) {
      set(this, 'model.selector', selector);
    },

    setLabels(labels) {
      set(this, 'model.labels', flattenLabelArrays(labels));
    },
  },

  willSave() {
    set(this, 'model.namespaceId', this.namespace.id || '__placeholder__');
    const self = this;
    const sup = this._super;
    let errors = [];

    if ( Object.keys(this.model.selector || {}).length === 0 )  {
      errors.pushObject(this.intl.t('cruGateway.selector.error'));
    }

    if ( (this.model.servers || []).length === 0 )  {
      errors.pushObject(this.intl.t('cruGateway.servers.error'));
    }

    (this.model.servers || []).forEach((server) => {
      if ( !get(server, 'port.number') ) {
        errors.pushObject(this.intl.t('cruGateway.port.number.error'));
      }
      if ( !get(server, 'port.name') ) {
        errors.pushObject(this.intl.t('cruGateway.port.name.error'));
      }
      const hosts = get(server, 'hosts').filter((host) => host);

      if ( get(hosts, 'length') === 0 ) {
        errors.pushObject(this.intl.t('cruGateway.hosts.error'));
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

    (get(clone, 'servers') || []).forEach((server) => {
      if ( get(server, 'tls.httpsRedirect') === false && Object.keys(get(server, 'tls')).length === 1 ) {
        delete server['tls'];
      }
    });

    opt = opt || {};
    opt.qp = { '_replace': 'true' };

    return clone.save(opt).then((newData) => {
      return this.mergeResult(newData);
    }).catch((err) => {
      set(this, 'errors', [Errors.stringify(err)]);
    });
  },
});
