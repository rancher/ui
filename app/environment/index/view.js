import Ember from 'ember';
import ColumnView from 'ui/utils/column-view';

export default ColumnView.extend({
  columns: function() {
    var podCount = 0;
    var idx = 0;
    var services = (this.get('context.services')||[]).sortBy('name');
    var columnCount = this.get('columnCount');
    var i;

    // Pre-initialize all the columns
    var columns = [];
    for ( i = 0 ; i < columnCount ; i++ )
    {
      columns[i] = [];
    }

    // Copy in the services
    for ( i = 0 ; i < services.get('length') ; i++ )
    {
      columns[nextIndex()].push(services.objectAt(i));
    }

    // Add a placeholder for where to put the 'Add Service' and 'Add Balancer' buttons
    columns[nextIndex()].push(Ember.Object.create({isNewPlaceHolder: true, isService: true}));
    columns[nextIndex()].push(Ember.Object.create({isNewPlaceHolder: true, isBalancer: true}));

    this.set('podCount', podCount);

    return columns;

    function nextIndex() {
      var out = idx;

      idx++;
      podCount++;
      if ( idx >= columnCount )
      {
        idx = 0;
      }

      return out;
    }
  }.property('context.services.[]','columnCount'),
});
