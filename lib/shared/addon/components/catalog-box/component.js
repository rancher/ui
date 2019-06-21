import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import LazyIcon from 'shared/mixins/lazy-icon';

export default Component.extend(LazyIcon, {
  settings:          service(),
  router:            service(),
  layout,
  tagName:           'div',

  classNames:        ['catalog-box', 'p-0'],
  classNameBindings: ['active::inactive', 'model.certifiedClass'],

  model:             null,
  showIcon:          true,
  showSource:        false,
  showDescription:   true,
  active:            true,

  didRender() {
    this.initAppIcon();
  },
});
