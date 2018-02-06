import Component from '@ember/component'
import { alias } from '@ember/object/computed'
import { get, set } from '@ember/object'

const SEVERITIES = [
  {value: 'emerg', label: 'emergency'},
  {value: 'alert', label: 'alert'},
  {value: 'critical', label: 'crit'},
  {value: 'err', label: 'error'},
  {value: 'warning', label: 'warning'},
  {value: 'notice', label: 'notice'},
  {value: 'info', label: 'info'},
  {value: 'debug', label: 'debug'},
];

export default Component.extend({

  config: alias('model.config'),

  init(...args) {
    this._super(...args);
    this.set('severities', SEVERITIES);
  },

  logPreview: function() {
    const str = get(this, 'fieldsStr');
    return `Timestamp = Feb  5 21:25:47
Host      = iZrj9f9edjszuoxwidkd3zZ
Program   = fluent1:
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
${str}`
  }.property('fieldsStr'),

  fieldsStr: function() {
    const keyValueMap = get(this, 'model.outputTags')
    if (!keyValueMap) {
      return '';
    }
    return Object.keys(keyValueMap).map(key => `  "${key}"=>"${keyValueMap[key]}"`).join(',\n');
  }.property('model.outputTags'),

  actions: {
    changeProtocol(protocol) {
      set(this, 'config.protocol', protocol);
    },
  },
});
