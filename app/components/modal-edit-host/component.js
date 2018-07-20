import { observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ManageLabels from 'shared/mixins/manage-labels';
import { flattenLabelArrays } from 'shared/mixins/manage-labels';
import NewOrEdit from 'shared/mixins/new-or-edit';
import C from 'ui/utils/constants';
import { debouncedObserver } from 'ui/utils/debounce';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, NewOrEdit, ManageLabels, {
  layout,
  classNames:    ['large-modal'],
  model:         null,
  editing:       true,

  ips:            null,
  requireAny:     null,
  requiredIfAny:  { [C.LABEL.SYSTEM_TYPE]: '' },
  readonlyLabels: [C.LABEL.PER_HOST_SUBNET],
  systemLabels:   null,
  userLabels:     null,
  customName:     null,

  originalModel:      alias('modalService.modalOpts'),
  init() {
    this._super(...arguments);
    this.set('model', this.get('originalModel').clone());
    this.initLabels(this.get('model.labels'), null, [C.LABEL.SCHED_IPS, C.LABEL.REQUIRE_ANY]);

    if (this.get('model.name')) {
      this.set('customName', this.get('model.name'))
    }

    let ips = [];
    let str = this.getLabel(C.LABEL.SCHED_IPS);

    if ( str ) {
      ips = str.split(/\s*,\s*/).filter((x) => x.length);
    }
    this.set('ips', ips);

    this.set('requireAny', this.getLabel(C.LABEL.REQUIRE_ANY));
  },

  actions: {
    setUserLabels(labels) {
      this.set('userLabels', labels);
    },
  },

  customNameObserver: on('init', observer('customName', function() {
    let cn = this.get('customName');

    if (cn && cn.length > 0) {
      this.set('primaryResource.name', cn);
    } else {
      this.set('primaryResource.name', null);
    }
  })),

  ipsChanged: function() {
    let ips = (this.get('ips') || []).map((x) => x.trim()).filter((x) => x.length);

    this.setLabel(C.LABEL.SCHED_IPS, ips.join(', '));
  }.observes('ips.[]'),

  requireAnyChanged: function() {
    let any = this.get('requireAny');

    this.setLabel(C.LABEL.REQUIRE_ANY, any || undefined);
  }.observes('requireAny'),

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

  updateLabels(labels) {
    this.set('systemLabels', labels);
  },

  doneSaving() {
    this.send('cancel');
  },
});
