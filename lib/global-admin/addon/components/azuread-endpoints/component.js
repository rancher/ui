import Component from '@ember/component';
import layout from './template';
import { get, set, observer, setProperties } from '@ember/object';
import C from 'ui/utils/constants';

export default Component.extend({
  layout,

  authConfig: null,
  isEnabled:  null,

  region: null,

  init() {
    this._super(...arguments);

    if ( get(this, 'isEnabled') ) {
      const endpoint = get(this, 'authConfig.endpoint');

      if ( C.AZURE_AD.STANDARD.ENDPOINT.startsWith(endpoint) ) {
        set(this, 'region', C.AZURE_AD.STANDARD.KEY);
      } else if ( C.AZURE_AD.CHINA.ENDPOINT.startsWith(endpoint) ) {
        set(this, 'region', C.AZURE_AD.CHINA.KEY);
      } else {
        set(this, 'region', C.AZURE_AD.CUSTOM.KEY);
      }
    } else {
      set(this, 'region', C.AZURE_AD.STANDARD.KEY);
      this.regionDidChange();
    }
  },

  regionDidChange: observer('region', 'authConfig.tenantId', function() {
    const config = get(this, 'authConfig');

    const tenantId = get(this, 'authConfig.tenantId') || '';

    const region = get(this, 'region');

    switch (region) {
    case C.AZURE_AD.STANDARD.KEY:
      setProperties(config, {
        endpoint:      C.AZURE_AD.STANDARD.ENDPOINT,
        graphEndpoint: C.AZURE_AD.STANDARD.GRAPH_ENDPOINT,
        tokenEndpoint: `${ C.AZURE_AD.STANDARD.ENDPOINT }${ tenantId }/oauth2/token`,
        authEndpoint:  `${ C.AZURE_AD.STANDARD.ENDPOINT }${ tenantId }/oauth2/authorize`,
      });
      break;
    case C.AZURE_AD.CHINA.KEY:
      setProperties(config, {
        endpoint:      C.AZURE_AD.CHINA.ENDPOINT,
        graphEndpoint: C.AZURE_AD.CHINA.GRAPH_ENDPOINT,
        tokenEndpoint: `${ C.AZURE_AD.CHINA.ENDPOINT }${ tenantId }/oauth2/token`,
        authEndpoint:  `${ C.AZURE_AD.CHINA.ENDPOINT }${ tenantId }/oauth2/authorize`,
      });
      break;
    case C.AZURE_AD.CUSTOM.KEY:
      setProperties(config, {
        endpoint:      C.AZURE_AD.STANDARD.ENDPOINT,
        graphEndpoint: '',
        tokenEndpoint: '',
        authEndpoint:  '',
      });
      break;
    }
  }),
});
