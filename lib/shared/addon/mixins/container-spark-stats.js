import { default as EmberObject, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Mixin from '@ember/object/mixin';

const MAX_POINTS = 60;

export default Mixin.create({
  sparkInstances: alias('model.instances'),

  cpuData:     null,
  memoryData:  null,
  networkData: null,
  storageData: null,

  cpuMax:     null,
  memoryMax:  null,
  networkMax: null,
  storageMax: null,

  onDataPoint(point) {
    var id = point.id;

    var row, val;

    // CPU
    row = this.getOrCreateDataRow('cpu', id);
    val = point.cpu_total || 0;
    var max = point.cpu_count * 100;

    if ( max > this.get('cpuMax') ) {
      // CPU is special because it's a percentage..
      this.set('cpuMax', max);
    }
    row.push(val);
    row.splice(0, 1);
    row.arrayContentDidChange();


    // Memory
    row = this.getOrCreateDataRow('memory', id);
    val = point.mem_used_mb || 0;
    if ( val > this.get('memoryMax') ) {
      this.set('memoryMax', val);
    }
    row.push(val);
    row.splice(0, 1);
    row.arrayContentDidChange();

    // Network
    row = this.getOrCreateDataRow('network', id);
    val = (point.net_rx_kb || 0) + (point.net_tx_kb || 0);
    if ( val > this.get('networkMax') ) {
      this.set('networkMax', val);
    }
    row.push(val);
    row.splice(0, 1);
    row.arrayContentDidChange();

    // Storage
    row = this.getOrCreateDataRow('storage', id);
    val = (point.disk_read_kb || 0) + (point.disk_write_kb || 0);
    if ( val > this.get('storageMax') ) {
      this.set('storageMax', val);
    }
    row.push(val);
    row.splice(0, 1);
    row.arrayContentDidChange();
  },

  // for 1.2+
  instancesByExternalId: computed('sparkInstances.@each.id', function() {
    var out = EmberObject.create();

    (this.get('sparkInstances') || []).forEach((instance) => {
      let id = instance.get('externalId');

      if ( id ) {
        out.set(id, instance);
      }
    });

    return out;
  }),

  // for 1.1
  instancesById: computed('sparkInstances.@each.id', function() {
    var out = EmberObject.create();

    (this.get('sparkInstances') || []).forEach((instance) => {
      let id = instance.get('id');

      if ( id ) {
        out.set(id, instance);
      }
    });

    return out;
  }),

  getOrCreateDataRow(key, id) {
    var data = this.get(`${ key }Data`);

    if ( !data ) {
      data = EmberObject.create();
      this.set(`${ key }Max`, 0);
      this.set(`${ key }Data`, data);
    }

    var row = data.get(id);

    if ( !row ) {
      row = [];
      for ( var i = 0 ; i < MAX_POINTS ; i++ ) {
        row.pushObject(0);
      }
      data.set(id, row);
    }

    var instance = this.get(`instancesByExternalId.${ id }`);

    if ( !instance ) {
      instance = this.get(`instancesById.${ id }`);
    }

    if ( instance && !instance.get(`${ key }Spark`) ) {
      instance.set(`${ key }Spark`, row);
    }

    return row;
  }
});
