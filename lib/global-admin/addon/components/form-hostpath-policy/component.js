import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';
import { observer } from '@ember/object'


export default Component.extend({
  globalStore: service(),
  layout,

  classNames: ['accordion-wrapper'],


  model:    null,
  paths:    null,
  readOnly: false,

  statusClass:   null,
  status:        null,
  init() {
    this._super(...arguments);
    this.set('model.allowedHostPaths', this.get('model.allowedHostPaths') || []);
    this.set('paths', this.get('model.allowedHostPaths'));
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }
  },

  actions: {
    add() {
      this.get('paths').pushObject(
        this.get('globalStore').createRecord({
          type:       'allowedHostPath',
          pathPrefix: '',
        })
      );
    },
    remove(obj) {
      this.get('paths').removeObject(obj);
    },
  },

  pathDidChange: observer('paths.@each.pathPrefix', function() {
    this.set('model.allowedHostPaths', this.get('paths').filter((p) => p.pathPrefix));
  }),

});
