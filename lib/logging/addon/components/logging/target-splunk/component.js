import { get, computed, setProperties } from '@ember/object';
import Component from '@ember/component';
import { alias } from '@ember/object/computed'

export default Component.extend({
  showAdvanced: false,

  config:        alias('model.config'),
  didInsertElement() {
    this.$('#splunk-endpoint').focus()
  },

  showSSLConfig: computed('config.endpoint', function() {
    const endpoint = get(this, 'config.endpoint') || ''

    if (endpoint.startsWith('https')) {
      return true
    } else {
      const config = get(this, 'config')

      if (config) {
        setProperties(config, {
          certificate:   null,
          clientKey:     null,
          clientCert:    null,
          clientKeyPass: null,
          sslVerify:     false,
        })
      }

      return false
    }
  }),

  logPreview: function() {
    const fieldsStr = get(this, 'fieldsStr');
    const template = `{
    "log": "time=\"${ new Date().toString() }\" level=info msg=\"Cluster [local] condition status unknown\"\n",
    "stream": "stderr",
    "tag": "default.var.log.containers.cattle-6b4ccb5b9d-v57vw_default_cattle-xxx.log"
    "docker": {
        "container_id": "xxx"
    },
    "kubernetes": {
        "container_name": "cattle",
        "namespace_name": "default",
        "pod_name": "cattle-6b4ccb5b9d-v57vw",
        "pod_id": "30c685d0-fa43-11e7-b992-00163e016dc2",
        "labels": {
            "app": "cattle",
            "pod-template-hash": "2607761658"
        },
        "host": "47.52.113.251",
        "master_url": "https://10.233.0.1:443/api"
    },
${ fieldsStr }
  ...
}`;

    return template
  }.property('fieldsStr'),

  fieldsStr: function() {
    const keyValueMap = get(this, 'model.outputTags')

    if (!keyValueMap) {
      return '';
    }

    return Object.keys(keyValueMap).map((key) => `    "${ key }": "${ keyValueMap[key] }"`).join(',\n');
  }.property('model.outputTags'),
});
