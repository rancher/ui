import Ember from 'ember';

// New Format: [hostname][:srcPort][/path][=dstPort]
// Older format: dstPort:[hostname][/path]
export function parseTarget(str) {
  var srcPort = null, dstPort = null, hostname = null, path = null;
  str = str.trim();

  var match;
  if ( match = str.match(/^(\d+)$/) )
  {
    // New Format: just a dstPort
    hostname = null;
    srcPort = null;
    path = null;
    dstPort = parseInt(match[1], 10);
  }
  else if ( str.indexOf('=') === -1 && (match = str.match(/(\d+):([^\/]+)?(\/.*)?$/)) )
  {
    // Old Format: dstPort[:hostname][/path]
    hostname = match[2] || null;
    srcPort = null;
    path = match[3] || null;
    dstPort = parseInt(match[1], 10);
  }
  else if ( match = str.match(/([^/=:]+)?(:(\d+))?(\/[^=]+)?(=(\d+))?$/) )
  {
    // New Format: [hostname][:srcPort][/path][=dstPort]
    if ( match[1] && match[1].match(/^\d+$/) && !match[2] )
    {
      // It's a port
      hostname = null;
      srcPort = parseInt(match[1], 10) || null;
    }
    else
    {
      hostname = match[1] || null;
      srcPort = parseInt(match[3], 10) || null;
    }

    dstPort = parseInt(match[6], 10) || null;
    path = match[4] || null;
  }
  else
  {
    return null;
  }

  return Ember.Object.create({
    hostname: hostname,
    srcPort: srcPort,
    dstPort: dstPort,
    path: path
  });
}

export function stringifyTarget(tgt) {
  var srcPort = Ember.get(tgt,'srcPort');
  var dstPort = Ember.get(tgt,'dstPort');
  var hostname = Ember.get(tgt,'hostname');
  var path = Ember.get(tgt,'path');

  // New Format: [hostname][:srcPort][/path][=dstPort]
  if ( hostname || path || dstPort )
  {
    var str = hostname || '';
    if ( srcPort )
    {
      str += (str ? ':' : '') + srcPort;
    }

    if ( path )
    {
      str += (path.substr(0,1) === '/' ? '' : '/') + path;
    }

    if ( dstPort )
    {
      str += (str ? '=' : '') + dstPort;
    }

    return str;
  }
  else
  {
    return null;
  }
}


export default Ember.Mixin.create({
  actions: {
    addTargetService: function() {
      this.get('targetsArray').pushObject(Ember.Object.create({isService: true, value: null}));
    },
    removeTarget: function(obj) {
      this.get('targetsArray').removeObject(obj);
    },

    setAdvanced: function() {
      this.set('isAdvanced', true);
    },
  },

  targetsArray: null,
  initTargets: function(service) {
    this.set('isAdvanced', this.get('editing'));

    var out = [];
    var existing = null;
    if ( service )
    {
     existing = service.get('consumedServicesWithNames');
    }

    if ( existing )
    {
      existing.forEach((map) => {
        if ( map.get('ports.length') )
        {
          map.get('ports').forEach((str) => {
            var obj = parseTarget(str);
            if ( obj )
            {
              this.set('isAdvanced', true);

              obj.setProperties({
                isService: true,
                value: map.get('service.id'),
              });

              out.pushObject(obj);
            }
          });
        }
        else
        {
          out.pushObject(Ember.Object.create({
            isService: true,
            value: map.get('service.id'),
          }));
        }
      });
    }
    else
    {
      out.pushObject(Ember.Object.create({
        isService: true,
        value: null
      }));
    }

    this.set('targetsArray', out);
  },

  targetResources: function() {
    var out = [];
    this.get('targetsArray').filterProperty('isService',true).filterProperty('value').map((choice) => {
      var serviceId = Ember.get(choice,'value');

      var entry = out.filterProperty('serviceId', serviceId)[0];
      if ( !entry )
      {
        entry = Ember.Object.create({
          serviceId: serviceId,
          ports: [],
        });
        out.pushObject(entry);
      }

      var str = stringifyTarget(choice);
      if ( str )
      {
        entry.get('ports').pushObject(str);
      }
    });

    return out;
  }.property('targetsArray.@each.{isService,value,hostname,path,srcPort,dstPort}'),

  targetChoices: function() {
    var list = [];
    var env = this.get('environment');
    var envName = env.get('name') || ('(Stack '+env.get('id')+')');

    env.get('services').map((service) => {
      list.pushObject({
        group: 'Stack: ' + envName,
        id: service.get('id'),
        name: service.get('name') || ('(' + service.get('id') + ')')
      });
    });

    return list.sortBy('group','name','id');
  }.property('environment.services.@each.{name,id},environment.{name,id}').volatile(),

});
