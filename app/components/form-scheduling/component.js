import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';

export default Ember.Component.extend(ManageLabels, {
  // Inputs
  // Global scale scheduling
  isGlobal: false,

  // Is this for a service(=true) or container(=false)
  isService: false,

  // Request a specific host
  requestedHostId: null,

  // Is requesting a specific host allowed
  canRequestHost: true,

  // All the hosts, for generating dropdowns
  allHosts: null,

  // Initial labels and host to start with
  initialLabels: null,
  initialHostId: null,

  // labelArray -> the labels that should be set for the scheduling rules

  // Actions output
  // setLabels(labelArray)
  // setGlobal(boolean)
  // setRequestedHost(hostId)

  // Internal properties
  isRequestedHost: false,

  tagName: '',

  actions: {
    addSchedulingRule() {
      this.send('addAffinityLabel');
    },

    removeSchedulingRule(obj) {
      this.send('removeLabel', obj);
    },
  },

  didInitAttrs() {
    this.initLabels(this.get('initialLabels'), 'affinity');

    if ( this.get('isGlobal') )
    {
      this.setProperties({
        isRequestedHost: false,
        requestedHostId: null,
      });
      this.sendAction('setGlobal', true);
      this.sendAction('setRequestedHost', null);
    }
    else if ( this.get('initialHostId') )
    {
      this.setProperties({
        isRequestedHost: true,
        requestedHostId: this.get('initialHostId'),
      });

      this.sendAction('setGlobal', false);
      this.sendAction('setRequestedHost', this.get('requestedHostId'));
    }
  },

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },

  globalDidChange: function() {
    if ( this.get('isGlobal') )
    {
      this.set('isRequestedHost',false);
    }
  }.observes('isGlobal'),

  isRequestedHostDidChange: function() {
    if ( this.get('isRequestedHost') )
    {
      var hostId = this.get('requestedHostId') || this.get('hostChoices.firstObject.id');
      this.set('requestedHostId', hostId);
    }
    else
    {
      this.set('requestedHostId', null);
    }
  }.observes('isRequestedHost'),

  requestedHostIdDidChange: function() {
    var hostId = this.get('requestedHostId');

    if ( hostId )
    {
      this.set('isRequestedHost', true);
      this.sendAction('setGlobal', false);
    }

    this.sendAction('setRequestedHost', hostId);
  }.observes('requestedHostId'),

  hostChoices: function() {
    var list = this.get('allHosts').map((host) => {
      var hostLabel = (host.get('name') || '('+host.get('id')+')');
      if ( host.get('state') !== 'active' )
      {
        hostLabel += ' (' + host.get('state') + ')';
      }

      return {
        id: host.get('id'),
        name: hostLabel,
      };
    });

    return list.sortBy('name','id');
  }.property('allHosts.@each.{id,name,state}'),

});
