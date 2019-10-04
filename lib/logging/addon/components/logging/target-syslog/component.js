import Component from '@ember/component'
import { alias } from '@ember/object/computed'
import { get, set, computed, setProperties } from '@ember/object'
import moment from 'moment';
import $ from 'jquery';

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
  preSSlConfig: null,

  config:        alias('model.config'),
  init(...args) {
    this._super(...args);
    this.set('severities', SEVERITIES);
  },

  didInsertElement() {
    $('#syslog-endpoint').focus()
  },

  didReceiveAttrs() {
    const config = get(this, 'config')
    let preSSlConfig = Object.assign({}, config);

    set(this, 'preSSlConfig', preSSlConfig)
  },
  actions: {
    changeProtocol(protocol) {
      set(this, 'config.protocol', protocol);
    },
  },
  enableSSLConfig: computed('config.protocol', function() {
    const protocol = get(this, 'config.protocol') || ''
    const preSSlConfig = get(this, 'preSSlConfig') || {}
    const config = get(this, 'config')

    if (protocol === 'tcp') {
      if (preSSlConfig.protocol === 'tcp') {
        setProperties(config, {
          certificate:   preSSlConfig.certificate,
          clientKey:     preSSlConfig.clientKey,
          clientCert:    preSSlConfig.clientCert,
          sslVerify:     preSSlConfig.sslVerify,
        })
      }

      return true
    } else {
      if (config) {
        setProperties(config, {
          certificate:   null,
          clientKey:     null,
          clientCert:    null,
          sslVerify:     false,
        })
      }

      return false
    }
  }),

  logPreview: computed('fieldsStr', 'config.program', 'config.token', function() {
    const str = get(this, 'fieldsStr');
    const program = get(this, 'config.program') || '';
    const ts = moment().format('MMMM Do YYYY, h:mm:ss');

    let message = `
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
  }`

    if (get(this, 'config.token')) {
      const token = `
  token:${ get(this, 'config.token') }`

      message = token + message
    }

    return `Timestamp = ${ ts }
Host      = 192.168.1.2
Program   = ${ program }
Message   = ${ message }
${ str }`
  }),

  fieldsStr: computed('model.outputTags', function() {
    const keyValueMap = get(this, 'model.outputTags')

    if (!keyValueMap) {
      return '';
    }

    return Object.keys(keyValueMap).map((key) => `  "${ key }"=>"${ keyValueMap[key] }"`).join(',\n');
  }),


});
