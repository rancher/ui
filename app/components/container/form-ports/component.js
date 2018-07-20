import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { get, set, setProperties, observer } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

const KINDS = ['NodePort', 'HostPort', 'ClusterIP', 'LoadBalancer'];

const protocolOptions = [
  {
    label: 'TCP',
    value: 'TCP'
  },
  {
    label: 'UDP',
    value: 'UDP'
  }
];

export default Component.extend({
  intl: service(),

  layout,
  initialPorts: null,
  editing:      false,
  kindChoices:  null,

  ports:           null,
  protocolOptions,

  init() {
    this._super(...arguments);
    this.initPorts();
    this.initKindChoices();
  },

  actions: {
    addPort() {
      this.get('ports').pushObject(get(this, 'store').createRecord({
        type:          'containerPort',
        kind:          'NodePort',
        protocol:      'TCP',
        containerPort: '',
      }));

      next(() => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        this.$('INPUT.public').last()[0].focus();
      });
    },

    removePort(obj) {
      this.get('ports').removeObject(obj);
    },
  },

  portsChanged: observer('ports.@each.{containerPort,dnsName,hostIp,kind,name,protocol,sourcePort,_ipPort}', function() {
    const errors = [];
    const intl = get(this, 'intl');
    const ports = get(this, 'ports');

    ports.forEach((obj) => {
      let containerPort = obj.containerPort;

      if ( !containerPort ) {
        errors.push(intl.t('formPorts.error.privateRequired'));
      }

      if (obj.kind === 'HostPort' && !get(obj, '_ipPort')) {
        errors.push(intl.t('formPorts.error.hostPort.sourcePortRequired'));
      }

      if (obj.kind === 'LoadBalancer' && !get(obj, 'sourcePort')) {
        errors.push(intl.t('formPorts.error.loadBalancer.sourcePortRequired'));
      }

      if ( !obj.sourcePort ) {
        delete obj['sourcePort'];
      }

      if ( get(obj, 'kind') === 'HostPort' ) {
        let port = get(obj, '_ipPort') || '';
        let ip;
        const idx = port.lastIndexOf(':');

        if ( idx >= 0 ) {
          ip = port.substr(0, idx);
          port = port.substr(idx + 1);
        }

        const toSet = {};

        if ( ip ) {
          if ( get(obj, 'hostIp') !== ip ) {
            toSet['hostIp'] = ip;
          }
        } else {
          delete obj['hostIp'];
        }

        port = parseInt(port, 10) || undefined;
        if ( port !== get(obj, 'sourcePort') ) {
          toSet['sourcePort'] = port;
        }

        setProperties(obj, toSet);
      }
    });

    this.set('errors', errors.uniq());
    this.sendAction('changed', ports.slice());
  }),
  initPorts() {
    let ports = get(this, 'initialPorts') || [];

    ports.forEach((obj) => {
      if ( get(obj, 'kind') === 'HostPort' ) {
        const ip = get(obj, 'hostIp');
        const port = get(obj, 'sourcePort');

        set(obj, '_ipPort', (ip ? `${ ip  }:` : '') + port);
      }
    });

    set(this, 'ports', ports);
  },

  initKindChoices() {
    set(this, 'kindChoices', KINDS.map((k) => ({
      translationKey: `formPorts.kind.${ k }`,
      value:          k
    })));
  },

});
