import Ember from 'ember';
import sanitize from 'json-sanitizer';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  json: {},
  isInvalid: false,

  tagName: 'div',
  classNames: ['jsoneditor-component'],

  jsonString: function () {
    return JSON.stringify(this.get('json'), undefined, 4);
  }.property('json'),

  onChange: function () {
    try {
      const json = this.parseJSON(this.jsonString)
      this.set('json', json);
      this.set('isInvalid', false)
    } catch (err) {
      this.set('isInvalid', true)
    }
  }.observes('jsonString'),

  parseJSON: function (jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      return JSON.parse(sanitize(jsonString));
    }
  },

  focusOut() {
    if (!this.get('isInvalid')) {
      this.set('jsonString', JSON.stringify(this.get('json'), undefined, 4));
    }
  },

  keyDown: function (event) {
    const keyCode = event.which;
    if (keyCode === C.KEY.TAB) {
      event.preventDefault();
      const el = $(this).get(0).childViews.get(0).element;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      $(el).val($(el).val().substring(0, start) + "    " + $(el).val().substring(end));
      el.selectionStart = start + 4;
      el.selectionEnd = start + 4;
    }
  },
});
