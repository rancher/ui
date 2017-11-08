import Component from '@ember/component';
import sanitize from 'json-sanitizer';
import C from 'ui/utils/constants';
import layout from './template';

const TAB_SIZE = 2;
const TAB_STR = (new Array(TAB_SIZE+1)).join(' ');

export default Component.extend({
  layout,
  jsonString: null,

  tagName: 'div',
  classNames: ['jsoneditor-component'],

  json: {},
  isValid: true,

  init() {
    this._super();
    this.focusOut();
  },

  focusOut() {
    if ( this.get('isValid') ) {
      this.set('jsonString', JSON.stringify(this.get('json'), undefined, TAB_SIZE));
    }
  },

  keyDown(event) {
    const keyCode = event.which;
    if (keyCode === C.KEY.TAB) {
      event.preventDefault();
      const el = $(this).get(0).childViews.get(0).element;
      const val = $(el).val();

      let start = el.selectionStart;
      let end = el.selectionEnd;
      const origStart = start;
      const origEnd = end;

      // Move start to the beginning of the line
      while ( start > 0 && val.charAt(start-1) !== '\n' ) {
        start--;
      }

      // And end to the end of the line
      while ( end < val.length && val.charAt(end) !== '\n') {
        end++;
      }

      let lines = val.substring(start,end).split(/\n/);

      let sub;
      let direction;
      if ( event.shiftKey ) {
        const re = new RegExp("^(\\s{"+ TAB_SIZE + "}|\\t)");
        let found = false;
        sub = lines.map((x) => {
          let out = x.replace(re,'');
          if ( out !== x ) {
            found = true;
          }
          return out;
        });

        if ( found ) {
          direction = -1;
        } else {
          // If no lines moved, this will prevent the cursor from moving back
          direction = 0;
        }
      } else {
        sub = lines.map(x => TAB_STR+x);
        direction = 1;
      }

      let replaceStr = sub.join("\n");
      $(el).val(val.substring(0, start) + replaceStr + val.substring(end));

      if ( origStart === origEnd ) {
        el.selectionStart = el.selectionEnd = origStart + direction*TAB_SIZE*sub.length;
      } else {
        el.selectionStart = start;
        el.selectionEnd = start + replaceStr.length;
      }
    }
  },

  onChange: function() {
    const [json, isValid] = this.parse(this.get('jsonString'));
    this.setProperties({
      json,
      isValid,
    });
  }.observes('jsonString'),

  parse(jsonString) {
    try {
      const json = JSON.parse(jsonString);
      return [json,true];
    } catch (err) {
      try {
        const json = JSON.parse(sanitize(jsonString));
        return [json,true];
      } catch (err) {
        return [null,false];
      }
    }
  },
});
