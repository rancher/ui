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
export default Component.extend(ViewNewEdit, ChildHook, {
  intl: service(),

  layout,

  model:     null,

  servers:   alias('model.servers'),
  namespace: alias('model.namespace'),

  didInsertElement() {
    if ( get(this, 'isNew') && get(this, 'servers.length') === 0 ) {
      this.send('addServer');
    }
  },

  actions: {
    addServer() {
      const server = EmberObject.create({
        hosts: [''],
        port:  {
          number:   null,
          protocol: 'HTTP'
        }
      });

      get(this, 'servers').pushObject(server);
    },

    removeServer(server) {
      get(this, 'servers').removeObject(server);
    },

    setSelector(selector) {
      set(this, 'model.selector', selector);
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

    if ( Object.keys(get(this, 'model.selector') || {}).length === 0 )  {
      errors.pushObject(intl.t('cruGateway.selector.error'));
    }

    if ( (get(this, 'model.servers') || []).length === 0 )  {
      errors.pushObject(intl.t('cruGateway.servers.error'));
    }

    (get(this, 'model.servers') || []).forEach((server) => {
      if ( !get(server, 'port.number') ) {
        errors.pushObject(intl.t('cruGateway.port.number.error'));
      }
      if ( !get(server, 'port.name') ) {
        errors.pushObject(intl.t('cruGateway.port.name.error'));
      }
      const hosts = get(server, 'hosts').filter((host) => host);

      if ( get(hosts, 'length') === 0 ) {
        errors.pushObject(intl.t('cruGateway.hosts.error'));
      }
    });

    errors.pushObjects(get(this, 'namespaceErrors') || []);
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

    (get(clone, 'servers') || []).forEach((server) => {
      if ( get(server, 'tls.httpsRedirect') === false && Object.keys(get(server, 'tls')).length === 1 ) {
        delete server['tls'];
      }
    });

    opt = opt || {};
    opt.qp = { '_replace': 'true' };

    return clone.save(opt).then((newData) => {
      return this.mergeResult(newData);
    });
  },
});
