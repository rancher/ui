import Ember from 'ember';
import C from 'ui/utils/constants';
import ManageLabels from 'ui/mixins/manage-labels';
import { parsePortSpec, parseIpPort } from 'ui/utils/parse-port';

export default Ember.Component.extend(ManageLabels, {
  initialPorts: null,
  initialExpose: null,
  initialLabels: null,
  editing: false,

  classNames: ['form-group'],

  actions: {
    addListener: function() {
      this.get('listenersArray').pushObject(Ember.Object.create({
        host: '',
        container: '',
        protocol: 'http',
        ssl: false,
        isPublic: true,
      }));
    },

    removeListener: function(obj) {
      this.get('listenersArray').removeObject(obj);
    },

    changeListener: function(listener, key, val) {
      listener.set(key,val);
    },
  },

  listenersArray: null,

  didInitAttrs: function() {
    var sslPorts = ((this.get('initialLabels')||{})[C.LABEL.BALANCER_SSL_PORTS]||'').split(/,/);

    // Filter empty ports
    sslPorts = sslPorts.map((str) => {
      return parseInt(str,10);
    }).filter((port) => {
      return port > 0;
    });

    var out = [];

    function add(isPublic, str) {
      var obj = parsePortSpec(str, 'http');
      obj.setProperties({
        isPublic: isPublic,
        ssl: sslPorts.indexOf(obj.get('hostPort')) >= 0,
      });
      out.push(obj);
    }

    (this.get('initialPorts')||[]).forEach(add.bind(null,true));
    (this.get('initialExpose')||[]).forEach(add.bind(null,false));

    this.set('listenersArray', out.sortBy('host','protocol'));
    this.initLabels();
    this.listenersChanged();
    this.sslChanged();

    if ( out.get('length') === 0 )
    {
      this.send('addListener');
    }
  },

  listenersChanged: function() {
    this.sendAction('changed', this.get('listenersArray'));
  }.observes('listenersArray.[]'),

  sslChanged: function() {
    var sslPorts = this.get('listenersArray')
      .filterBy('ssl',true)
      .map((listener) => { return parseIpPort(listener.get('host'),'http'); })
      .filter((obj) => { return obj && obj.port; })
      .map((obj) => { return obj.port; })
      .sort().uniq();

    if ( sslPorts.get('length') )
    {
      this.setLabel(C.LABEL.BALANCER_SSL_PORTS, sslPorts.join(','));
    }
    else
    {
      this.removeLabel(C.LABEL.BALANCER_SSL_PORTS);
    }

  }.observes('listenersArray.@each.{ssl,host}'),

  sourceProtocolOptions: function() {
    return ['http','tcp'];
  }.property(),

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },
});
