import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';


export default Component.extend({
  globalStore: service(),
  layout,

  classNames: ['accordion-wrapper'],


  model: null,
  paths: null,

  init() {
    this._super(...arguments);
    this.set('model.allowedHostPaths', this.get('model.allowedHostPaths') || []);
    this.set('paths', this.get('model.allowedHostPaths'));
  },

  actions: {
    add: function() {
      this.get('paths').pushObject(
        this.get('globalStore').createRecord({
          type: 'allowedHostPath',
          pathPrefix: '',
        })
      );
    },
    remove: function(obj) {
      this.get('paths').removeObject(obj);
    },
  },

  pathDidChange: function() {
    this.set('model.allowedHostPaths', this.get('paths').filter(p => p.pathPrefix));
  }.observes('paths.@each.pathPrefix'),

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function (item) {
        item.toggleProperty('expanded');
      });
    }
  },

  statusClass: null,
  status: null,
});
