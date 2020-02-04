import Component from '@ember/component'
import { alias } from '@ember/object/computed'
import { get, set, computed, setProperties } from '@ember/object'
import moment from 'moment';
import $ from 'jquery';

export default Component.extend({
  showAdvanced: false,
  preSSlConfig: null,

  config:        alias('model.config'),
  init(...args) {
    this._super(...args);
  },

  didInsertElement() {
    $('#graylog-endpoint').focus()
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

  logPreview: computed('fieldsStr', function() {
    const str = get(this, 'fieldsStr');
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



    return `Timestamp = ${ ts }
Host      = 192.168.1.2
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
