import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import { flattenLabelArrays } from 'ui/mixins/manage-labels';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ModalBase from 'lacsso/components/modal-base';
import C from 'ui/utils/constants';
import { debouncedObserver } from 'ui/utils/debounce';

export default ModalBase.extend(NewOrEdit, ManageLabels, {
  classNames: ['lacsso', 'modal-container', 'large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
  model: null,
  editing: true,

  ips: null,
  requireAny: null,
  systemLabels: null,
  userLabels: null,

  init() {
    this._super(...arguments);
    this.set('model', this.get('originalModel').clone());
    this.initLabels(this.get('model.labels'), null, [C.LABEL.SCHED_IPS, C.LABEL.REQUIRE_ANY]);

    let ips = [];
    let str = this.getLabel(C.LABEL.SCHED_IPS);
    if ( str ) {
      ips = str.split(/\s*,\s*/).filter(x => x.length);
    }
    this.set('ips', ips);

    let requireAny = {};
    str = this.getLabel(C.LABEL.REQUIRE_ANY);
    if ( str ) {
      str.split(/\s*,\s*/).forEach((pair) => {
        let index = pair.indexOf('=');
        if ( index > 0 ) {
          let key = pair.substr(0,index);
          let val = pair.substr(index+1);
          requireAny[key] = val;
        } else {
          requireAny[pair] = '';
        }
      });
    }
    this.set('requireAny', requireAny);
  },

  ipsChanged: function() {
    let ips = (this.get('ips')||[]).map((x) => x.trim()).filter(x => x.length);
    this.setLabel(C.LABEL.SCHED_IPS, ips.join(', '));
  }.observes('ips.[]'),

  requireAnyChanged: function() {
    let any = this.get('requireAny');
    let keys = Object.keys(any);
    let ary = [];
    keys.forEach((key) => {
      if ( key ) {
        let val = (any[key]||'').trim();
        if ( val ) {
          ary.push(key+'='+val);
        } else {
          ary.push(key);
        }
      }
    });

    this.setLabel(C.LABEL.REQUIRE_ANY, ary.join(', '));
  }.observes('requireAny'),

  updateLabels(labels) {
    this.set('systemLabels', labels);
  },

  mergeAllLabels: debouncedObserver(
    'systemLabels.@each.{key,value}',
    'userLabels.@each.{key,value}',
  function() {
    let out = flattenLabelArrays(
      this.get('systemLabels'),
      this.get('userLabels')
    );

    this.set('model.labels', out);
  }),

  actions: {
    setUserLabels(labels) {
      this.set('userLabels', labels);
    },

    updateRequireAny(any) {
      this.set('requireAny', any);
    },
  },

  doneSaving() {
    this.send('cancel');
  },
});
