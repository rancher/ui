import Component from '@ember/component'
import { alias } from '@ember/object/computed'
import { get, set } from '@ember/object'

export default Component.extend({
  config: alias('model.config'),
  brokerType: 'zookeeper',
  brokerEndpoints: null,
  cachedBrokerEndpoints: null,
  cachedZookeeper: null,

  init() {
    this._super();
    const endpoints = get(this, 'config.brokerEndpoints');
    if (endpoints) {
      set(this, 'brokerEndpoints', endpoints.map(endpoint => ({endpoint})));
    }
    const brokerEndpoints = get(this, 'config.brokerEndpoints');
    const zookeeperEndpoint = get(this, 'config.zookeeperEndpoint')
    if (brokerEndpoints) {
      set(this, 'brokerType', 'broker')
    }
    if (zookeeperEndpoint) {
      set(this, 'brokerType', 'zookeeper');
    }
  },

  logPreview: function() {
    const str = get(this, 'fieldsStr');
    return `{
    "log": "here's your log",
    "stream": "stdout",
    "tag": "kubernetes.var.log.containers.splunk-dep-848b7...cb4.log"
    "docker": {
        "container_id": "5f07a15a2a60ef4..."
    },
    "kubernetes": {
        "container_name": "splunk",
        "namespace_name": "cattle-system",
        "pod_name": "splunk-dep-848b7cbdd-5jqd4"
    },
    "time": 1515680329,
${str}
}`
  }.property('fieldsStr'),

  fieldsStr: function() {
    const keyValueMap = get(this, 'model.outputTags')
    if (!keyValueMap) {
      return '';
    }
    return Object.keys(keyValueMap).map(key => `    "${key}": "${keyValueMap[key]}"`).join(',\n');
  }.property('model.outputTags'),

  // cache and restore
  brokerTypeChange: function() {
    const t = get(this, 'brokerType');
    const brokerEndpoints = get(this, 'brokerEndpoints');
    const zookeeper = get(this, 'config.zookeeper');
    const cachedZookeeper = get(this, 'cachedZookeeper');
    const cachedBrokerEndpoint = get(this, 'cachedBrokerEndpoints');
    set(this, 'config.brokerType', t);
    if (t === 'zookeeper') {
      set(this, 'cachedBrokerEndpoints', brokerEndpoints);
      set(this, 'config.zookeeper', cachedZookeeper);
      set(this, 'brokerEndpoints', null);
    } else if (t === 'broker') {
      if (!cachedBrokerEndpoint) {
        this.send('add');
      } else {
        set(this, 'brokerEndpoints', cachedBrokerEndpoint);
      }
      set(this, 'cachedZookeeper', zookeeper);
      set(this, 'config.zookeeper', null);
    }
  }.observes('brokerType'),

  setBroker: function() {
    const eps = get(this, 'brokerEndpoints')
    let nue;

    if (!eps) {
      nue = null;
    } else {
      nue = eps.filter(item => !!item.endpoint).map(item => item.endpoint);
    }

    set(this, 'config.brokerEndpoints', nue);
  }.observes('brokerEndpoints.@each.endpoint'),

  canRemove: function() {
    return get(this, 'brokerEndpoints.length') > 1;
  }.property('brokerEndpoints.length'),

  actions: {
    add() {
      const ary = get(this, 'brokerEndpoints');
      if (!ary) {
        set(this, 'brokerEndpoints', [{endpoint: ''}]);
      } else {
        ary.pushObject({endpoint: ''});
      }
    },
    remove(item) {
      if (get(this, 'canRemove')) {
        get(this, 'brokerEndpoints').removeObject(item);
      }
    }
  },
});
