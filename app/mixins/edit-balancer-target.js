import Ember from 'ember';

// New Format: [hostname][:srcPort][/path]:dstPort
// Older format: dstPort:[hostname][/path]
export function parseTarget(str) {
  var srcPort = null, dstPort = null, hostname = null, path = null;
  var idx;
  str = str.trim();

  var parts = str.split(':');
  if ( parts.length === 2 )
  {
    if ( !parts[0].length || !parts[1].length)
    {
      // Invalid: ":something" or "something:"
      return null;
    }

    if ( parts[0].match(/^[0-9]+$/) )
    {
      // old: dstPort:[hostname][/path] or new: /path:dstPort
      if ( parts[1].match(/^[0-9]+$/) )
      {
        srcPort = parseInt(parts[0], 10);
        dstPort = parseInt(parts[1], 10);
      }
      else
      {
        dstPort = parseInt(parts[0], 10);

        idx = parts[1].indexOf('/');
        if ( idx >= 0 )
        {
          hostname = parts[1].substr(0,idx) || null;
          path = parts[1].substr(idx);
        }
        else
        {
          hostname = parts[1];
          path = null;
        }
      }
    }
    else
    {
      // new: [hostname][/path]:dstPort or srcPort[/path]:dstPort
      dstPort = parseInt(parts[1], 10);
      idx = parts[0].indexOf('/');
      if ( idx === -1 )
      {
        srcPort = null;
        hostname = parts[0];
        path = null;
      }
      else
      {
        var begin = parts[0].substr(0,idx);
        var end = parts[0].substr(idx);

        if ( begin.match(/^[0-9]+$/) )
        {
          // new: srcPort[/path]:dstPort
          hostname = null;
          srcPort = parseInt(begin, 10);
          path = end;
        }
        else
        {
          // new: hostname/path:dstPort
          hostname = begin || null;
          srcPort = null;
          path = end;
        }
      }
    }
  }
  else if ( parts.length === 3)
  {
    if ( !parts[0].length || !parts[1].length || !parts[2].length)
    {
      // Invalid: ":something" or "something:" or "something::something"
      return null;
    }

    // [hostname]:srcPort[/path]:dstPort
    dstPort = parseInt(parts[2], 10);
    hostname = parts[0];
    idx = parts[1].indexOf('/');
    if ( idx === -1 )
    {
      srcPort = parseInt(parts[1], 10);
      path = null;
    }
    else
    {
      srcPort = parseInt(parts[1].substr(0,idx), 10);
      path = parts[1].substr(idx);
    }
  }
  else
  {
    // Invalid
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

  // New Format: [hostname][:srcPort][/path]:dstPort
  if ( hostname || srcPort || path )
  {
    var str = hostname || '';
    if ( srcPort )
    {
      str += (str ? ':' : '') + srcPort;
    }
    if ( path ) {
      str += path;
    }
    str += ':' + dstPort;

    return str;
  }
  else
  {
    return null;
  }
}


export default Ember.Mixin.create({
  targetsArray: null,
  initTargets: function(service) {
    var out = [];
    var existing = null;
    if ( service )
    {
     existing = service.get('consumedServicesWithNames');
    }

    if ( existing )
    {
      existing.forEach((map) => {
        map.get('ports').forEach((str) => {
          var obj = parseTarget(str);
          if ( obj )
          {
            obj.setProperties({
              isService: true,
              value: map.get('service.id'),
            });

            out.pushObject(obj);
          }
        });
      });
    }

    this.set('targetsArray', out);
  },

  targetResources: function() {
    var out = [];
    this.get('targetsArray').filterProperty('isService',true).filterProperty('value').filterProperty('dstPort').map((choice) => {
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
