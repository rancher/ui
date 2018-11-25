import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';
import { inject as service } from '@ember/service';

const DRIVER = 'openstack';
const CONFIG = 'openstackConfig';
const ENDPOINT_TYPES = [{
  label: 'nodeDriver.openstack.endpointType.adminURL',
  value: 'adminURL'
}, {
  label: 'nodeDriver.openstack.endpointType.internalURL',
  value: 'internalURL'
}, {
  label: 'nodeDriver.openstack.endpointType.publicURL',
  value: 'publicURL'
}];
const IP_VERSIONS = [{
  label: 'nodeDriver.openstack.ipVersion.ipv4',
  value: '4'
}, {
  label: 'nodeDriver.openstack.ipVersion.ipv6',
  value: '6'
}];

export default Component.extend(NodeDriver, {
  intl:     service(),
  settings: service(),

  layout,
  driverName:          DRIVER,
  model:               null,
  showEngineUrl:       false,
  endpointTypeChoices: ENDPOINT_TYPES,
  ipVersionChoices:    IP_VERSIONS,

  config:  alias(`model.${ CONFIG }`),

  init() {
    this._super(...arguments);

    const secGroupsString = get(this, 'config.secGroups');

    if ( secGroupsString ) {
      const secGroups = secGroupsString.split(',');

      set(this, 'secGroups', secGroups);
    }
  },

  actions: {
    updateSecGroups(array) {
      set(this, 'config.secGroups', array.join(','));
    }
  },

  bootstrap() {
    let config = get(this, 'globalStore').createRecord({
      type:           CONFIG,
      endpointType:   'publicURL',
    });

    set(this, `model.${ CONFIG }`, config);
  },

  validate() {
    const errors = [];
    const intl = get(this, 'intl');

    if ( !get(this, 'config.authUrl') ) {
      errors.push(intl.t('validation.required', { key: intl.t('nodeDriver.openstack.authUrl.label') }));
    }

    if ( !get(this, 'config.username') ) {
      errors.push(intl.t('validation.required', { key: intl.t('nodeDriver.openstack.username.label') }));
    }

    if ( !get(this, 'config.password') ) {
      errors.push(intl.t('validation.required', { key: intl.t('nodeDriver.openstack.password.label') }));
    }

    if ( !get(this, 'config.tenantName') && !get(this, 'config.tenantId') ) {
      errors.push(intl.t('validation.required', { key: intl.t('nodeDriver.openstack.tenantName.label') }));
    }

    if ( !get(this, 'config.flavorName') && !get(this, 'config.flavorId') ) {
      errors.push(intl.t('validation.required', { key: intl.t('nodeDriver.openstack.flavorName.label') }));
    }

    if ( !get(this, 'config.imageName') && !get(this, 'config.imageId') ) {
      errors.push(intl.t('validation.required', { key: intl.t('nodeDriver.openstack.imageName.label') }));
    }

    if ( get(this, 'config.tenantName') && get(this, 'config.tenantId') ) {
      errors.push(intl.t('nodeDriver.openstack.errors.exclusive', {
        key1: intl.t('nodeDriver.openstack.tenantName.label'),
        key2: intl.t('nodeDriver.openstack.tenantId.label')
      }));
    }

    if ( get(this, 'config.flavorName') && get(this, 'config.flavorId') ) {
      errors.push(intl.t('nodeDriver.openstack.errors.exclusive', {
        key1: intl.t('nodeDriver.openstack.flavorName.label'),
        key2: intl.t('nodeDriver.openstack.flavorId.label')
      }));
    }

    if ( get(this, 'config.domainName') && get(this, 'config.domainId') ) {
      errors.push(intl.t('nodeDriver.openstack.errors.exclusive', {
        key1: intl.t('nodeDriver.openstack.domainName.label'),
        key2: intl.t('nodeDriver.openstack.domainId.label')
      }));
    }

    if ( get(this, 'config.netName') && get(this, 'config.netId') ) {
      errors.push(intl.t('nodeDriver.openstack.errors.exclusive', {
        key1: intl.t('nodeDriver.openstack.networkName.label'),
        key2: intl.t('nodeDriver.openstack.networkId.label')
      }));
    }

    if ( get(this, 'config.imageName') && get(this, 'config.imageId') ) {
      errors.push(intl.t('nodeDriver.openstack.errors.exclusive', {
        key1: intl.t('nodeDriver.openstack.imageName.label'),
        key2: intl.t('nodeDriver.openstack.imageId.label')
      }));
    }

    if ( (!get(this, 'config.keypairName') && get(this, 'config.privateKeyFile')) ||
            (get(this, 'config.keypairName') && !get(this, 'config.privateKeyFile')) ) {
      errors.push(intl.t('nodeDriver.openstack.errors.both', {
        key1: intl.t('nodeDriver.openstack.keypairName.label'),
        key2: intl.t('nodeDriver.openstack.privateKeyFile.label')
      }));
    }

    this.set('errors', errors);

    return errors.length === 0;
  },
});
