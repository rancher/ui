import Ember from 'ember';
import { parsePortSpec } from 'ui/utils/parse-port';

const protocolOptions = [
  {label: 'TCP', value: 'tcp'},
  {label: 'UDP', value: 'udp'}
];

export default Ember.Component.extend({
  // Inputs

  // The initial ports to show, as an array of objects
  initialPorts    : null,

  // Ignore the ID and force each initial port to be considered 'new' (for clone)
  forceNew        : false,
  errors          : null,
  editing         : false,
  tagName         : '',
  portsArray      : null,
  portsAsStrArray : null,
  protocolOptions : protocolOptions,

  init() {
    this._super(...arguments);

    var out      = [];
    var forceNew = this.get('forceNew');

    var ports    = this.get('initialPorts');
    if ( ports )
    {
      ports.forEach(function(value) {
        if ( typeof value === 'object' )
        {
          var pub = '';
          var existing = !forceNew && !!value.id;
          if ( value.publicPort )
          {
            pub = value.publicPort+'';
          }

          if ( !existing && pub && value.bindAddress )
          {
            pub = value.bindAddress + ':' + pub;
          }

          out.push({
            existing: existing,
            obj: value,
            bindAddress: value.bindAddress||null,
            public: pub,
            private: value.privatePort,
            protocol: value.protocol,
          });
        }
        else if ( typeof value === 'string' )
        {
          // Strings, from clone
          var parsed = parsePortSpec(value);
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

    Ember.run.scheduleOnce('afterRender', () => {
      this.set('portsArray', out);
      this.portsArrayDidChange();
    });
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
      if ( !row.protocol ) {
        return;
      }

      // If there's a public and no private, the private should be the same as public.
      if ( row.public && !row.private )
      {
        let str = row.public +':'+ row.public +'/'+ row.protocol;
        out.push(str);
      }
      else if ( row.private )
      {
        let str = '';
        if ( row.public )
        {
          str = row.public+':';
        }

        str += row.private +'/'+ row.protocol;
        out.push(str);
      }
    });

    this.set('portsAsStrArray', out);
    this.sendAction('changed', this.get('portsArray'));
    this.sendAction('changedStr', this.get('portsAsStrArray'));
  }.observes('portsArray.@each.{public,private,protocol}'),
});
