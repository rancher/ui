import Component from '@ember/component'
import { get, computed } from '@ember/object'
import { alias } from '@ember/object/computed'

export default Component.extend({
  showAdvanced: false,
  config:       alias('model.config'),

  didInsertElement() {
    this.$('#cloudwatch-accessKeyID').focus()
  },

  fieldsStr: computed('model.outputTags', function() {
    const keyValueMap = get(this, 'model.outputTags')

    if (!keyValueMap) {
      return '';
    }

    return Object.keys(keyValueMap).map((key) => `    "${ key }": "${ keyValueMap[key] }"`).join(',\n');
  }),

  logPreview: computed('fieldsStr', function() {
    const fieldsStr = get(this, 'fieldsStr');

    return `{
  "log": "Hello, World!",
  "stream": "stdout",
  "docker": {
      "container_id": "1937b6801bfb356959d7281654302826b254cd0c27eb18655b3167fb7d50c41f"
  },
  "kubernetes": {
      "container_name": "api",
      "namespace_name": "default",
      "pod_name": "test-app-6d8f8d5bd5-bf4sc",
      "pod_id": "bb465cb6-a3e9-11e9-b427-005056904911",
      "labels": {
          "app": "test-app",
          "pod-template-hash": "6d8f8d5bd5"
      },
      "host": "rancher-k8s-cluster",
      "master_url": "https://10.43.0.1:443/api",
      "namespace_id": "d183a291-a363-11e9-b427-005056904911",
      "namespace_labels": {
          "field_cattle_io/projectId": "p-fm42g"
      }
  },
${ fieldsStr }
  "tag": "cluster.var.log.containers.test-app-6d8f8d5bd5-bf4sc_default_api-1937b6801bfb356959d7281654302826b254cd0c27eb18655b3167fb7d50c41f.log",
  "log_type": "k8s_normal_container"
}`
  }),
})
