import Ember from 'ember';

const MAX_POINTS = 60;

export default Ember.Mixin.create({
  cpuData: null,
  memoryData: null,
  networkData: null,
  storageData: null,

  cpuMax: null,
  memoryMax: null,
  networkMax: null,
  storageMax: null,

  onDataPoint(point) {
    var id = point.id;

    var row, val;

    // CPU
    row = this.getOrCreateDataRow('cpu', id);
    val = point.cpu_total || 0;
    var max = point.cpu_count * 100;
    if ( max > this.get('cpuMax') )
    {
      // CPU is special because it's a percentage..
      this.set('cpuMax', max);
    }
    row.push(val);
    row.splice(0,1);
    row.arrayContentDidChange();


    // Memory
    row = this.getOrCreateDataRow('memory', id);
    val = point.mem_used_mb || 0;
    if ( val > this.get('memoryMax') )
    {
      this.set('memoryMax', val);
    }
    row.push(val);
    row.splice(0,1);
    row.arrayContentDidChange();

    // Network
    row = this.getOrCreateDataRow('network', id);
    val = (point.net_rx_kb || 0) + (point.net_tx_kb || 0);
    if ( val > this.get('networkMax') )
    {
      this.set('networkMax', val);
    }
    row.push(val);
    row.splice(0,1);
    row.arrayContentDidChange();

    // Storage
    row = this.getOrCreateDataRow('storage', id);
    val = (point.disk_read_kb || 0) + (point.disk_write_kb || 0);
    if ( val > this.get('storageMax') )
    {
      this.set('storageMax', val);
    }
    row.push(val);
    row.splice(0,1);
    row.arrayContentDidChange();
  },

  instancesById: function() {
    var out = Ember.Object.create();
    this.get('model.instances').forEach((instance) => {
      out.set(instance.get('id'),instance);
    });
    return out;
  }.property('model.instances.@each.id'),

  getOrCreateDataRow(key, id) {
    var data = this.get(key+'Data');
    if ( !data )
    {
      data = Ember.Object.create();
      this.set(key+'Max', 0);
      this.set(key+'Data', data);
    }

    var row = data.get(id);
    if ( !row )
    {
      row = [];
      for ( var i = 0 ; i < MAX_POINTS ; i++ )
      {
        row.pushObject(0);
      }
      data.set(id,row);
    }

    var instance = this.get('instancesById.'+id);
    if ( instance && !instance.get(key+'Spark') )
    {
      instance.set(key+'Spark',row);
    }

    return row;
  }
});
