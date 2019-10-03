import Component from '@ember/component'
import { alias } from '@ember/object/computed'
import {
  get, set, computed, setProperties, observer
} from '@ember/object'
import { inject as service } from '@ember/service';
import $ from 'jquery';

export default Component.extend({
  scope:            service(),

  brokerType:              'zookeeper',
  brokerEndpoints:         null,
  cachedBrokerEndpoints:   null,
  cachedZookeeperEndpoint: null,
  showAdvanced:            false,

  config:        alias('model.config'),
  isWindows:     alias('scope.currentCluster.isWindows'),

  init() {
    this._super();
    const brokerEndpoints = get(this, 'config.brokerEndpoints');

    if (brokerEndpoints) {
      setProperties(this, {
        brokerType:      'broker',
        brokerEndpoints: brokerEndpoints.map((endpoint) => ({ endpoint })),
      })
    } else if (get(this, 'isWindows')) {
      set(this, 'brokerType', 'broker');
      this.brokerTypeChange()
    } else {
      set(this, 'brokerType', 'zookeeper');
    }

    const config = get(this, 'config')

    setProperties(config, {
      saslType:           get(config, 'saslType') || 'plain',
      saslScramMechanism: get(config, 'saslScramMechanism') || 'sha256',
    })
  },

  didInsertElement() {
    $('#kafka-endpoint').focus()
  },

  actions: {
    add() {
      const ary = get(this, 'brokerEndpoints');

      if (!ary) {
        set(this, 'brokerEndpoints', [{ endpoint: '' }]);
      } else {
        ary.pushObject({ endpoint: '' });
      }
    },
    remove(item) {
      if (get(this, 'canRemove')) {
        get(this, 'brokerEndpoints').removeObject(item);
      }
    },
  },

  // cache and restore
  brokerTypeChange: observer('brokerType', function() {
    const t = get(this, 'brokerType');
    const {
      brokerEndpoints, zookeeperEndpoint, cachedZookeeperEndpoint, cachedBrokerEndpoints
    } = this

    if (t === 'zookeeper') {
      setProperties(this, {
        cachedBrokerEndpoints:      brokerEndpoints,
        'config.zookeeperEndpoint': cachedZookeeperEndpoint,
        brokerEndpoints:            null,
      })
    } else if (t === 'broker') {
      if (!cachedBrokerEndpoints) {
        this.send('add');
      } else {
        set(this, 'brokerEndpoints', cachedBrokerEndpoints);
      }
      setProperties(this, {
        cachedZookeeperEndpoint:    zookeeperEndpoint,
        'config.zookeeperEndpoint': null,
      })
    }
  }),

  setBroker: observer('brokerEndpoints.@each.endpoint', function() {
    const eps = get(this, 'brokerEndpoints')
    let nue;

    if (!eps) {
      nue = null;
    } else {
      nue = eps.filter((item) => !!item.endpoint).map((item) => item.endpoint);
    }

    set(this, 'config.brokerEndpoints', nue);
  }),

  enableSSLConfig: computed('brokerType', 'config.brokerEndpoints.[].endpoint', function() {
    const { brokerType, config = {} } = this

    if (brokerType === 'broker') {
      if (get(config, 'brokerEndpoints')) {
        const sslEndpoints = (get(config, 'brokerEndpoints') || []).filter((e = '') => e.startsWith('https'))

        return sslEndpoints.length > 0
      }
    }

    return false
  }),

  logPreview: computed('fieldsStr', function() {
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
${ str }
}`
  }),

  fieldsStr: computed('model.outputTags', function() {
    const keyValueMap = get(this, 'model.outputTags')

    if (!keyValueMap) {
      return '';
    }

    return Object.keys(keyValueMap).map((key) => `    "${ key }": "${ keyValueMap[key] }"`).join(',\n');
  }),

  canRemove: computed('brokerEndpoints.length', function() {
    return get(this, 'brokerEndpoints.length') > 1;
  }),

});
