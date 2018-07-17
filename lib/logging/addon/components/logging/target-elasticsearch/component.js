import Component from '@ember/component';
import es from 'logging/mixins/target-elasticsearch';
import {
  get, computed, setProperties, set
} from '@ember/object';
import { alias } from '@ember/object/computed'
import parseUri from 'shared/utils/parse-uri';

const endpointText = {
  hostError:     'loggingPage.elasticsearch.endpointHostError',
  protocolError: 'loggingPage.elasticsearch.endpointProtocolError',
}

export default Component.extend(es, {
  showAdvanced:      false,
  endpointError:     false,
  endpointErrorText: null,

  config:        alias('model.config'),
  sslVerify:     alias('model.config.sslVerify'),
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

  indexFormat: function()  {
    const ps = get(this, 'pageScope');

    return ps === 'cluster' ? '${clusterName}-${dateFormat}' : '${clusterName}_${projectName}-${dateFormat}';
  }.property('pageScope'),

  didInsertElement() {
    this.$('#elasticsearch-endpoint').focus()
  },

  actions: {
    alertMessage(value = '') {
      const urlParser = parseUri(value) || {}

      set(this, 'endpointError', true)
      if (value.startsWith('https://') || value.startsWith('http://')) {
        if (urlParser.host) {
          set(this, 'endpointError', false)
        } else {
          set(this, 'endpointErrorText', endpointText.hostError)
        }
      } else {
        set(this, 'endpointErrorText', endpointText.protocolError)
      }
    },
  },
});
