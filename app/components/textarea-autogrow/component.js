import Ember from 'ember';

export default Ember.TextArea.extend({
  tagName: 'textarea',
  text: null,
  classNames: [],
  keyDown: function () {
    this.autoSize();
  },
  autoSize: function() {
    var el = this.element;
    Ember.run(() => {
     el.style.cssText = 'height:auto; padding:0';
     // for box-sizing other than "content-box" use:
     // el.style.cssText = '-moz-box-sizing:content-box';
     el.style.cssText = 'height:' + el.scrollHeight + 'px';

    });
  }
});
