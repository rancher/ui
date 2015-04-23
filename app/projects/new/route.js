import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  },

  model: function(/*params, transition*/) {
    var me;
    if ( this.get('app.authenticationEnabled') )
    {
      me = Ember.Object.create({
        externalId: this.get('session').get(C.SESSION.USER_ID),
        externalIdType: C.PROJECT.TYPE_USER,
        role: C.PROJECT.ROLE_OWNER
      });
    }
    else
    {
      me = Ember.Object.create({
        externalId: this.get('session').get(C.SESSION.ACCOUNT_ID),
        externalIdType: C.PROJECT.TYPE_RANCHER,
        role: C.PROJECT.ROLE_OWNER
      });
    }

    var model = this.get('store').createRecord({
      type: 'project',
      externalIdType: 'project:github_user',
      externalId: this.get('session.user'),
      members: [me]
    });

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
