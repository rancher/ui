import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';
import { reference } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';

export default Resource.extend({
  intl:         service(),
  scope:        service(),
  clusterStore: service(),

  canEditYaml: true,

  namespace: reference('namespaceId', 'namespace', 'clusterStore'),

  displayKind: computed('intl.locale', 'kind', function() {
    const intl = get(this, 'intl');

    if ( get(this, 'kind') === 'LoadBalancer' ) {
      return intl.t('model.service.displayKind.loadBalancer');
    } else {
      return intl.t('model.service.displayKind.generic');
    }
  }),

  proxyEndpoints: computed('labels', function(){
    const parts = []
    const labels = get(this, 'labels');
    const location = window.location;

    if ( labels && labels['kubernetes.io/cluster-service'] === 'true' ) {
      (get(this, 'ports') || []).forEach((port) => {
        const linkEndpoint = `${ location.origin }/k8s/clusters/${ get(this, 'scope.currentCluster.id') }/api/v1/namespaces/${ get(this, 'namespaceId') }/services/${ get(port, 'targetPort') }:${ get(this, 'name') }:/proxy/`;

        parts.push({
          linkEndpoint,
          displayEndpoint: '/index.html',
          protocol:        location.protocol.substr(0, location.protocol.length - 1),
          isTcpish:        true,
          isReady:         true,
        });
      });
    }

    return parts;
  }),
});
