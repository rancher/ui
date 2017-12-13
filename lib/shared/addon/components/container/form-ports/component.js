import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { get, set, observer } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

const protocolOptions = [
  {label: 'TCP', value: 'TCP'},
  {label: 'UDP', value: 'UDP'}
];

export default Component.extend({
  layout,
  intl: service(),

  initialPorts: null,
  showIp: null,
  editing: false,

  ports: null,
  protocolOptions : protocolOptions,

  init() {
    this._super(...arguments);

    let ports = get(this, 'initialPorts');
    if ( ports ) {
      ports = ports.map((obj) => {
        const out = obj.cloneForNew()
        set(out, 'existing', true);

        if ( get(obj, 'hostIP') ) {
          set(this, 'showIp', true);
        }

        return out;
      });
    } else {
      ports = [];
    }

    set(this, 'ports', ports);
  },

  actions: {
    addPort() {
      this.get('ports').pushObject(get(this,'store').createRecord({
        type: 'containerPort',
        containerPort: '',
        hostPort: '',
        hostIP: '',
        protocol: 'TCP'
      }));

      next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.$('INPUT.public').last()[0].focus();
      });
    },

    removePort(obj) {
      this.get('ports').removeObject(obj);
    },

    showIp() {
      this.set('showIp', true);
    },
  },

  portsChanged: observer('ports.@each.{containerPort,hostPort,hostIP,protocol}', function() {
    const errors = [];
    const seen = {};
    const intl = get(this, 'intl');
    const ports = get(this, 'ports');

    ports.forEach((obj) => {
      let hostIP = obj.hostIP;
      let containerPort = obj.containerPort;
      let hostPort = obj.hostPort;
      let protocol = obj.protocol;

      errors.pushObjects(obj.validationErrors());

      if ( !containerPort && (hostPort || hostIP) ) {
        errors.push(intl.t('formPorts.error.privateRequired'));
      }

      if ( hostIP && !hostPort ) {
        errors.push(intl.t('formPorts.error.publicRequired'));
      }

      if ( hostPort ) {
        const key = '['+ (hostIP||'0.0.0.0') + ']:' + hostPort + '/' + protocol;
        if ( seen[key] ) {
          errors.push(intl.t('formPorts.error.'+(hostIP ? 'mixedIpPort' : 'mixedPort'), {
            ip: hostIP,
            port: hostPort,
            proto: protocol
          }));
        } else {
          seen[key] = true;
        }
      }
    });

    this.set('errors', errors.uniq());
    this.sendAction('changed', ports.slice());
  }),
});
