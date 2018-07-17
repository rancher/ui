import { throttle } from '@ember/runloop';
import $ from 'jquery';
import Mixin from '@ember/object/mixin';
import ThrottledResize from 'shared/mixins/throttled-resize';

const tableProps = {
  actionsHeight:     60,
  fixedHeaderHeight: 40,
};

export default Mixin.create(ThrottledResize, {
  stickyHeader: true,
  subRow:       false,

  init() {
    this._super(...arguments);
  },

  didInsertElement() {
    this._super(...arguments);

    this.buildTableWidths();

    if (this.get('showHeader')) {
      $(this.element).find('> table > thead > .fixed-header-actions, > table > thead > .fixed-header').css('width', $(this.element).find('> table').outerWidth());
    }

    if ( !this.get('stickyHeader') ) {
      return;
    }

    this.set('_boundScroll', this._scroll.bind(this));
    $(window).on('scroll', this.get('_boundScroll'));
  },

  _boundScroll: null,
  _scroll() {
    throttle(() => {
      this.updateHeaders();
    }, 30);
  },


  willDestroyElement() {
    this._super(...arguments);

    if ( !this.get('stickyHeader') ) {
      return;
    }

    $(window).off('scroll', this.get('_boundScroll'));
  },

  onResize() {
    this._super(...arguments);
    this.buildTableWidths();
  },

  buildTableWidths() {
    if ($(this.element).is(':visible')) {
      let ths = $(this.element).find('> table > thead > tr.fixed-header > th');
      let $fixHdr = $(this.element).find('> table > thead > .fixed-header-actions, > table > thead > .fixed-header');

      $(this.element).find('> table > thead > tr.fixed-header-placeholder > th').each((idx, th) => {
        $(ths[idx]).attr('width', $(th).outerWidth());
      });

      if (this.get('showHeader')) {
        $fixHdr.css({ 'width': $(this.element).find('> table').width(), });
        if ($fixHdr.is(':visible')) {
          $(this.element).find('.search-group').show(1, 'linear');
        }
      }
    }
  },

  tearDownTableWidths() {
    if ( !this.get('stickyHeader') ) {
      return;
    }

    $(this.element).find('> table > thead > tr.fixed-header > th').each((idx, td) => {
      $(td).removeAttr('width');
    });
  },

  positionHeaders() {
    if ( !this.get('stickyHeader') ) {
      return;
    }

    let elem         = $(this.element);
    let $table       = elem.find('> table');
    let $actionRow   = $table.find('> thead > .fixed-header-actions');
    let $fixedHeader = $table.find('> thead > tr.fixed-header');
    let showHeader  = this.get('showHeader');

    let fudge = (this.get('subRow') ? 100 : 0);

    if (showHeader) {
      $actionRow.css({
        'position': 'fixed',
        'top':      fudge,
        'height':   `${ tableProps.actionsHeight  }px`,
      });
    }
    $fixedHeader.css({
      'position': 'fixed',
      'top':      `${ showHeader && this.get('bulkActions') ? fudge + tableProps.actionsHeight : 0  }px`,
      'height':   `${ tableProps.fixedHeaderHeight  }px`,
    });

    elem.css({ 'padding-top': `${ tableProps.actionsHeight + tableProps.fixedHeaderHeight  }px` });
  },

  removePositions() {
    if ( !this.get('stickyHeader') ) {
      return;
    }

    let elem         = $(this.element);
    let $table       = elem.find('> table');
    let $actionRow   = $table.find('> thead > .fixed-header-actions');
    let $fixedHeader = $table.find('> thead > tr.fixed-header');

    if (this.get('showHeader')) {
      $actionRow.css({
        'position': 'relative',
        'top':      '',
      });
    }

    $fixedHeader.css({
      'position': '',
      'top':      '',
    });

    elem.css({ 'padding-top': '' });
    this.buildTableWidths();
  },

  updateHeaders() {
    if ( !this.get('stickyHeader') ) {
      return;
    }

    let elem            = $(this.element);
    let $table          = elem.find('> table');
    let $floatingHeader = $table.find('> thead > tr.fixed-header');
    let $scrollTop      = $(window).scrollTop();
    let containerBottom = $table.height() + $table.offset().top;
    let offset = elem.find('> table > thead > tr').offset().top - parseInt(elem.css('padding-top'), 10);

    if ($scrollTop < containerBottom && $scrollTop > offset) {
      if ($floatingHeader.css('position') !== 'fixed') {
        this.buildTableWidths();
        this.positionHeaders();
      }
    } else {
      if ($floatingHeader.css('position') === 'fixed') {
        this.tearDownTableWidths();
        this.removePositions();
      }
    }
  }
});
