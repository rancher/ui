import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  resourceActions: service('resource-actions'),

  node: null,


  tagName: 'g',
  attributeBindings: ['transform'],

  width: 235,
  height: 80,

  actions: {
    showDropDown: function() {
      this.get('resourceActions').show(this.get('node.service'), $('#dropdown-toggler'), this.$());
    },
  },


  click: function(e) {
    var target = e.target;
    if ( $(target).closest('action-menu').length === 0 )
    {
      this.sendAction('action', this.get('node.service'));
    }

    e.preventDefault();
    e.stopPropagation();
  },

  transform: computed('node.{x,y}', function() {
    return `translate(${this.get('node.x')},${this.get('node.y')})`;
  }),

  containerCount: computed('node.service.instances', function() {
    if (this.get('node.service.instances')) {
      return this.get('node.service.instances').length;
    } else {
      return this.get('node.service.scale') ? this.get('node.service.scale') : 0;
    }
  }),

  stateBackground: function() {
    return this.get('node.service.stateColor').replace("text-", "bg-");
  }.property('node.service.stateColor'),

});
