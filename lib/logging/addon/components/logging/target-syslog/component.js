import Component from '@ember/component'
import { alias } from '@ember/object/computed'
import { get, set } from '@ember/object'

const SEVERITIES = [
  {
    value: 'emerg',
    label: 'emergency'
  },
  {
    value: 'alert',
    label: 'alert'
  },
  {
    value: 'crit',
    label: 'critical'
  },
  {
    value: 'err',
    label: 'error'
  },
  {
    value: 'warning',
    label: 'warning'
  },
  {
    value: 'notice',
    label: 'notice'
  },
  {
    value: 'info',
    label: 'info'
  },
  {
    value: 'debug',
    label: 'debug'
  },
].map((item) => {
  return {
    value: item.value,
    label: `loggingPage.syslog.severities.${ item.label }`,
  };
});

export default Component.extend({
  showAdvanced: false,
  config:       alias('model.config'),

  logPreview: function() {
    const str = get(this, 'fieldsStr');
    const program = get(this, 'config.program') || '';
    const ts = moment().format('MMMM Do YYYY, h:mm:ss');

    return `Timestamp = ${ ts }
Host      = 192.168.1.2
Program   = ${ program }
Message   =
  stream:stderr
  docker:
  {
    "container_id"=>"218477a1e...0371"
  }
  kubernetes:
  {
    "container_name"=>"kube-flannel",
    "namespace_name"=>"kube-system",
    "pod_name"=>"kube-flannel-8ztd8"
  }
${ str }`
  }.property('fieldsStr', 'config.program'),

  fieldsStr: function() {
    const keyValueMap = get(this, 'model.outputTags')

    if (!keyValueMap) {
      return '';
    }

    return Object.keys(keyValueMap).map((key) => `  "${ key }"=>"${ keyValueMap[key] }"`).join(',\n');
  }.property('model.outputTags'),

  init(...args) {
    this._super(...args);
    this.set('severities', SEVERITIES);
  },

  didInsertElement() {
    this.$('#syslog-endpoint').focus()
  },

  actions: {
    changeProtocol(protocol) {
      set(this, 'config.protocol', protocol);
    },
  },
});
