import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  },

  model: function(/*params, transition*/) {
    var model = this.get('store').createRecord({
      type: 'project',
      name: '',
      description: '',
    });

    if ( this.get('app.authenticationEnabled') )
    {
      var me = Ember.Object.create({
        externalId: this.get('session').get(C.SESSION.USER_ID),
        externalIdType: C.PROJECT.TYPE_USER,
        role: C.PROJECT.ROLE_OWNER
      });
      model.set('members', [me]);
    }
    else
    {
      model.set('members',[]);
    }

    return model;
  },

  setupController: function(controller,model) {
    this._super();
    controller.set('model', model);
    controller.set('editing',false);
    controller.set('isAdding',false);
    controller.initFields();
  },

  activate: function() {
    this.send('setPageLayout', {label: 'All Projects', backRoute: 'projects'});
  },
});
