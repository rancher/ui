import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { get, set, observer } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

const protocolOptions = [
  { label: 'TCP', value: 'TCP' },
  { label: 'UDP', value: 'UDP' }
];

export default Component.extend({
  layout,
  intl: service(),

  initialPorts: null,
  showNaming: null,
  editing: false,
  kindChoices: null,

  ports: null,
  protocolOptions: protocolOptions,

  init() {
    this._super(...arguments);
    this.initPorts();
    this.initKindChoices();
  },

  actions: {
    addPort() {
      this.get('ports').pushObject(get(this, 'store').createRecord({
        type: 'containerPort',
        containerPort: '',
        dnsName: '',
        hostIp: '',
        kind: 'NodePort',
        name: '',
        protocol: 'TCP',
        sourcePort: '',
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

    showNaming() {
      this.set('showNaming', true);
    },
  },

  initPorts: function () {
    let ports = get(this, 'initialPorts');
    if (ports) {
      ports = ports.map((obj) => {
        const out = obj.cloneForNew()
        set(out, 'existing', true);

        if (get(obj, 'dnsName') || get(obj, 'name')) {
          set(this, 'showNaming', true);
        }

        return out;
      });
    } else {
      ports = [];
    }

    set(this, 'ports', ports);
  },

  initKindChoices: function () {
    const kindChoices = this.get('store').getById('schema', 'containerport').get('resourceFields.kind').options.sort();
    set(this, 'kindChoices', kindChoices.map(k => {
      return {
        translationKey: `formPorts.kind.${k}`,
        value: k
      };
    }));
  },

  portsChanged: observer('ports.@each.{containerPort,dnsName,hostIp,kind,name,protocol,sourcePort}', function() {
    const errors = [];
    const intl = get(this, 'intl');
    const ports = get(this, 'ports');

    ports.forEach((obj) => {
      let containerPort = obj.containerPort;
      if ( !containerPort ) {
        errors.push(intl.t('formPorts.error.privateRequired'));
      }
      if ( !obj.sourcePort ) {
        delete obj['sourcePort'];
      }
    });

    this.set('errors', errors.uniq());
    this.sendAction('changed', ports.slice());
  }),
});
