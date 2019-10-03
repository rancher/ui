import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { singleton } from 'shared/utils/pipelineStep';
import { set, get } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import $ from 'jquery';

export default Component.extend({
  codeMirror: service(),

  hintAry:           null,
  matchedArry:       null,
  positionX:         0,
  positionY:         0,
  activeIndex:       0,
  startStr:          '$',
  triggerInputEle:   null,
  hidden:            true,
  triggerClickHint:  null,
  matchedIndex:      -1,
  cursorPosition:    -1,
  originalScrollTop: null,

  didInsertElement() {
    this._super(...arguments);
    singleton.hintAry = get(this, 'hintAry');
    $(document).on('keyup.hint', 'input:not(.js-disable-hint)', (e) => {
      $.fn.E_INPUT_HINT.startHint(e.target, ( /* hint*/ ) => {});
    });
  },
  didRender() {
    // extend Jquery
    if ( window.jQuery || window.$ ) {
      jQuery.fn.E_INPUT_HINT = this;

      jQuery.fn.getCursorPosition = function() {
        var el = $(this).get(0); // eslint-disable-line
        var pos = 0;

        if ( 'selectionStart' in el ) {
          pos = el.selectionStart;
        } else if ( 'selection' in document ) {
          el.focus();
          var Sel = document.selection.createRange();
          var SelLength = document.selection.createRange().text.length;

          Sel.moveStart('character', -el.value.length);
          pos = Sel.text.length - SelLength;
        }

        return pos;
      }
    }

    var clickHiden = () => {
      set(this, 'hidden', true);
    };

    var scrollPosition = () => {
      var hd = get(this, 'hidden');

      if ( hd ) {
        return;
      }

      var originalCoordinates = get(this, 'originalCoordinates');

      this.showHint(originalCoordinates.top - $(window).scrollTop(), originalCoordinates.left);
    };

    $(document).on('click.hint', clickHiden).on('scroll.hint', scrollPosition);
  },

  willDestroyElement() {
    this._super();
    $(document).off('click.hint');
    $(document).off('scroll.hint');
    $(document).off('keyup.hint');
    $(document).off('keyup.hint-return');
  },

  actions: {
    clickHint(val) {
      var triggerClickHint = get(this, 'triggerClickHint');

      if ( triggerClickHint ) {
        triggerClickHint(val);
      }

      var triggerInputEle = get(this, 'triggerInputEle');

      if ( !triggerInputEle ) {
        return;
      }

      var matchedIndex = get(this, 'matchedIndex');
      var cursorPosition = get(this, 'cursorPosition');
      var value = $(triggerInputEle).val(); // eslint-disable-line

      if ( matchedIndex !== -1 && triggerInputEle ) {
        var newVal = value.slice(0, matchedIndex).concat(val).concat(value.slice(cursorPosition, value.length));
        $(triggerInputEle).val(newVal); // eslint-disable-line
        $(triggerInputEle).trigger('change',newVal); // eslint-disable-line
        $(triggerInputEle).trigger('input',newVal); // eslint-disable-line
      }
    },
  },

  positionStyle: computed('positionX', 'positionY', function() {
    const positionX = get(this, 'positionX'), positionY = get(this, 'positionY');
    const out = [
      'position: fixed',
      `top: ${ positionY }px`,
      `left: ${ positionX }px`,
      `z-index: 9999`
    ].join(';');

    return htmlSafe(out);
  }),

  hiddenClass: computed('hidden', function() {
    const hd = get(this, 'hidden');
    const out = hd ? 'hide' : '';

    return htmlSafe(out);
  }),

  showHint(y, x) {
    set(this, 'positionX', x);
    set(this, 'positionY', y);
    set(this, 'hidden', false);
  },

  setTriggerInputEle(ele) {
    set(this, 'triggerInputEle', ele)
  },

  getCursorCoordinates(value) {
    var lines = value.split(/[\n\r]/g);
    var maxI = lines.length - 1;

    return {
      x: (lines[maxI].length - 1) * 8,
      y: (maxI + 1) * 24 + 8
    };
  },

  startHint(ele, cb) {
    set(this, 'triggerInputEle', ele);
    var el = get(this, 'triggerInputEle');

    if ( !el ) {
      this.setTriggerInputEle(null);
      set(this, 'triggerClickHint', null);
      set(this, 'hidden', true);

      return false;
    }

    var $el = $(el);
    var value = $el.val();
    var cursorPosition = $el.getCursorPosition();

    set(this, 'cursorPosition', cursorPosition);
    var cursorValue = value.slice(0, cursorPosition);
    var matched = false;
    var hintAry = get(this, 'hintAry');
    var _$value = cursorValue.lastIndexOf('$');

    set(this, 'matchedIndex', _$value);
    _$value = cursorValue.slice(_$value, cursorValue.length);
    var matchedArry = [];

    if ( _$value ) {
      for (var i = 0; i < hintAry.length; i++) {
        var item = hintAry[i];

        // if matched on end
        if ( item.indexOf(_$value) === 0 ) {
          matched = true;
          matchedArry.push(item);
        }
      }

      if ( matched ) {
        var offset = $el.offset();

        set(this, 'matchedArry', matchedArry);
        var cursorCoordinates = this.getCursorCoordinates(cursorValue);
        var oT = $(window).scrollTop();
        var originalCoordinates = {
          top:  offset.top + cursorCoordinates.y,
          left: offset.left + cursorCoordinates.x
        };

        set(this, 'originalCoordinates', originalCoordinates);
        this.showHint(originalCoordinates.top - oT, originalCoordinates.left);
        set(this, 'triggerClickHint', cb);

        return true;
      }
    }

    this.setTriggerInputEle(null);
    set(this, 'triggerClickHint', null);
    set(this, 'hidden', true);

    return false;
  },

});