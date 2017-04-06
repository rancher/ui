import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['banner'],
  classNameBindings: ['color'],

  showIcon: function() {
    let title = this.get('title');
    return title === null || title === undefined;
  }.property('title'),

  color: 'bg-default',
  icon: 'icon icon-info',
  title: null,
  titleWidth: null,
  message: '',

  titleStr: function(){
    let title = this.get('title');
    if ( typeof title === 'number' ) {
      title = ""+title;
    }

    return title;
  }.property('title'),

  titleStyle: function() {
    let width = this.get('titleWidth');
    if ( width) {
      return ('width: ' + width + 'px').htmlSafe();
    }
  }.property('width'),
});
