import Resource from 'ember-api-store/models/resource';

var ServiceLog = Resource.extend({
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
    let choices = this._super();

    choices.push({
      label: 'action.viewInstance',
      icon: 'icon icon-container',
      action: 'goToInstance',
      enabled: !!this.get('instanceId')
    });

    return choices;
  }.property('instanceId'),
});

export default ServiceLog;
