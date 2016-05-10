import Ember from 'ember';

export default Ember.Component.extend({
  intl: Ember.inject.service(),

  rSelected: false,
  wSelected: false,
  mSelected: false,

  selection: null,

  init: function() {
    this._super();
    var sel = this.get('initialSelection');
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
    var moreClass = this.get('buttonClass')||'';
    var opts = {
      buttonClass: 'btn btn-default' + (moreClass ? ' '+moreClass : ''),
      numberDisplayed: 2,
      nonSelectedText: this.get('intl').t('devicePermissions.none'),
      allSelectedText: this.get('intl').t('devicePermissions.all'),

      templates: {
        li: '<li><a tabindex="0"><label></label></a></li>',
      },
    };

    this.$('SELECT').multiselect(opts);
  },

  rebuild: function() {
    Ember.run.next(() => {
      this.$('SELECT').multiselect('setOptions', {
        nonSelectedText: this.get('intl').t('devicePermissions.none'),
        allSelectedText: this.get('intl').t('devicePermissions.all'),
      });
      this.$('SELECT').multiselect('rebuild');
    });
  }.observes('intl._locale'),
});
