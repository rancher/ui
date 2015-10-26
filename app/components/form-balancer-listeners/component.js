import Ember from 'ember';
import C from 'ui/utils/constants';
import ManageLabels from 'ui/mixins/manage-labels';

export default Ember.Component.extend(ManageLabels, {
  initialListeners: null,
  editing: false,

  classNames: ['form-group'],

  actions: {
    addListener: function() {
      this.get('listenersArray').pushObject(this.get('store').createRecord({
        type: 'loadBalancerListener',
        name: 'uilistener',
        isPublic: true,
        sourcePort: '',
        sourceProtocol: 'http',
        ssl: false,
        targetPort: '',
        targetProtocol: null,
      }));
    },

    removeListener: function(obj) {
      this.get('listenersArray').removeObject(obj);
    },

    chooseProtocol: function(listener, key, val) {
      listener.set(key,val);
    },

    setPublic: function(listener, isPublic) {
      listener.set('isPublic', isPublic);
    },
  },

  listenersArray: null,

  didInitAttrs: function() {
    var store = this.get('store');

    var out = [];
    var existingService = this.get('initialListeners');
    if ( existingService )
    {
      existingService.forEach((l) => {
        var protocol = l.get('sourceProtocol');
        var ssl = false;
        if ( protocol === 'https' )
        {
          ssl = true;
          protocol = 'http';
        }
        else if ( protocol === 'ssl' )
        {
          ssl = true;
          protocol = 'tcp';
        }

        out.push(store.createRecord({
          type: 'loadBalancerListener',
          name: 'uilistener',
          isPublic: !!l.get('sourcePort'),
          sourcePort: l.get('sourcePort') ? l.get('sourcePort') : l.get('privatePort'),
          sourceProtocol: protocol,
          ssl: ssl,
          targetPort: l.get('targetPort'),
        }));
      });
    }
    else
    {
      out.push(store.createRecord({
        type: 'loadBalancerListener',
        name: 'uilistener',
        isPublic: true,
        sourcePort: '',
        sourceProtocol: 'http',
        ssl: false,
        targetPort: '',
      }));
    }


    this.set('listenersArray', out.sortBy('sourcePort'));
    this.initLabels();
    this.listenersChanged();
    this.sslChanged();
  },

  listenersChanged: function() {
    this.sendAction('changed', this.get('listenersArray'));
  }.observes('listenersArray.[]'),

  sslChanged: function() {
    var sslPorts = this.get('listenersArray').
                filterBy('sourcePort').
                filterBy('ssl',true).map((listener) => { return listener.get('sourcePort');});

    if ( sslPorts.get('length') )
    {
      this.setLabel(C.LABEL.BALANCER_SSL_PORTS, sslPorts.join(','));
    }
    else
    {
      this.removeLabel(C.LABEL.BALANCER_SSL_PORTS);
    }

  }.observes('listenersArray.@each.{ssl,sourcePort}'),

  sourceProtocolOptions: function() {
    return ['http','tcp'];
  }.property(),

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },
});
