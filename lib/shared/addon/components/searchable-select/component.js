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
import { get, set } from '@ember/object';
import C from 'ui/utils/constants';
import layout from './template';

export default Component.extend({
  layout,
  intl: service(),

  classNames: ['searchable-select'],
  classNameBindings: ['class'],

  // input
  class: null,
  value: null,
  prefix: null,
  suffix: null,
  prompt: null,
  // If need to catch the group changes, you can pass a group prop in.
  group: null,
  content: null,
  interContent: null,
  optionLabelPath: 'label',
  optionValuePath: 'value',
  optionGroupPath: 'group',
  localizedPrompt: false,
  localizedLabel: false,
  readOnly: null,

  showOptions: false,
  allowCustom: false,
  filter: null,
  // the current highlighted option.
  $activeTarget: null,

  // Show option image --> unGroupedContent only
  showOptionIcon: function () {
    return this.get('unGroupedContent').some(item => !!item.imgUrl);
  }.property('unGroupedContent.@each.imgUrl'),

  init() {
    this._super();
    if (!this.get('content')) {
      this.set('content', []);
    }
    this.set('interContent', this.get('content').slice(0));

    if (this.get('allowCustom')) {
      this.set('searchLabel', 'generic.searchOrCustomInput');
      const value = this.get('value');
      this.insertCustomValue(value, false);
    }
    this.set('filter', this.get('displayLabel'));
  },

  insertCustomValue: function (value, isFilter) {
    const vp = this.get('optionValuePath');
    const lp = this.get('optionLabelPath');
    value = value || '';
    if (!isFilter) {
      const custom = {
        custom: true,
      };
      custom[lp] = `${value} (Custom)`;
      custom[vp] = value;
      this.get('interContent').pushObject(custom);
    } else {
      const found = this.get('interContent').filterBy('custom', true).get('firstObject');
      if (found) {
        set(found, lp, `${value} (Custom)`);
        set(found, vp, value)
      }
    }
  },

  displayLabel: function () {
    const value = this.get('value');
    if (!value) {
      return null;
    }

    const vp = this.get('optionValuePath');
    const lp = this.get('optionLabelPath');
    const selectedItem = this.get('interContent').filterBy(vp, value).get('firstObject');

    if (selectedItem) {
      let label = get(selectedItem, lp);
      if (this.get('localizedLabel')) {
        label = this.get('intl').t(label);
      }
      return label;
    }
    return null;
  }.property('value', 'prompt', 'interContent.[]'),

  didInsertElement() {
    this.$('.input-search').on('click', () => {
      this.send('show');
    })
  },

  filtered: function() {
    const filter = (this.get('filter') || '').trim();
    const options = this.get('interContent');
    if (this.get('allowCustom')) {
      this.insertCustomValue(filter, true);
    }
    return options.filter(option => {
      const segments = filter.split(' ');
      const gp = this.get('optionGroupPath');
      const lp = this.get('optionLabelPath');
      const group = get(option, gp);
      const label = get(option, lp);
      return segments.every(s => {
        const pattern = new RegExp(s, 'i');
        const labelMatched = pattern.test(label);
        let groupMatched = false;
        if (group && group.trim()) {
          groupMatched = pattern.test(group);
          return groupMatched || labelMatched;
        }
        return labelMatched;
      });
    });
  }.property('filter', 'interContent.[]'),

  unGroupedContent: function () {
    const groupPath = this.get('optionGroupPath');
    const out = [];
    this.get('filtered').forEach((opt) => {
      const key = get(opt, groupPath);
      if (!key) {
        out.push(opt);
      }
    });
    return out;
  }.property('filtered.[]'),

  groupedContent: function () {
    const groupPath = this.get('optionGroupPath');
    const out = [];
    this.get('filtered').forEach(opt => {
      const key = get(opt, groupPath);
      if (key) {
        let group = out.filterBy('group', key)[0];
        if (!group) {
          group = { group: key, options: [] };
          out.push(group);
        }
        group.options.push(opt);
      }
    });
    return out.sortBy(groupPath);
  }.property('filtered.[]'),

  allContent() {
    const out = [];
    const grouped = this.get('groupedContent');
    const unGrouped = this.get('unGroupedContent');
    out.pushObjects(unGrouped);
    grouped.forEach(g => out.pushObjects(g.options));
    return out;
  },

  on() {
    this.$().on('keydown.searchable-keydown', event => {
      const kc = event.keyCode;
      // Note: keyup event can't be prevented.
      if (!this.get('showOptions')) {
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
        const $activeTarget = this.get('$activeTarget');
        if ($activeTarget) {
          // activeTarget is prompt
          if ($activeTarget.hasClass('searchable-prompt')) {
            this.send('selectPrompt');
          } else {
            let idx = this.$('.searchable-option').index($activeTarget);
            idx = !!this.get('prompt') ? idx - 1 : idx;

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
    this.$().off('keydown.searchable-keydown');
  },

  setSelect(item) {
    const gp = this.get('optionGroupPath');
    const vp = this.get('optionValuePath');

    this.set('value', get(item, vp));
    if (gp && get(item, gp)) {
      this.set('group', get(item, gp));
    }
    this.set('filter', this.get('displayLabel'));
    // https://stackoverflow.com/questions/39624902/new-input-placeholder-behavior-in-safari-10-no-longer-hides-on-change-via-java
    next(() => {
      this.$('.input-search').focus();
      this.$('.input-search').blur();
    })
    this.sendAction('change', item);
    this.send('hide');
  },

  showOptionsChanged: function () {
    const show = this.get('showOptions');
    if (show) {
      this.on();
    } else {
      this.off();
    }
  }.observes('showOptions'),

  stepThroughOptions(step) {
    const $activeTarget = this.get('$activeTarget');
    const $options = this.$('.searchable-option');
    let currentIdx = -1;
    let nextIdx = 0;

    const len = $options.length;

    if (len === 0) {
      return;
    }

    if (!$activeTarget) {
      $options.removeClass('searchable-option-active');
      $options.eq(0).addClass('searchable-option-active');
      this.set('$activeTarget', $options.eq(0));
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
    this.set('$activeTarget', $nextActiveTarget);

    $activeTarget.removeClass('searchable-option-active');
    $nextActiveTarget.addClass('searchable-option-active')
  },

  actions: {
    selectUnGroupedItem(idx) {
      const found = this.get('unGroupedContent').objectAt(idx);
      this.setSelect(found);
    },
    selectGroupedItem(items, idx) {
      const found = items.objectAt(idx);
      this.setSelect(found);
    },
    selectPrompt() {
      this.set('value', null);
      this.send('hide');
    },
    mouseEnter(event) {
      this.$('.searchable-option').removeClass('searchable-option-active');
      const $target = this.$(event.target);
      $target.addClass('searchable-option-active');
      this.set('$activeTarget', $target);
    },
    mouseLeave(event) {
      this.$(event.target).removeClass('searchable-option-active');
      this.set('$activeTarget', null);
    },
    show() {
      if (this.get('showOptions') === true) {
        return;
      }
      this.set('filter', null);
      // select text inside input search box, which will let users easey to clear the inputed text.
      // this.$('.input-search').select();
      this.set('showOptions', true);
    },
    hide() {
      this.set('filter', this.get('displayLabel'));
      this.set('showOptions', false);
      this.set('$activeTarget', null);
    },
  },
  willDestoryElement() {
    this.off();
  }
});
