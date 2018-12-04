import Component from '@ember/component';
import Metrics from 'shared/mixins/metrics';
import layout from './template';
import { get, set, observer } from '@ember/object';
import { formatSecond } from 'shared/utils/util';

export default Component.extend(Metrics, {
  layout,

  filters: { displayResourceType: 'kube-component' },

  singleStatsDidChange: observer('single.[]', function() {
    const responseSeconds = (get(this, 'single') || []).findBy('graph.title', 'ingresscontroller-upstream-response-seconds');

    if ( responseSeconds ) {
      set(this, 'responseSeconds', (get(responseSeconds, 'series') || [])
        .sortBy('series.firstObject.points.firstObject.firstObject').map((serie) => {
          const name = get(serie, 'name') || '';
          const tokens = name.substring(24, get(name, 'length') - 1).split(' ');
          let host;
          let path;

          if ( get(tokens, 'length') === 2 ) {
            host = tokens[0].substring(7, get(tokens[0], 'length'));
            path = tokens[1].substring(5, get(tokens[1], 'length'));
          }

          return {
            host,
            path,
            time: formatSecond(get(serie, 'points.firstObject.firstObject'))
          }
        }));
    }
  })

});
