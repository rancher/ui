import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { get, set, computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import json2yaml from 'json2yaml';
import ModalBase from 'shared/mixins/modal-base';
import fetchYaml from 'shared/utils/fetch-yaml';
import layout from './template';
import { on } from '@ember/object/evented';

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

export default Component.extend(ModalBase, {
  scope:      service(),
  growl:      service(),

  classNames: ['modal-container', 'large-modal', 'fullscreen-modal', 'modal-shell', 'alert'],
  layout,

  loading:      null,
  selectedType: VIRTUAL_SERVICES,
  options:      OPTIONS,

  name:      alias('modalService.modalOpts.name'),
  appId:     alias('modalService.modalOpts.appId'),
  namespace: alias('modalService.modalOpts.namespace'),

  init() {
    this._super(...arguments);

    set(this, 'options', OPTIONS.map((opt) => {
      return {
        label: opt,
        value: opt
      }
    }));
  },


  selectedTypeDidChange: on('init', observer('selectedType', function() {
    this.loadIstioResources(get(this, 'selectedType'));
  })),

  filename: computed('selectedType', function() {
    return `${ get(this, 'selectedType') }.yaml`;
  }),

  loadIstioResources(type) {
    const appId = get(this, 'appId');
    const namespace = get(this, 'namespace');

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
