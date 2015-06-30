import Ember from 'ember';
import C from 'ui/utils/constants';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';

export default Ember.Controller.extend(CattleTransitioningController, {
  prefs: Ember.inject.service(),
  projects: Ember.inject.service(),

  actions: {
    edit: function() {
      this.transitionToRoute('project.edit', this.get('model.id'));
    },

    delete: function() {
      return this.delete().then(() => {
        // If you're in the project that was deleted, go back to the default project
        if ( this.get('model.id') === this.get('session.'+ C.SESSION.PROJECT) )
        {
          window.location.href = window.location.href;
        }
      });
    },

    activate: function() {
      return this.doAction('activate').then(() => {
        this.get('projects').refreshAll();
      });
    },

    deactivate: function() {
      return this.doAction('deactivate').then(() => {
        if ( this.get('model.id') === this.get('session.'+ C.SESSION.PROJECT) )
        {
          window.location.href = window.location.href;
        }
      });
    },

    setAsDefault: function() {
      this.get('prefs').set(C.PREFS.PROJECT_DEFAULT, this.get('model.id'));
    },

    switchTo: function() {
      this.send('switchProject', this.get('model.id'));
    },
  },
});
