import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import { flattenLabelArrays } from 'ui/mixins/manage-labels';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';
import { debouncedObserver } from 'ui/utils/debounce';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, NewOrEdit, ManageLabels, {
  classNames: ['large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
  model: null,
  editing: true,

  ips: null,
  ipLabels: null,
  userLabels: null,

  init() {
    this._super(...arguments);
    this.set('model', this.get('originalModel').clone());
    this.initLabels(this.get('model.labels'), 'system');

    let ips = [];
    let str = this.getLabel(C.LABEL.SCHED_IPS);
    if ( str ) {
      ips = str.split(/\s*,\s*/).filter(x => x.length);
    }
    this.set('ips', ips);
  },

  ipsChanged: function() {
    let ips = (this.get('ips')||[]).map((x) => x.trim()).filter(x => x.length);
    this.setLabel(C.LABEL.SCHED_IPS, ips.join(', '));
  }.observes('ips.[]'),

  updateLabels(labels) {
    this.set('ipLabels', labels);
  },

  mergeAllLabels: debouncedObserver(
    'userLabels.@each.{key,value}',
    'ipLabels.@each.{key,value}',
  function() {
    let out = flattenLabelArrays(
      this.get('userLabels'),
      this.get('ipLabels')
    );

    this.set('model.labels', out);
  }),

  actions: {
    setUserLabels(labels) {
      this.set('userLabels', labels);
    },
  },

  doneSaving() {
    this.send('cancel');
  },
});
