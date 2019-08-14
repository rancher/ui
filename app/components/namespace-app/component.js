import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import LazyIcon from 'shared/mixins/lazy-icon';

export default Component.extend(LazyIcon, {
  scope:         service(),
  layout,
  classNames:    ['namespace-app'],
  latestVersion: null,

  didRender() {
    this.initAppIcon();
  },
});
