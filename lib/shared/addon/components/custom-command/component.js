import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';
import ManageLabels from 'shared/mixins/manage-labels';
import { get, set, setProperties } from '@ember/object';
import { validateHostname } from 'ember-api-store/utils/validate';
import { validateEndpoint, } from 'shared/utils/util';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { next } from '@ember/runloop';

export default Component.extend(ManageLabels, {
  intl:     service(),
  settings: service(),

  layout,

  address:         null,
  internalAddress: null,
  nodeName:        null,
  labels:          null,
  token:           null,
  nodeNameErrors:  null,
  isLinux:         true,
  etcd:            false,
  controlplane:    false,
  worker:          true,
  commandAdvanced: false,

  init() {
    this._super(...arguments);

    setProperties(this, {
      labels:         {},
      nodeNameErrors: [],
      taints:         [],
    })
  },

  actions: {
    setTaints(taints) {
      set(this, 'taints', taints);
    },
    setLabels(labels) {
      set(this, 'labels', labels);
      var out = {};

      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      this.set('labels', out);
    },
    expand(item) {
      item.toggleProperty('expanded');
    },
  },

  isAddressValid: computed('address.length', function() {
    const { address } = this;

    return isEmpty(address) || validateEndpoint(get(this, 'address'));
  }),

  isInternalAddressValid: computed('internalAddress.length', function() {
    const { internalAddress } = this;

    return isEmpty(internalAddress) || validateEndpoint(get(this, 'internalAddress'));
  }),

  isNodeNameValid: computed('nodeName', function() {
    const nodeName = (get(this, 'nodeName') || '').toLowerCase();

    if ( get(nodeName, 'length') === 0 ) {
      return true;
    } else {
      const errors = validateHostname(nodeName, 'Node Name', get(this, 'intl'), { restricted: true });

      set(this, 'nodeNameErrors', errors);

      return errors.length === 0;
    }
  }),

  command: computed('taints', 'labels', 'token.{nodeCommand,windowsNodeCommand}', 'etcd', 'controlplane', 'worker', 'address', 'internalAddress', 'nodeName', 'isLinux', function() {
    let out = get(this, 'token.nodeCommand');

    if ( !out ) {
      return;
    }

    const {
      address,
      internalAddress,
      isLinux,
      labels,
      nodeName,
      taints,
    } = this;

    const roles             = ['etcd', 'controlplane', 'worker'];
    const windowsSelected   = !isLinux;
    const windowsCmdPostfix = ` | iex}"`;

    if (windowsSelected) {
      next(() => {
        setProperties(this, {
          etcd:         false,
          controlplane: false,
        });
      })

      out = (get(this, 'token.windowsNodeCommand') || '').replace('--isolation hyperv ', '').replace(windowsCmdPostfix, '')
    }

    if ( nodeName ) {
      out += ` --node-name ${ nodeName.toLowerCase() }`;
    }

    if (address) {
      out += ` --address ${ address }`;
    }

    if (internalAddress) {
      out += ` --internal-address ${ internalAddress }`;
    }

    for ( let i = 0, k ; i < roles.length ; i++ ) {
      k = roles[i];

      if ( get(this, k) ) {
        out += ` --${ k }`;
      }
    }

    Object.keys(labels).forEach((key) => {
      out += ` --label ${ key }=${ labels[key] }`;
    });

    taints.forEach((taint) => {
      out += ` --taints ${ get(taint, 'key') }=${ get(taint, 'value') }:${ get(taint, 'effect') }`;
    });

    if (windowsSelected) {
      out += windowsCmdPostfix
    }

    return out;
  }),
});
