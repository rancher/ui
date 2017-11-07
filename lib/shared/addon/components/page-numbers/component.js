// import Component from '@ember/component';
import PageNumbers from 'ember-cli-pagination/components/page-numbers';
import layout from './template';

export default PageNumbers.extend({
  layout,
  init() {
    this._super(...arguments);
  }
});
