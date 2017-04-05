import Ember from 'ember';
import C from 'ui/utils/constants';

const TABLE_COUNTS = [
  { value: "10", },
  { value: "25", },
  { value: "50", },
  { value: "100", },
  { value: "250", },
  { value: "500", },
  { value: "1000", },
];

export default Ember.Component.extend({
  prefs: Ember.inject.service(),
  perPage: Ember.computed.alias('prefs.tablePerPage'),
  tableCounts: TABLE_COUNTS,
  selectedCount: null,

  init() {
    this._super(...arguments);
    this.set('selectedCount', this.get('perPage')+"");
  },

  actions: {
    save(cb) {
      this.set(`prefs.${C.PREFS.TABLE_COUNT}`, parseInt(this.get('selectedCount'),10));
      cb(true);
    }
  }
});
