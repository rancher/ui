import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  layout,
  classNames:        ['banner'],
  classNameBindings: ['color'],
  color:             'bg-default',
  icon:              'icon-info',
  title:             null,
  titleWidth:        null,
  message:           '',
  showClose:         false,

  actions: {
    close() {
      if (this.close) {
        this.close();
      }
    },
  },

  showIcon: computed('title', function() {
    let title = this.get('title');

    return title === null || title === undefined;
  }),


  titleStr: computed('title', function(){
    let title = this.get('title');

    if ( typeof title === 'number' ) {
      title = `${ title }`;
    }

    return title;
  }),

  titleStyle: computed('width', function() {
    let width = this.get('titleWidth');

    if ( width) {
      return htmlSafe(`width: ${  width  }px`);
    }
  }),
});
