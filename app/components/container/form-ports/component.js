import Ember from 'ember';
import { parsePortSpec } from 'ui/utils/parse-port';

const protocolOptions = [
  {label: 'TCP', value: 'tcp'},
  {label: 'UDP', value: 'udp'}
];

export default Ember.Component.extend({
  intl: Ember.inject.service(),

  // The initial ports to show, as an array of objects
  initialPorts    : null,

  // Ignore the ID and force each initial port to be considered 'new' (for clone)
  editing         : false,
  portsArray      : null,
  protocolOptions : protocolOptions,
  showIp          : null,

  init() {
    this._super(...arguments);

    var out      = [];
    var ports    = this.get('initialPorts');
    if ( ports )
    {
      ports.forEach((value) => {
        if ( typeof value === 'object' )
        {
          var pub = '';
          var existing = !!value.id;
          if ( value.publicPort )
          {
            pub = value.publicPort+'';
          }

          if ( value.bindAddress )
          {
            Ember.run.next(() => { this.send('showIp'); });
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
          // Strings, from clone/edit
          var parsed = parsePortSpec(value,'tcp');

          if ( parsed.hostIp )
          {
            Ember.run.next(() => { this.send('showIp'); });
          }

          out.push({
            existing: false,
            bindAddress: parsed.hostIp,
            public: parsed.hostPort,
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
    addPort() {
      this.get('portsArray').pushObject({public: '', private: '', protocol: 'tcp'});
      Ember.run.next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.$('INPUT.public').last()[0].focus();
      });
    },

    removePort(obj) {
      this.get('portsArray').removeObject(obj);
    },

    showIp() {
      this.set('showIp', true);
    },
  },

  portsArrayDidChange: function() {
    var out = [];
    this.get('portsArray').forEach(function(row) {
      if ( !row.protocol ) {
        return;
      }

      let bindAddress = row.bindAddress;
      if ( bindAddress && bindAddress.indexOf(':') > 0 && bindAddress.indexOf('[') !== 0 ) {
        // IPv6
        bindAddress = '[' + bindAddress + ']';
      }

      // If there's a public and no private, the private should be the same as public.
      if ( row.public && !row.private )
      {
        let str = row.public +':'+ row.public +'/'+ row.protocol;
        if ( bindAddress ) {
          str = bindAddress +':'+ str;
        }
        out.push(str);
      }
      else if ( row.private )
      {
        let str = '';

        if ( row.public )
        {
          if ( bindAddress ) {
            str += bindAddress +':';
          }

          str += row.public+':';
        }

        str += row.private +'/'+ row.protocol;
        out.push(str);
      }
    });

    this.sendAction('changed', this.get('portsArray'));
    this.sendAction('changedStr', out);
  }.observes('portsArray.@each.{public,private,protocol}'),

  validate: function() {
    var errors = [];
    let seen = {};

    this.get('portsArray').forEach((row) => {
      if ( !row.private && (row.public || row.bindAddress)) {
        errors.push(this.get('intl').t('formPorts.error.privateRequired'));
      }

      if ( row.bindAddress && !row.public ) {
        errors.push(this.get('intl').t('formPorts.error.publicRequired'));
      }

      if ( row.public ) {
        let key = '['+ (row.bindAddress||'0.0.0.0') + ']:' + row.public + '/' + row.protocol;
        if ( seen[key] ) {
          errors.push(this.get('intl').t('formPorts.error.'+(row.bindAddress ? 'mixedIpPort' : 'mixedPort'), {
            ip: row.bindAddress,
            port: row.public,
            proto: row.protocol,
          }));
        } else {
          seen[key] = true;
        }
      }
    });

    this.set('errors', errors.uniq());
  }.observes('portsArray.@each.{bindAddress,public,private,protocol}'),
});
