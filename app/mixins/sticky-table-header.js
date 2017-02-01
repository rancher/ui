import Ember from 'ember';
import ThrottledResize from './throttled-resize';

const tableProps = {
  actionsHeight: '60px',
  fixedHeaderHeight: '40px',
};

export default Ember.Mixin.create(ThrottledResize, {
  didInsertElement() {
    let $offset = Ember.$(this.element).find('thead tr').offset().top;
    this.buildTableWidths();

    if (this.get('showHeader')) {
      Ember.$(this.element).find('thead .fixed-header-actions, thead .fixed-header').css('width', Ember.$(this.element).find('table').outerWidth());
    }
    Ember.$(window).scroll(() => {
      this.updateHeaders($offset);
    });

  },
  willDestroyElement() {
    this._super(...arguments);
    Ember.$(window).unbind('scroll');
  },

  onResize() {
    this.buildTableWidths();
  },


  buildTableWidths() {
    let ths = Ember.$(this.element).find('thead tr.fixed-header th');

    Ember.$(this.element).find('thead tr.fixed-header-placeholder th').each((idx, th) => {
      Ember.$(ths[idx]).attr('width', Ember.$(th).outerWidth());
    });

    if (this.get('showHeader')) {
      Ember.$(this.element).find('thead .fixed-header-actions, thead .fixed-header').css({
        'width': Ember.$(this.element).find('table').width(),
      });
    }
  },

  tearDownTableWidths() {
    Ember.$(this.element).find('thead tr.fixed-header th').each((idx, td) => {
      Ember.$(td).removeAttr('width');
    });
  },

  positionHeaders() {
    let $table       = Ember.$(this.element).find('table');
    let $actionRow   = $table.find('thead .fixed-header-actions');
    let $fixedHeader = $table.find('thead tr.fixed-header');
    let showHeader  = this.get('showHeader');

    if (showHeader) {
      $actionRow.css({
        'position': 'fixed',
        'top': 0,
        'height': tableProps.actionsHeight,
      });
    }
    $fixedHeader.css({
      'position': 'fixed',
      'top': showHeader ? tableProps.actionsHeight : 0,
      'height': tableProps.fixedHeaderHeight,
    });

    $table.css({
      'margin-top': (parseInt(tableProps.actionsHeight,10) + parseInt(tableProps.fixedHeaderHeight,10)) + 'px'
    });
  },

  removePositions() {
    let $table       = Ember.$(this.element).find('table');
    let $actionRow   = $table.find('thead .fixed-header-actions');
    let $fixedHeader = $table.find('thead tr.fixed-header');

    if (this.get('showHeader')) {
      $actionRow.css({
        'position': 'relative',
        'top': '',
      });
    }

    $fixedHeader.css({
      'position': '',
      'top': '',
    });
    $table.css({
      'margin-top': ''
    });
    this.buildTableWidths();
  },

  updateHeaders(offset) {
    let $windowScroll   = Ember.$(window).scrollTop();
    let $table          = Ember.$(this.element).find('table');
    let $floatingHeader = $table.find('thead tr.fixed-header');
    let $scrollTop      = Ember.$(window).scrollTop();
    let containerBottom = $table.height() + $table.offset().top;

    if ($windowScroll < containerBottom ) {
      if ($scrollTop > offset) {
        this.buildTableWidths();
        this.positionHeaders();
      } else if ($scrollTop <= offset) {
        this.tearDownTableWidths();
        this.removePositions();
      }
    } else {
      if ($floatingHeader.css('position') === 'fixed') {
        this.tearDownTableWidths();
        this.removePositions();
      }
    }
  }
});
