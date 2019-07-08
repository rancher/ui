import LinkComponent from '@ember/routing/link-component';
import layout from './template';
import { set } from '@ember/object';

export default LinkComponent.extend({
  layout,

  classNames:        ['link-to-cluster', 'mb-20', 'mt-10', 'col', 'span-3', 'col-inline', 'nav-box-item', 'driver'],
  classNameBindings: ['clusterName'],
  clusterName:       '',
  genericIcon:       false,
  linkHovered:       false,

  actions: {
    removeRecent(e) {
      e.stopPropagation();
      e.preventDefault();
      this.removeRecent(this.clusterName);
    },
  },

  mouseEnter() {
    if (!this.element.classList.contains('active')){
      set(this, 'linkHovered', true);
    }
  },

  mouseLeave() {
    set(this, 'linkHovered', false);
  },

  removeRecent() {
    throw new Error('removeRecent action is required!');
  }
});
