import Component from '@ember/component';
import Metrics from 'shared/mixins/metrics';
import layout from './template';
import { get, set, observer } from '@ember/object';

export default Component.extend(Metrics, {
  layout,

  filters: { resourceType: 'etcd' },

  singleStatsDidChange: observer('single.[]', function() {
    const leaderChange = (get(this, 'single') || []).findBy('graph.title', 'etcd-leader-change');

    if ( leaderChange ) {
      set(this, 'leaderChange', get(leaderChange, 'series.firstObject.points.firstObject.firstObject'));
    }

    const hasLeader = (get(this, 'single') || []).findBy('graph.title', 'etcd-server-leader-sum');

    if ( hasLeader ) {
      set(this, 'hasLeader', get(hasLeader, 'series.firstObject.points.firstObject.firstObject') === 1);
    }

    const failedProposals = (get(this, 'single') || []).findBy('graph.title', 'etcd-server-failed-proposal');

    if ( failedProposals ) {
      set(this, 'failedProposals', get(failedProposals, 'series.firstObject.points.firstObject.firstObject'));
    }
  })

});
