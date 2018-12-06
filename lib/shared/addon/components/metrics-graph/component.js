import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { set, get, observer } from '@ember/object';

export default Component.extend({
  settings: service(),

  layout,

  rows:        null,
  graphs:      null,
  loading:     null,
  noGraphs:    null,
  noDataLabel: 'metricsAction.noData',

  graphsDidChange: observer('graphs', function() {
    let out = [];
    const graphs = (get(this, 'graphs') || []);

    graphs.forEach((graph, index) => {
      if (index % 3 === 0) {
        out.pushObject([graph]);
      } else {
        get(out, 'lastObject').pushObject(graph);
      }
    });
    set(this, 'rows', out);
  }),
});
