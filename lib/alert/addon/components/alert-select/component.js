import { inject as service } from '@ember/service';
import Select from 'shared/components/searchable-select/component';
import { next } from '@ember/runloop';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import $ from 'jquery';

const MAX_HEIGHT = 285;

export default Select.extend({
  intl:                service(),

  showMessage: false,
  editor:      false,

  actions: {
    show() {
      if (get(this, 'showOptions') === true) {
        return;
      }

      const toBottom = $('body').height() - $(this.element).offset().top - 60; // eslint-disable-line

      set(this, 'maxHeight', toBottom < MAX_HEIGHT ? toBottom : MAX_HEIGHT)

      next(() => {
        const checked = $('.searchable-option .icon-check');
        const options = $('.searchable-options');

        if ( options.length && checked.length ) {
          options.animate({ scrollTop: `${ checked.parent().offset().top - options.offset().top }px` });
        }
      });

      set(this, 'showOptions', true);
    },

    hide() {
      setProperties(this, {
        'value':         get(this, 'filter'),
        'showOptions':   false,
        '$activeTarget': null
      })
    },

  },

  observeContent: observer('content.[]', 'value', 'displayLabel', function(){
    if (!get(this, 'content')) {
      set(this, 'content', []);
    }

    set(this, 'interContent', get(this, 'content').slice(0));

    if (get(this, 'allowCustom')) {
      set(this, 'searchLabel', 'generic.searchOrCustomInput');

      const value = get(this, 'value');

      this.insertCustomValue(value, false);
    }
    if (get(this, 'displayLabel')) {
      set(this, 'filter', get(this, 'displayLabel'));
    }
  }),

  filtered: computed('filter', 'interContent.[]', function() {
    set(this, 'editor', false)
    let filter  = (get(this, 'filter') || '').trim();
    const options = get(this, 'interContent');
    let operator

    if (/\((.*)/ig.test(filter)) {
      operator = (/[^\((?:.*)$\)\)]+/ig.exec(filter) || [])[0]
      filter = filter.replace(operator, '')
      filter = filter.replace('(', '')
      filter = filter.replace(')', '')
      setProperties(this, {
        editor: true,
        operator,
      })
    }
    filter = filter.replace(/[\\\.\*\?\+\[\{\|\(\)\^\$]/g, (match) => {
      return `\\${ match }`
    })

    if (get(this, 'allowCustom')) {
      this.insertCustomValue(filter, true);
    }

    if ( get(this, 'clientSideFiltering') ) {
      const filteredOptionsA = [];
      const filteredOptionsB = [];

      options.forEach((option) => {
        const filterTerms = filter.split(/\s+/);
        const gp          = get(this, 'optionGroupPath');
        const lp          = get(this, 'optionLabelPath');
        const group       = get(option, gp);
        const label       = get(option, lp);

        let startsWithOneOfFilterTerm = false;
        let containsEveryFilterTerm   = true;

        filterTerms.forEach((s) => {
          s = s.toLowerCase();

          const startsWith = label.toLowerCase().startsWith(s) || (group && group.toLowerCase().startsWith(s));

          if (startsWith) {
            startsWithOneOfFilterTerm = true;
          }

          const pattern  = new RegExp(s, 'i');
          const contains = pattern.test(label) || (group && group.test(s));

          if (!contains) {
            containsEveryFilterTerm = false;
          }
        });

        if (startsWithOneOfFilterTerm && containsEveryFilterTerm) {
          filteredOptionsA.push(option);

          return;
        }

        if (containsEveryFilterTerm) {
          filteredOptionsB.push(option);

          return;
        }
      });

      return filteredOptionsA.concat(filteredOptionsB);
    } else {
      return options;
    }
  }),

  optionsClass: computed('unGroupedContent.[]', 'groupedContent.[]', function() {
    const { unGroupedContent = [], groupedContent = [] } = this

    if (unGroupedContent.length === 0 && groupedContent.length === 0 ) {
      return 'no-options'
    }
  }),

  setSelect(item) {
    const gp = get(this, 'optionGroupPath');
    const vp = get(this, 'optionValuePath');

    if (get(this, 'editor')) {
      setProperties(this, {
        value:  `${ get(this, 'operator') }(${ get(item, vp) })`,
        filter: `${ get(this, 'operator') }(${ get(item, vp) })`,
      })
    } else {
      setProperties(this, {
        value:  get(item, vp),
        filter: get(this, 'displayLabel'),
      })
    }

    if (gp && get(item, gp)) {
      set(this, 'group', get(item, gp));
    }

    next(() => {
      const input = $('.input-search');

      if ( input ) {
        input.focus();
        input.blur();
      }
    })

    if (this.change) {
      this.change(item);
    }

    this.send('hide');
  },

  insertCustomValue(value, isFilter) {
    const vp = get(this, 'optionValuePath');
    const lp = get(this, 'optionLabelPath');

    value = value || '';

    if (!isFilter) {
      const custom = { custom: true, };

      custom[lp] = `${ value }`;
      custom[vp] = value;
      set(this, 'filter', value)
    } else {
      const found = get(this, 'interContent').filterBy('custom', true).get('firstObject');

      if (found) {
        setProperties(found, {
          [lp]: `${ value }`,
          [vp]: value,
        })
      }
    }
  },


});
