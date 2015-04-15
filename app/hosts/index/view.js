import Ember from 'ember';
import ColumnView from 'ui/utils/column-view';

export default ColumnView.extend({
  columns: function() {
    var podCount = 0;
    var idx = 0;
    var hosts = this.get('context.hosts').sortBy('name');
    var machines = this.get('context.machines').sortBy('name');
    var columnCount = this.get('columnCount');
    var i;

    // Pre-initialize all the columns
    var columns = [];
    for ( i = 0 ; i < columnCount ; i++ )
    {
      columns[i] = [];
    }

    // Copy in the hosts
    for ( i = 0 ; i < hosts.get('length') ; i++ )
    {
      columns[nextIndex()].push(hosts.objectAt(i));
    }

    // Copy in the pending machines
    var machine;
    for ( i = 0 ; i < machines.get('length') ; i++ )
    {
      machine = machines.objectAt(i);
      if ( machine.get('isPending') )
      {
        columns[nextIndex()].push(Ember.Object.create({isPendingMachine: true, machine: machine}));
      }
    }

    // Add a placeholder for where to put the 'Add a host' button
    columns[nextIndex()].push(Ember.Object.create({isNewHostPlaceHolder: true}));

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
  }.property('context.hosts.[]','context.machines.@each.isPending','columnCount'),
});
