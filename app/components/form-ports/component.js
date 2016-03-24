import Ember from 'ember';
import { parsePort } from 'ui/utils/parse-port';

const protocolOptions = [
  {label: 'TCP', value: 'tcp'},
  {label: 'UDP', value: 'udp'}
];

export default Ember.Component.extend({
  // Inputs

  // The initial ports to show, as an array of objects
  initialPorts: null,

  // Ignore the ID and force each initial port to be considered 'new' (for clone)
  forceNew: false,

  errors: null,
  editing: false,

  tagName: '',
  portsArray: null,
  portsAsStrArray: null,
  protocolOptions: protocolOptions,

  didInitAttrs() {
    var out = [];
    var forceNew = this.get('forceNew');

    var ports = this.get('initialPorts');
    if ( ports )
    {
      ports.forEach(function(value) {
        if ( typeof value === 'object' )
        {
          var existing = !forceNew && !!value.id;
          out.push({
            existing: existing,
            obj: value,
            public: (value.bindAddress ? value.bindAddress+':' : '') + value.publicPort,
            private: value.privatePort,
            protocol: value.protocol,
          });
        }
        else if ( typeof value === 'string' )
        {
          // Strings, from clone
          var parsed = parsePort(value);
          out.push({
            existing: false,
            public: parsed.host,
            private: parsed.container,
            protocol: parsed.protocol
          });
        }
        else
        {
          console.error('Unknown port value', value);
        }
      });
    }

    this.set('portsArray', out);
    this.portsArrayDidChange();
  },

  actions: {
    addPort: function() {
      this.get('portsArray').pushObject({public: '', private: '', protocol: 'tcp'});
    },
    removePort: function(obj) {
      this.get('portsArray').removeObject(obj);
    },
  },

  portsArrayDidChange: function() {
    var out = [];
    this.get('portsArray').forEach(function(row) {
      if ( row.private && row.protocol )
      {
        var str = row.private+'/'+row.protocol;
        if ( row.public )
        {
          str = row.public + ':' + str;
        }

        out.push(str);
      }
    });

    this.set('portsAsStrArray', out);
    this.sendAction('changed', this.get('portsArray'));
    this.sendAction('changedStr', this.get('portsAsStrArray'));
  }.observes('portsArray.@each.{public,private,protocol}'),
});
