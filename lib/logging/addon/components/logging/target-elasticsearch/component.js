import Component from '@ember/component';
import es from 'logging/mixins/target-elasticsearch';
import { get, computed, setProperties, set } from '@ember/object';
import { alias } from '@ember/object/computed'

export default Component.extend(es, {
  showAdvanced: false,
  config: alias('model.config'),
  sslVerify: alias('model.config.sslVerify'),
  endpointError: false,

  didInsertElement() {
    this.$('#elasticsearch-endpoint').focus()
  },

  showSSLConfig: computed('config.endpoint', function() {
    const endpoint = get(this, 'config.endpoint') || ''
    if (endpoint.startsWith('https')) {
      return true
    } else {
      const config = get(this, 'config')
      if (config) {
        setProperties(config, {
          certificate: null,
          clientKey: null,
          clientCert: null,
          clientKeyPass: null,
          sslVerify: false,
        })
      }
      return false
    }
  }),

  indexFormat: function()  {
    const ps = get(this, 'pageScope');
    return ps === 'cluster' ? '${clusterName}-${dateFormat}' : '${clusterName}_${projectName}-${dateFormat}';
  }.property('pageScope'),

  actions: {
    alertMessage(value='') {
      if (value.startsWith('https://') || value.startsWith('http://')) {
        set(this, 'endpointError', false)
      } else {
        set(this, 'endpointError', true)
      }
    },
  },
});
