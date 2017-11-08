import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { get, computed } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,
  intl:       service(),

  rSelected:  false,
  wSelected:  false,
  mSelected:  false,

  selection:  null,

  init: function() {
    this._super();
    var sel = get(this, 'initialSelection');
    this.setProperties({
      rSelected: sel.indexOf('r') >= 0,
      wSelected: sel.indexOf('w') >= 0,
      mSelected: sel.indexOf('m') >= 0,
    });
  },

  actions: {
    selectChanged(x, ele) {
      var str = ($(ele.target).val()||[]).join('');
      this.sendAction('changed', str);
    },
  },

  didInsertElement: function() {
    if (get(this, 'editing')) {
      var moreClass = get(this, 'buttonClass')||'';
      var opts = {
        buttonClass: 'btn bg-default' + (moreClass ? ' '+moreClass : ''),
        numberDisplayed: 2,
        nonSelectedText: get(this, 'intl').t('devicePermissions.none'),
        allSelectedText: get(this, 'intl').t('devicePermissions.all'),

        templates: {
          li: '<li><a tabindex="0"><label></label></a></li>',
        },
      };

      this.$('SELECT').multiselect(opts);
    }
  },

  humanReadableList: computed('initialSelection', function() {
    let permissions = get(this, 'initialSelection').split('');
    let out = [];

    permissions.forEach((perm) => {
      switch (perm) {
        case 'r':
          out.push(get(this, 'intl').tHtml('devicePermissions.read'));
          break;
        case 'w':
          out.push(get(this, 'intl').tHtml('devicePermissions.write'));
          break;
        case 'm':
          out.push(get(this, 'intl').tHtml('devicePermissions.mknod'));
          break;
        default:
          break;
      }
    });

    return out.join('/');

  }),

  rebuild: function() {
    next(() => {
      if (get(this, 'editing')) {
        this.$('SELECT').multiselect('setOptions', {
          nonSelectedText: get(this, 'intl').t('devicePermissions.none'),
          allSelectedText: get(this, 'intl').t('devicePermissions.all'),
        });
        this.$('SELECT').multiselect('rebuild');
      }
    });
  }.observes('intl.locale'),
});
