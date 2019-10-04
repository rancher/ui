import Component from '@ember/component';
import es from 'logging/mixins/target-elasticsearch';
import { get, computed, setProperties, set } from '@ember/object';
import { alias } from '@ember/object/computed'
import parseUri from 'shared/utils/parse-uri';
import $ from 'jquery';

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
  didInsertElement() {
    $('#elasticsearch-endpoint').focus()
  },

  actions: {
    alertMessage(value = '') {
      const urlParser = parseUri(value) || {}

      set(this, 'endpointError', true)
      if (value.startsWith('https://') || value.startsWith('http://')) {
        if (urlParser.host) {
          setProperties(this, {
            endpointError:     false,
            endpointErrorText: null,
          })
        } else {
          set(this, 'endpointErrorText', endpointText.hostError)
        }
      } else {
        set(this, 'endpointErrorText', endpointText.protocolError)
      }
    },
  },

  enableSSLConfig: computed('config.endpoint', function() {
    const endpoint = get(this, 'config.endpoint') || ''

    if (endpoint.startsWith('https')) {
      return true
    } else {
      return false
    }
  }),

  indexFormat: computed('pageScope', function() {
    const ps = get(this, 'pageScope');

    return ps === 'cluster' ? '${clusterName}-${dateFormat}' : '${clusterName}_${projectName}-${dateFormat}';
  }),

});
