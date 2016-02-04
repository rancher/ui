import Ember from 'ember';

const protocolOptions = [
  {label: 'TCP', value: 'TCP'},
  {label: 'UDP', value: 'UDP'}
];

export default Ember.Component.extend({
  // Inputs

  // The initial ports to show, as an array of objects
  initialPorts: null,

  errors: null,
  editing: false,

  tagName: 'div',
  classNames: ['row','form-group'],
  portsArray: null,
  protocolOptions: protocolOptions,

  didInitAttrs() {
    var out = [];
    var forceNew = this.get('forceNew');

    var ports = this.get('initialPorts')||[];
    out = JSON.parse(JSON.stringify(ports));

    this.set('portsArray', out);
    if ( !out.length )
    {
      this.send('addPort');
    }

    this.portsArrayDidChange();
  },

  actions: {
    addPort: function() {
      this.get('portsArray').pushObject({
        name: '',
        protocol: 'TCP',
        port: '',
        targetPort: '',
        nodePort: 0
      });
    },

    removePort: function(obj) {
      this.get('portsArray').removeObject(obj);
    },
  },

  portsArrayDidChange: function() {
    var out = [];
    this.get('portsArray').forEach(function(row) {
      if ( row.port )
      {
        out.push(row);
      }
    });

    this.sendAction('changed', out);
  }.observes('portsArray.@each.{name,protocol,port,targetPort,nodePort}'),
});
