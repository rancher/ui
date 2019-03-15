import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { set, get, observer } from '@ember/object';

export default Component.extend({
  settings: service(),

  layout,

  rows:          null,
  graphs:        null,
  loading:       null,
  noGraphs:      null,
  noDataLabel:   'metricsAction.noData',
  currentGraphs: null,

  graphsDidChange: observer('graphs', function() {
    let out = [];
    const graphs = (get(this, 'graphs') || []);
    const newGrahps = graphs.map((graph) => get(graph, 'graph.title') || '').join(',');
    const changed = newGrahps !== get(this, 'currentGraphs');

    set(this, 'currentGraphs', newGrahps);

    if ( changed )  {
      graphs.forEach((graph, index) => {
        if (index % 3 === 0) {
          out.pushObject([graph]);
        } else {
          get(out, 'lastObject').pushObject(graph);
        }
      });
      set(this, 'rows', out);
    } else {
      let rowIndex = -1;
      const currentRows = get(this, 'rows') || [];

      graphs.forEach((graph, index) => {
        let colIndex = index % 3;

        if ( colIndex === 0 ) {
          rowIndex++;
        }
        let row = currentRows.objectAt(rowIndex) || [];

        set(row.objectAt(colIndex), 'series', get(graph, 'series') );
      });
    }
  }),
});
