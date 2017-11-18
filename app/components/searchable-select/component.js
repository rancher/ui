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

import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  intl: Ember.inject.service(),

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
  optionLabelPath: 'label',
  optionValuePath: 'value',
  optionGroupPath: 'group',
  localizedPrompt: false,
  localizedLabel: false,
  // Whether to show the search input box. It maybe useful where the option list is short.
  showSearch: true,

  showOptions: false,
  filter: null,
  // the current highlighted option.
  $activeTarget: null,

  // Show option image --> unGroupedContent only
  showOptionIcon: function() {
    return this.get('unGroupedContent').some(item => !!item.imgUrl);
  }.property('unGroupedContent.@each.imgUrl'),

  smallMode: function() {
    return this.$().hasClass('input-sm');
  }.property('class'),

  init() {
    this._super();
    if (!this.get('content')) {
      this.set('content', []);
    }
  },

  displayLabel: function() {
    const value = this.get('value');
    // Don't use prompt, prompt is a global function.
    let p = this.get('prompt');
    if (this.get('localizedPrompt')) {
      p = this.get('intl').t(p);
    }
    if (!value) {
      return p;
    }
    const vp = this.get('optionValuePath');
    const lp = this.get('optionLabelPath');
    const selectedItem = this.get('content').filterBy(vp, value).get('firstObject');
    if (selectedItem) {
      let label = Ember.get(selectedItem, lp);
      if (this.get('localizedLabel')) {
        label = this.get('intl').t(label);
      }
      return label;
    }
    return p;
  }.property('value', 'prompt', 'content.[]'),

  filtered: function() {
    const filter = (this.get('filter') || '').trim();
    const options = this.get('content');
    return options.filter(option => {
      const segments = filter.split(' ');
      const gp = this.get('optionGroupPath');
      const lp = this.get('optionLabelPath');
      const group = Ember.get(option, gp);
      const label = Ember.get(option, lp);
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
  }.property('filter,content.[]'),

  unGroupedContent: function() {
    const groupPath = this.get('optionGroupPath');
    const out = [];
    this.get('filtered').forEach((opt) => {
      const key = Ember.get(opt, groupPath);
      if (!key) {
        out.push(opt);
      }
    });
    return out;
  }.property('filtered.[]'),

  groupedContent: function() {
    const groupPath = this.get('optionGroupPath');
    const out = [];
    this.get('filtered').forEach(opt => {
      const key = Ember.get(opt, groupPath);
      if (key) {
        let group = out.filterBy('group', key)[0];
        if (!group) {
          group = {group: key, options: []};
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
            const idx = this.$('.searchable-option').index($activeTarget);

            // set value
            const activeOption = this.allContent().objectAt(idx - 1);
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

    this.set('value', Ember.get(item, vp));
    if (gp && Ember.get(item, gp)) {
      this.set('group', Ember.get(item, gp));
    }
    this.sendAction('change', item);
    this.send('hide');
  },

  showOptionsChanged: function() {
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
    mouseEnter() {
      this.$('.searchable-option').removeClass('searchable-option-active');
      const $target = this.$(event.target);
      $target.addClass('searchable-option-active');
      this.set('$activeTarget', $target);
    },
    mouseLeave() {
      this.$(event.target).removeClass('searchable-option-active');
      this.set('$activeTarget', null);
    },
    show() {
      this.set('showOptions', true);
    },
    hide() {
      this.set('filter', null);
      this.set('showOptions', false);
      this.set('$activeTarget', null);
    },
  },
  willDestoryElement() {
    this.off();
  }
});
