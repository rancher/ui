import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

function modeToType(mode) {
  if ( mode === 'externalhostname' || mode === 'externalip' ) {
    return 'externalservice';
  } else {
    return mode;
  }
}

export default Ember.Component.extend(NewOrEdit, {
  record: null,
  editing: true,

  classNames: ['inline-form'],
  primaryResource: Ember.computed.alias('record'),

  mode: null,
  targetServicesMap: null,
  targetIpArray: null,


  actions: {
    done() {
      this.send('cancel');
    },

    setTargetServices(array, resources) {
      this.set('targetServicesMap', resources);
    },

    addTargetIp() {
      this.get('targetIpArray').pushObject({value: null});
    },

    removeTargetIp(obj) {
      this.get('targetIpArray').removeObject(obj);
    },
  },

  init() {
    this._super(...arguments);
    this.set('record', this.get('originalModel').clone());
    let type = this.get('record.type').toLowerCase();
    let mode = type;
    if ( type === 'externalservice' ) {
      if ( this.get('record.hostname') ) {
        mode = 'externalhostname';
      } else {
        mode = 'externalip';
      }
    }

    this.set('mode', mode);

    this.set('targetServicesMap',[]);
    this.set('targetIpArray',[]);
  },

  modeChanged: function() {
    let mode = this.get('mode');
    let type = modeToType(mode);
    let neu = this.get('store').createRecord(this.get('record').serialize(), {type: type});
    this.set('record', neu);
  }.observes('mode'),

  didSave() {
    if ( this.get('mode') === 'dnsservice' ) {
      return this.get('record').doAction('setservicelinks', {
        serviceLinks: this.get('targetServicesMap'),
      });
    }
  },

  doneSaving() {
    this.send('cancel');
  },
});

/*
  },

  which         : null,
  showWhich     : true,
  userHostname  : null,
  targetIpArray : null,

  init() {
    this._super(...arguments);

    var hostname = this.get('service.hostname');
    if ( hostname )
    {
      this.set('userHostname', hostname);
      this.set('which','hostname');
      this.set('targetIpArray',[]);
    }
    else
    {
      var ips = this.get('service.externalIpAddresses');
      var out = [];
      if ( ips )
      {
        ips.forEach((ip) => {
          out.push({ value: ip });
        });
      }
      else
      {
        out.push({value: null});
      }

      this.set('targetIpArray', out);
      this.set('which','ip');
    }
  },

  valuesDidChange: function() {
    if ( this.get('which') === 'hostname' )
    {
      this.setProperties({
        'service.hostname': this.get('userHostname'),
        'service.externalIpAddresses': null
      });
    }
    else
    {
      var targets = this.get('targetIpArray');
      if ( targets )
      {
        var out =  targets.filterBy('value').map((choice) => {
          return Ember.get(choice,'value');
        }).uniq();

        this.setProperties({
          'service.hostname': null,
          'service.externalIpAddresses': out
        });
      }
    }
  }.observes('targetIpArray.@each.{value}','userHostname','which'),
});
*/
