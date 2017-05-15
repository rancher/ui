import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

export default Ember.Component.extend(ManageLabels, {
  intl: Ember.inject.service(),

  // Inputs
  // Global scale scheduling
  isGlobal: false,

  // Is this for a service(=true) or container(=false)
  isService: false,

  // Request a specific host
  requestedHostId: null,

  // Is requesting a specific host allowed
  canRequestHost: true,

  // Initial labels and host to start with
  initialLabels: null,
  initialHostId: null,

  // labelArray -> the labels that should be set for the scheduling rules

  // Actions output
  // setLabels(labelArray)
  // setRequestedHost(hostId)

  // Internal properties
  isRequestedHost: false,

  editing: true,

  classNames: ['accordion-wrapper'],

  actions: {
    addSchedulingRule() {
      this.send('addAffinityLabel');
    },

    removeSchedulingRule(obj) {
      this.send('removeLabel', obj);
    },
  },

  init() {
    this.set('allHosts', this.get('store').all('host'));
    this._super(...arguments);

    this.initLabels(this.get('initialLabels'), 'affinity');

    if ( this.get('isGlobal') )
    {
      this.setProperties({
        isRequestedHost: false,
        requestedHostId: null,
      });
      Ember.run.scheduleOnce('afterRender', () => {
        this.sendAction('setRequestedHost', null);
      });
    }
    else if ( this.get('initialHostId') )
    {
      this.setProperties({
        isRequestedHost: true,
        requestedHostId: this.get('initialHostId'),
      });
    }
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function(item) {
          item.toggleProperty('expanded');
      });
    }
  },

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },

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
    this.sendAction('setRequestedHost', hostId);
  }.observes('requestedHostId'),

  selectedChoice: Ember.computed('allHosts.@each.{id,name,state}', function() {
    return this.get('hostChoices').findBy('id', this.get('initialHostId'));
  }),

  hostChoices: function() {
    var list = this.get('allHosts').map((host) => {
      var hostLabel = host.get('displayName');
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

  statusClass: null,
  status: function() {
    let k = STATUS.ANY;
    let count = this.get('labelArray').filterBy('type','affinity').length;

    if ( this.get('isRequestedHost') ) {
      k = STATUS.SPECIFIC;
    } else if ( count ) {
      if ( this.get('errors.length') ) {
        k = STATUS.INCOMPLETE;
      } else {
        k = STATUS.RULE;
      }
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`, {count: count});
  }.property('isRequestedHost','labelArray.@each.type','errors.length'),
});
