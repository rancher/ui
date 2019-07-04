import { alias } from '@ember/object/computed';
import { get, set, observer, setProperties } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
const ROUND_ROBIN = 'ROUND_ROBIN';
const LEAST_CONN = 'LEAST_CONN';
const RANDOM = 'RANDOM';
const PASSTHROUGH = 'PASSTHROUGH';

const SOURCE_IP = 'sourceIp';
const HEADER = 'header';
const COOKIE = 'cookie';
const RING_SIZE = 1024;

const LB_MODES = [
  {
    label: 'cruDestinationRule.loadBalancer.simple.roundRobin.label',
    value: ROUND_ROBIN,
  },
  {
    label: 'cruDestinationRule.loadBalancer.simple.leastConn.label',
    value: LEAST_CONN,
  },
  {
    label: 'cruDestinationRule.loadBalancer.simple.random.label',
    value: RANDOM,
  },
  {
    label: 'cruDestinationRule.loadBalancer.simple.passthrough.label',
    value: PASSTHROUGH,
  },
]

export default Component.extend({
  layout,

  trafficPolicy: null,

  isSimpleMode:       true,
  lbModes:            LB_MODES,
  consistentHashMode: SOURCE_IP,
  model:              alias('trafficPolicy.loadBalancer'),

  init() {
    this._super(...arguments);

    this.initLB();
  },

  isSimpleModeDidChange: observer('isSimpleMode', function() {
    const isSimpleMode = get(this, 'isSimpleMode');

    if ( isSimpleMode ) {
      set(this, 'trafficPolicy.loadBalancer', { simple: ROUND_ROBIN });
    } else {
      setProperties(this, {
        'consistentHashMode':              SOURCE_IP,
        'trafficPolicy.loadBalancer': {
          consistentHash: {
            useSourceIp:     true,
            minimumRingSize: RING_SIZE
          }
        }
      });
    }
  }),

  consistentHashModeDidChange: observer('consistentHashMode', function() {
    const consistentHashMode = get(this, 'consistentHashMode');

    if ( consistentHashMode === SOURCE_IP ) {
      set(this, 'model', {
        consistentHash: {
          useSourceIp:     true,
          minimumRingSize: RING_SIZE
        }
      });
    } else if ( consistentHashMode === COOKIE ) {
      set(this, 'model', {
        consistentHash: {
          httpCookie: {
            ttl:  '0s',
            name: ''
          },
          minimumRingSize: RING_SIZE
        }
      });
    } else if ( consistentHashMode === HEADER ) {
      set(this, 'model', {
        consistentHash:  {
          httpHeaderName:  '',
          minimumRingSize: RING_SIZE
        },
      });
    }
  }),

  initLB() {
    if ( !get(this, 'trafficPolicy.loadBalancer') ) {
      set(this, 'trafficPolicy.loadBalancer', { simple: ROUND_ROBIN });
    }

    if ( get(this, 'model.consistentHash.useSourceIp') ) {
      setProperties(this, {
        consistentHashMode: SOURCE_IP,
        isSimpleMode:       false
      })
    } else if ( get(this, 'model.consistentHash.httpHeaderName') ) {
      setProperties(this, {
        consistentHashMode: HEADER,
        isSimpleMode:       false
      })
    } else if ( get(this, 'model.consistentHash.httpCookie.name') ) {
      setProperties(this, {
        consistentHashMode: COOKIE,
        isSimpleMode:       false
      })
    }
  },

});
