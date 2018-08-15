import CodeMirror from 'codemirror';
import { singleton } from 'shared/utils/pipelineStep';
import Service from '@ember/service';

export default Service.extend({
  init() {
    this._super(...arguments);
    this._instances = Object.create(null);
  },

  fromTextArea(id, textarea) {
    return this.registerInstance(id, CodeMirror.fromTextArea(textarea));
  },

  instanceFor(id) {
    return this._instances[id];
  },

  registerInstance(id, instance) {
    this._instances[id] = instance;

    return instance;
  },

  signal(emitter, type, ...values) {
    CodeMirror.signal(emitter, type, ...values);
  },

  unregisterInstance(id) {
    delete this._instances[id];
  },

  getMatchedHint(value, editor) {
    var hintAry = singleton.hintAry;
    var cur = editor.getCursor();
    var cursorPosition = cur.ch;
    var cursorValue = editor.getLine(cur.line).slice(0, cursorPosition);

    var matched = false;
    var _$valueIndex = cursorValue.lastIndexOf('$');

    var _$value = cursorValue.slice(_$valueIndex, cursorValue.length);
    var matchedArry = [];

    if (_$value) {
      for (var i = 0; i < hintAry.length; i++) {
        var item = hintAry[i];

        // if matched on end
        if ((item.indexOf(_$value) === 0)) {
          matched = true;
          matchedArry.push(item);
        }
      }
      if (matched) {
        return {
          matchedArry,
          index: cursorPosition - _$valueIndex
        };
      }
    }

    return {
      matchedArry: [],
      index:       -1
    };
  }
});
