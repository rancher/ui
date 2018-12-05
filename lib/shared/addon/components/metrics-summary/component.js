import Component from '@ember/component';
import layout from './template'
import { get, observer } from '@ember/object';
import $ from 'jquery';

export default Component.extend({
  layout,

  title: null,

  expandedDidChange: observer('expanded', function() {
    if ( get(this, 'expanded') ) {
      $(window).trigger('resize');
    }
  }),
});
