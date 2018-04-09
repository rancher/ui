import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { singleton } from 'pipeline/utils/pipelineStep';

export default Component.extend({
  hintAry: null,
  matchedArry: null,
  positionX: 0,
  positionY: 0,
  activeIndex: 0,
  codeMirror: service(),
  positionStyle: function(){
    var positionX = this.get('positionX'), positionY=this.get('positionY');
    return [
      'position: fixed',
      `top: ${positionY}px`, 
      `left: ${positionX}px`,
      `z-index: 9999`
    ].join(';')
  }.property('positionX','positionY'),
  startStr: '$',
  triggerInputEle: null,
  hidden: true,
  triggerClickHint: null,
  matchedIndex: -1,
  cursorPosition: -1,
  originalScrollTop : null,
  hiddenClass:function(){
    var hd = this.get('hidden');
    return hd?'hide':'';
  }.property('hidden'),
  hiddenObserve: function () {
    var hd = this.get('hidden');
    let triggerInputEle = this.get('triggerInputEle');
    hd&&this.$(triggerInputEle).focus()||this.$(triggerInputEle).blur();
  }.observes('hidden'),
  showHint(y,x){
    this.set('positionX',x);
    this.set('positionY',y);
    this.set('hidden',false);
  },
  setTriggerInputEle(ele){
    this.set('triggerInputEle',ele)
  },
  getCursorCoordinates(value){
    var lines = value.split(/[\n\r]/g);
    var maxI = lines.length - 1;
    return {
      x: (lines[maxI].length-1)*8,
      y: (maxI+1)*24+8
    }
  },
  startHint(ele,cb){
    this.set('triggerInputEle',ele)
    var el = this.get('triggerInputEle');
    if(!el){
      this.setTriggerInputEle(null)
      this.set('triggerClickHint',null);
      this.set('hidden',true);
      return false;
    }
    var $el = this.$(el);
    var value = $el.val();
    var cursorPosition = $el.getCursorPosition();
    this.set('cursorPosition',cursorPosition);
    var cursorValue = value.slice(0, cursorPosition);
    
    var matched = false;
    var hintAry = this.get('hintAry');
    var _$value = cursorValue.lastIndexOf('$');
    this.set('matchedIndex', _$value);
    _$value = cursorValue.slice(_$value,cursorValue.length);
    var matchedArry = [];
    if(_$value){
      for (var i = 0; i < hintAry.length; i++) {
        var item = hintAry[i];
        //if matched on end
        if((item.indexOf(_$value) === 0)){
          matched = true;
          matchedArry.push(item);
        }
      }
      if (matched) {
        var offset = $el.offset();
        this.set('matchedArry',matchedArry);
        var cursorCoordinates = this.getCursorCoordinates(cursorValue);
        var oT = this.$(window).scrollTop();
        var originalCoordinates = {
          top: offset.top+cursorCoordinates.y,
          left: offset.left+cursorCoordinates.x
        };
        this.set('originalCoordinates',originalCoordinates);
        this.showHint(originalCoordinates.top-oT,originalCoordinates.left);
        this.set('triggerClickHint',cb);
        return true;
      }
    }
    this.setTriggerInputEle(null)
    this.set('triggerClickHint',null);
    this.set('hidden',true);
    return false;
    
  },
  setHint(val){
    var triggerClickHint = this.get('triggerClickHint');
      triggerClickHint&&triggerClickHint(val)
      var triggerInputEle = this.get('triggerInputEle');
      if(!triggerInputEle){
        return
      }
      var matchedIndex = this.get('matchedIndex');
      var cursorPosition = this.get('cursorPosition');
      var value = $(triggerInputEle).val();
      if(matchedIndex !==-1 && triggerInputEle){
        var newVal = value.slice(0,matchedIndex).concat(val).concat(value.slice(cursorPosition,value.length));
        $(triggerInputEle).val(newVal);
        $(triggerInputEle).trigger('change',newVal);
        $(triggerInputEle).trigger('input',newVal);
      }
      this.set('hidden',true);
  },
  actions: {
    clickHint(val){
      this.setHint(val);
    }
  },
  didRender(){
    // extend Jquery
    if(window.jQuery||window.$){
      jQuery.fn.E_INPUT_HINT = this;

      jQuery.fn.getCursorPosition = function() {
        var el = $(this).get(0);
        var pos = 0;
        if('selectionStart' in el) {
            pos = el.selectionStart;
        } else if('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
      }
    }

    var scrollPosition = ()=>{
      var hd = this.get('hidden');
      if(hd){
        return
      }
      var originalCoordinates = this.get('originalCoordinates');
      this.showHint(originalCoordinates.top-this.$(window).scrollTop(),originalCoordinates.left);
    };
    this.$(document).on('scroll.hint', scrollPosition);
  },
  willDestroyElement(){
    this._super();
    this.$(document).off('click.hint');
    this.$(document).off('scroll.hint');
    this.$(document).off('keyup.hint');
    this.$(document).off('keyup.hint-return');
  },
  didInsertElement() {
    this._super(...arguments);
    singleton.hintAry = this.get('hintAry');
    this.$(document).on('keyup.hint', 'input:not(.js-disable-hint)', (e) => {
      $.fn.E_INPUT_HINT.startHint(e.target, ( /*hint*/ ) => {});
    })
    let $dropdownEle = this.$('.js-hint-dropdown');
    let $activeLi ;
    this.$(document).on('keyup.hint-return', (e) => {
      let hiddenClass = this.get('hidden');
      let activeIndex = this.get('activeIndex');
      let matchedArry = this.get('matchedArry');
      if(!hiddenClass){
        switch(e.which){
          //down
          case 40:
            activeIndex +=1;
            if(activeIndex >= matchedArry.length){
              activeIndex = matchedArry.length - 1;
            }
            this.set('activeIndex', activeIndex);
            $activeLi = this.$('.js-hint-dropdown>li.active')[0];
            $dropdownEle.scrollTop($activeLi.offsetTop - $dropdownEle.height() + 2*$activeLi.offsetHeight);
            break;
          // up
          case 38:
            activeIndex -=1;
            if(activeIndex < 0 ){
              activeIndex = 0;
            }
            this.set('activeIndex', activeIndex);
            $activeLi = this.$('.js-hint-dropdown>li.active')[0];
            $dropdownEle.scrollTop($activeLi.offsetTop - $dropdownEle.height());
            break;
          // enter
          case 13:
            this.setHint(matchedArry[activeIndex]);
            break;
          default: break;
        }
      }
    });
  }
});
