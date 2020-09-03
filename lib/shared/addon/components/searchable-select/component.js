/**
 * @fileOverview
 * @name component<searchable-select>
 *
 * Fetures:
 * 1. options search/filter
 * 2. grouping
 * 3. show icons for unGroupedContent options
 * 4. `arrow-up` & `arrow-down` keys to navigate through options
 * 5. `return` key to select the current active option
 * 6. esc to cancel
 *
 * Option data structure:
 * {
 *  label: string,
 *  value: string,
 *  group: string,   // Optional, which group/category this option belong to.
 *  imgUrl: string,  // Optional, whether to display a image for this option, unGrouped options only.
 * }
 *
**/
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import { get, set, computed, observer } from '@ember/object';
import C from 'ui/utils/constants';
import layout from './template';
import { htmlSafe } from '@ember/string';
import { on } from '@ember/object/evented';
import { escapeRegex } from 'ui/utils/util';
import $ from 'jquery';
import StatefulPromise from 'shared/utils/stateful-promise';


const MAX_HEIGHT = 285;

export default Component.extend({
  intl:                service(),

  layout,
  classNames:          ['searchable-select'],
  classNameBindings: [
    'class',
    'showDropdownArrow',
    'asyncContent.loading:loading',
    'asyncContent.loaded:loaded',
    'asyncContent.error:error',
  ],

  // input
  class:               null,
  value:               null,
  prefix:              null,
  suffix:              null,
  prompt:              null,
  placeholder:         null,
  // If need to catch the group changes, you can pass a group prop in.
  group:               null,
  content:             null,
  interContent:        null,
  optionLabelPath:     'label',
  optionValuePath:     'value',
  optionGroupPath:     'group',
  localizedPrompt:     false,
  localizedLabel:      false,
  localizedHtmlLabel:  false,
  customLabel:         false,
  readOnly:            null,

  showOptions:         false,
  allowCustom:         false,
  filter:              null,
  clientSideFiltering: true,
  // the current highlighted option.
  $activeTarget:       null,
  maxHeight:           MAX_HEIGHT,
  showDropdownArrow:   true,

  init() {
    this._super(...arguments);
    this.observeContent();
  },

  didInsertElement() {
    const search = $(this.element).find('.input-search');

    search.attr('autocomplete', 'off');

    search.on('click', () => {
      this.send('show');
    });
  },

  willDestroyElement() {
    this.off();
  },

  actions: {

    search(/* term*/) {
      // placeholder is over written by extenders if you want
    },

    selectUnGroupedItem(idx) {
      const found = get(this, 'unGroupedContent').objectAt(idx);

      this.setSelect(found);
    },

    selectGroupedItem(items, idx) {
      const found = items.objectAt(idx);

      this.setSelect(found);
    },

    selectPrompt() {
      set(this, 'value', null);

      this.send('hide');
    },

    mouseEnter(event) {
      $(this.element).find('.searchable-option').removeClass('searchable-option-active');

      const $target = $(event.target);

      $target.addClass('searchable-option-active');

      set(this, '$activeTarget', $target);
    },

    mouseLeave(event) {
      $(event.target).removeClass('searchable-option-active');

      set(this, '$activeTarget', null);
    },

    show() {
      if (get(this, 'showOptions') === true) {
        return;
      }

      const toBottom = $('body').height() - $(this.element).offset().top - 60;  // eslint-disable-line

      set(this, 'maxHeight', toBottom < MAX_HEIGHT ? toBottom : MAX_HEIGHT)
      set(this, 'filter', null);

      next(() => {
        const checked = $(this.element).find('.searchable-option .icon-check');
        const options = $(this.element).find('.searchable-options');

        if ( options.length && checked.length ) {
          options.animate({ scrollTop: `${ checked.parent().offset().top - options.offset().top }px` });
        }
      });

      set(this, 'showOptions', true);
    },

    hide() {
      set(this, 'filter', get(this, 'displayLabel'));
      set(this, 'showOptions', false);
      set(this, '$activeTarget', null);
    },

  },

  observeContent: observer('asyncContent.value.[]', 'value', 'displayLabel', function(){
    let asyncContentValue = get(this, 'asyncContent.value');

    if (asyncContentValue) {
      set(this, 'interContent', asyncContentValue.slice(0));
    }

    if (get(this, 'allowCustom')) {
      set(this, 'searchLabel', 'generic.searchOrCustomInput');

      const value = get(this, 'value');

      this.insertCustomValue(value, false);
    }

    set(this, 'filter', get(this, 'displayLabel'));
  }),

  asyncContent: computed('content', function() {
    return StatefulPromise.wrap(get(this, 'content'), []);
  }),

  optionsMaxHeightCss: computed('maxHeight', function() {
    return htmlSafe(`max-height: ${  get(this, 'maxHeight')  }px`);
  }),

  // Show option image --> unGroupedContent only
  showOptionIcon: computed('unGroupedContent.@each.imgUrl', function() {
    return get(this, 'unGroupedContent').some((item) => !!item.imgUrl);
  }),

  displayLabel: computed('value', 'prompt', 'interContent.[]', 'intl.locale.[]', function() {
    const value = get(this, 'value');
    const vp = get(this, 'optionValuePath');
    const lp = get(this, 'optionLabelPath');
    const selectedItem = get(this, 'interContent').filterBy(vp, value).get('firstObject');

    if (selectedItem) {
      let label = get(selectedItem, lp);

      if (get(this, 'localizedLabel')) {
        label = get(this, 'intl').t(label);
      } else if ( get(this, 'localizedHtmlLabel') ) {
        label = value;
      }

      return label;
    }

    return null;
  }),

  filtered: computed('filter', 'interContent.[]', function() {
    const filter  = (get(this, 'filter') || '').trim();
    const options = get(this, 'interContent');

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

          const exp = escapeRegex(s);

          const pattern  = new RegExp(exp, 'i');
          const contains = pattern.test(label) || (group && pattern.test(group));

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

  unGroupedContent: computed('filtered.[]', function() {
    const groupPath = get(this, 'optionGroupPath');
    const out       = [];

    get(this, 'filtered').forEach((opt) => {
      const key = get(opt, groupPath);

      if (!key) {
        out.push(opt);
      }
    });

    return out;
  }),

  groupedContent: computed('filtered.[]', function() {
    const groupPath = get(this, 'optionGroupPath');
    const out       = [];

    get(this, 'filtered').forEach((opt) => {
      const key = get(opt, groupPath);

      if (key) {
        let group = out.filterBy('group', key)[0];
        let groupLabel = this.intl.exists(key) ? this.intl.t(key) : key;

        if (!group) {
          group = {
            group:   groupLabel,
            options: []
          };
          out.push(group);
        }

        group.options.push(opt);
      }
    });

    return out.sortBy(groupPath);
  }),

  showMessage: computed('filtered.[]', function() {
    return get(this, 'filtered.length') === 0;
  }),

  missingMessage: computed('asyncContent.value.[]', function() {
    let len = get(this, 'asyncContent.value.length')
    let out = 'searchableSelect.noOptions';

    if (len) {
      out = 'searchableSelect.noMatch';
    }

    return out;
  }),

  showOptionsChanged: on('init', observer('showOptions', function() {
    const show = get(this, 'showOptions');

    if (show) {
      this.on();
    } else {
      this.off();
    }
  })),

  allContent() {
    const out       = [];
    const grouped   = get(this, 'groupedContent');
    const unGrouped = get(this, 'unGroupedContent');

    out.pushObjects(unGrouped);

    grouped.forEach((g) => out.pushObjects(g.options));

    return out;
  },

  on() {
    $(this.element).on('keydown.searchable-option', (event) => {
      const kc = event.keyCode;

      // Note: keyup event can't be prevented.
      if (!get(this, 'showOptions')) {
        return;
      }

      if (kc === C.KEY.UP) {
        this.stepThroughOptions(-1);
      }

      if (kc === C.KEY.DOWN) {
        this.stepThroughOptions(1);
      }

      // support using return key to select the current active option
      if (kc === C.KEY.CR || kc === C.KEY.LF) {
        event.preventDefault();

        let $activeTarget = get(this, '$activeTarget');

        if (!$activeTarget) {
          $activeTarget = this.$(this.element).find('.searchable-options > .searchable-option:first-child')
        }

        if ($activeTarget) {
          // activeTarget is prompt
          if ($activeTarget.hasClass('searchable-prompt')) {
            this.send('selectPrompt');
          } else {
            let idx = $(this.element).find('.searchable-option').index($activeTarget);

            idx = !!get(this, 'prompt') ? idx - 1 : idx;

            // set value
            const activeOption = this.allContent().objectAt(idx);

            this.setSelect(activeOption);
          }

          // hide options after value has been set
          this.send('hide');
        }
      }

      // esc to hide
      if (kc === C.KEY.ESCAPE) {
        this.send('hide');
      }
    });
  },

  off() {
    if ($(this.element)) {
      $(this.element).off('keydown.searchable-option');
    }
  },

  setSelect(item) {
    const gp = get(this, 'optionGroupPath');
    const vp = get(this, 'optionValuePath');

    set(this, 'value', get(item, vp));

    if (gp && get(item, gp)) {
      set(this, 'group', get(item, gp));
    }

    set(this, 'filter', get(this, 'displayLabel'));

    // https://stackoverflow.com/questions/39624902/new-input-placeholder-behavior-in-safari-10-no-longer-hides-on-change-via-java
    next(() => {
      const input = $(this.element).find('.input-search');

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

  stepThroughOptions(step) {
    const $activeTarget = get(this, '$activeTarget');
    const $options      = $(this.element).find('.searchable-option');
    const len           = $options.length;

    let currentIdx      = -1;
    let nextIdx         = 0;


    if (len === 0) {
      return;
    }

    if (!$activeTarget) {
      $options.removeClass('searchable-option-active');
      $options.eq(0).addClass('searchable-option-active');

      set(this, '$activeTarget', $options.eq(0));

      return;
    }

    currentIdx = $options.index($activeTarget);

    if (currentIdx !== -1) {
      nextIdx = currentIdx + step;
    }

    if (nextIdx !== 0) {
      nextIdx = nextIdx < 0 ? len - 1 : nextIdx % len;
    }

    const $nextActiveTarget = $options.eq(nextIdx);

    set(this, '$activeTarget', $nextActiveTarget);

    $activeTarget.removeClass('searchable-option-active');
    $nextActiveTarget.addClass('searchable-option-active')
  },

  insertCustomValue(value, isFilter) {
    const vp = get(this, 'optionValuePath');
    const lp = get(this, 'optionLabelPath');

    value = value || '';

    if (!isFilter) {
      const custom = { custom: true, };

      custom[lp] = `${ value } (Custom)`;
      custom[vp] = value;

      get(this, 'interContent').pushObject(custom);
    } else {
      const found = get(this, 'interContent').filterBy('custom', true).get('firstObject');

      if (found) {
        set(found, lp, `${ value } (Custom)`);
        set(found, vp, value)
      }
    }
  },


});
