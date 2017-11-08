import { oneWay } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  settings: service(),

  // GitHub auth params
  queryParams     : ['error_description','state','code','isTest', 'isPopup','redirectTo'],

  resourceActions : service('resource-actions'),
  tooltipService  : service('tooltip'),

  tooltip         : oneWay('tooltipService.tooltipOpts.type'),
  tooltipTemplate : oneWay('tooltipService.tooltipOpts.template'),

  error             : null,
  error_description : null,
  state             : null,
  code              : null,
  isTest            : null,
  isPopup           : null,
  redirectTo        : null,

  actions: {
    clickedAction: function(actionName) {
      this.get('resourceActions').triggerAction(actionName);
    },
  },

  // currentRouteName is set by Ember.Router
  // but getting the application controller to get it is inconvenient sometimes
  currentRouteNameChanged: function() {
    this.set('app.currentRouteName', this.get('currentRouteName'));
  }.observes('currentRouteName'),

});
