import Component from '@ember/component';
import { get, set, observer } from '@ember/object';
import json2yaml from 'json2yaml';
import fetchYaml from 'shared/utils/fetch-yaml';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';

const VIRTUAL_SERVICES = 'virtualservices';
const SERVICE_ENTRIES = 'serviceentries';
const DESTINATION_RULES = 'destinationrules';
const GATEWAYS = 'gateways';
const ENVOY_FILTERS = 'envoyfilters';
const APP_ID = 'io.cattle.field/appId';

const OPTIONS = [
  VIRTUAL_SERVICES,
  DESTINATION_RULES,
  GATEWAYS,
  SERVICE_ENTRIES,
  ENVOY_FILTERS,
]

export default Component.extend({
  scope: service(),
  growl: service(),

  options:      OPTIONS,
  selectedType: VIRTUAL_SERVICES,
  rule:         null,
  loading:      false,

  actions: {
    select(type) {
      set(this, 'selectedType', type);
    }
  },

  selectedTypeDidChange: on('init', observer('selectedType', function() {
    this.loadIstioResources(get(this, 'selectedType'));
  })),

  loadIstioResources(type) {
    const appId = get(this, 'rule.name');
    const namespace = get(this, 'rule.namespace.id');

    const yamlLink = `/k8s/clusters/${ get(this, 'scope.currentCluster.id') }/apis/networking.istio.io/v1alpha3/namespaces/${ namespace }/${ type }`;

    set(this, 'loading', true);

    return fetchYaml(yamlLink, false).then((res) => {
      const out = [];
      const data = JSON.parse(res) || {};

      (get(data, 'items') || []).forEach((item) => {
        const labels = get(item, 'metadata.labels') || {};

        if ( labels[APP_ID] === appId ) {
          out.push(item);
        }
      });

      let yaml = out.length > 0 ? json2yaml.stringify(out) : '';

      set(this, 'yaml', yaml);
    }).catch((error) => {
      get(this, 'growl').fromError(get(error, 'message') || get(error, 'xhr.responseJSON.message'));
    }).finally(() => {
      set(this, 'loading', false);
    });
  },
});
