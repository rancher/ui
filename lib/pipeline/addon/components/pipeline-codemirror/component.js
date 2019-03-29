import CodeMirror from 'codemirror';
import layout from './template'
import { get } from '@ember/object';
import { observer } from '@ember/object';
import Component from '@ember/component';
import { bind, once, scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';

export default Component.extend({
  codeMirror: service(),

  layout,
  tagName: 'textarea',

  didInsertElement() {
    this._super(...arguments);
    CodeMirror.registerHelper('hint', 'anyword', (editor /* ,options*/) => {
      var cur = editor.getCursor();
      var end = cur.ch, start = end;
      var matched = get(this, 'codeMirror').getMatchedHint(editor.getValue(), editor);

      return {
        list: matched.matchedArry,
        from: CodeMirror.Pos(cur.line, start - matched.index),
        to:   CodeMirror.Pos(cur.line, end)
      };
    });
    this._codeMirror = get(this, 'codeMirror').fromTextArea(get(this, 'elementId'), get(this, 'element'));
    var arrows = [37, 38, 39, 40, 13]

    this._codeMirror.on('keyup', (cm, e) => {
      if (arrows.indexOf(e.keyCode) < 0) {
        this._codeMirror.showHint({ completeSingle: false })
      }
    })
    // Send a "valueUpdated" action when CodeMirror triggers a "change" event.
    this.setupCodeMirrorEventHandler('change', this, this.scheduleValueUpdatedAction);
  },

  didRender() {
    this._super(...arguments);

    this.updateCodeMirrorOptions();
    this.updateCodeMirrorValue();
  },

  willDestroyElement() {
    this._super(...arguments);

    // Remove the editor and restore the original textarea.
    this._codeMirror.toTextArea();

    get(this, 'codeMirror').unregisterInstance(get(this, 'elementId'));

    delete this._codeMirror;
  },
  isVisibleDidChange: observer('isVisible', function() {
    if (this._wasVisible === get(this, 'isVisible')) {
      return;
    }

    scheduleOnce('render', this, this.toggleVisibility);
  }),

  scheduleValueUpdatedAction(codeMirror, changeObj) {
    once(this, this.sendValueUpdatedAction, codeMirror.getValue(), codeMirror, changeObj);
  },

  setupCodeMirrorEventHandler(event, target, method) {
    const callback = bind(target, method);

    this._codeMirror.on(event, callback);

    this.one('willDestroyElement', this, function() {
      this._codeMirror.off(event, callback);
    });
  },

  sendValueUpdatedAction(...args) {
    if (this.valueUpdated) {
      this.valueUpdated(...args);
    }
  },

  toggleVisibility() {
    const isVisible = get(this, 'isVisible');

    if (this._wasVisible === isVisible) {
      return;
    }

    this._wasVisible = isVisible;

    if (isVisible) {
      // Force a refresh when becoming visible, since CodeMirror won't render
      // itself onto a hidden element.
      this._codeMirror.refresh();
    }
  },

  updateCodeMirrorOption(option, value) {
    if (this._codeMirror.getOption(option) !== value) {
      this._codeMirror.setOption(option, value);
    }
  },

  updateCodeMirrorOptions() {
    const options = get(this, 'options');

    if (options) {
      Object.keys(options).forEach(function(option) {
        this.updateCodeMirrorOption(option, options[option]);
      }, this);
    }
  },

  updateCodeMirrorValue() {
    const value = get(this, 'value');

    if (value !== this._codeMirror.getValue()) {
      this._codeMirror.setValue(value || '');
    }
  },

});
