import { equal } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';

var ServiceLog = Resource.extend({
  router: service(),

  actions: {
    goToInstance() {
      let id = this.get('instanceId');
      this.get('store').find('instance', id).then((inst) => {
        if ( inst.get('type').toLowerCase() === 'virtualmachine' )
        {
          this.get('router').transitionTo('virtualmachine', id);
        }
        else
        {
          this.get('router').transitionTo('container', id);
        }
      });
    }
  },

  availableActions: function() {
    let choices = [
      {label: 'action.viewInstance', icon: 'icon icon-container', action: 'goToInstance', enabled: !!this.get('instanceId') },
      { divider: true },
      { label: 'action.viewInApi',      icon: 'icon icon-external-link',    action: 'goToApi',        enabled: true },
    ];

    return choices;
  }.property('instanceId'),

  runTime: computed('created', 'endTime', function(){
    if ( this.get('endTime') ) {
      let sec =  moment(this.get('endTime')).diff(this.get('created'), 'seconds');
      if (sec > 0) {
        return sec + " sec";
      }
    } else {
      return "Running";
    }
  }),

  isError: equal('level','error'),

  displayState: computed('level', function() {
    return this.get('level').toUpperCase();
  }),
});

export default ServiceLog;
