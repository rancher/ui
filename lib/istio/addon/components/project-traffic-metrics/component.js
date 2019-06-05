import Component from '@ember/component';
import Metrics from 'shared/mixins/metrics';
import layout from './template';
import { observer, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend(Metrics, {
  scope: service(),
  layout,

  filters: { resourceType: 'istioproject' },

  projectScope:  true,
  istio:        true,

  projectDidChange: observer('scope.currentProject.id', function() {
    setProperties(this, {
      'state.noGraphs': true,
      graphs:           [],
      single:           []
    });

    this.send('query', false);
  })
});
