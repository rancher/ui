import Component from '@ember/component';
import layout from './template';

// @TODO-2.0 This api doesn't work. this.get('store').getById('schema','container').get('resourceFields.capAdd').options.sort();
const choices = [
  'AUDIT_CONTROL',
  'AUDIT_WRITE',
  'BLOCK_SUSPEND',
  'CHOWN',
  'DAC_OVERRIDE',
  'DAC_READ_SEARCH',
  'FOWNER',
  'FSETID',
  'IPC_LOCK',
  'IPC_OWNER',
  'KILL',
  'LEASE',
  'LINUX_IMMUTABLE',
  'MAC_ADMIN',
  'MAC_OVERRIDE',
  'MKNOD',
  'NET_ADMIN',
  'NET_BIND_SERVICE',
  'NET_BROADCAST',
  'NET_RAW',
  'SETFCAP',
  'SETGID',
  'SETPCAP',
  'SETUID',
  'SYSLOG',
  'SYS_ADMIN',
  'SYS_BOOT',
  'SYS_CHROOT',
  'SYS_MODULE',
  'SYS_NICE',
  'SYS_PACCT',
  'SYS_PTRACE',
  'SYS_RAWIO',
  'SYS_RESOURCE',
  'SYS_TIME',
  'SYS_TTY_CONFIG',
  'WAKE_ALARM'
];

export default Component.extend({
  layout,

  classNames: ['accordion-wrapper'],

  model:         null,
  basicPolicies: null,

  readOnly: false,

  capabilityChoices: null,

  statusClass: null,
  status:      null,
  init() {
    this._super(...arguments);
    this.initCapability();
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }
  },

  actions: {
    modifyCapabilities(type, select) {
      let options = Array.prototype.slice.call(select.target.options, 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((cap) => {
        return selectedOptions.push(cap.value);
      });

      this.set(`model.${ type }`, selectedOptions);
    },
  },

  initCapability() {
    this.set('model.allowedCapabilities', this.get('model.allowedCapabilities') || []);
    this.set('model.defaultAddCapabilities', this.get('model.defaultAddCapabilities') || []);
    this.set('model.requiredDropCapabilities', this.get('model.requiredDropCapabilities') || []);
    this.set('capabilityChoices', choices);
  },

});
