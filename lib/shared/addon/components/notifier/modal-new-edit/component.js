import Component from '@ember/component';
import { alias, reads } from '@ember/object/computed';
import ModalBase from 'ui/mixins/modal-base';
import { resolve} from 'rsvp';
import layout from './template';
import { get, set } from '@ember/object'
import { inject as service } from '@ember/service';
import NewOrEdit from 'ui/mixins/new-or-edit';

const TYPES = [
  {
    type: 'slack',
    label: 'notifierPage.notifierTypes.slack',
    css: 'slack',
    disabled: false,
  },
  {
    type: 'email',
    label: 'notifierPage.notifierTypes.email',
    css: 'email',
    disabled: false,
  },
  {
    type: 'pagerduty',
    // label: 'notifierPage.notifierTypes.pagerduty',
    css: 'pagerduty',
    disabled: false,
  },
  {
    type: 'webhook',
    label: 'notifierPage.notifierTypes.webhook',
    css: 'webhook',
    disabled: false,
  },
];

export default Component.extend(ModalBase, NewOrEdit, {
  layout,
  scope: service('scope'),
  globalStore: service(),
  cluster: alias('scope.currentCluster'),

  classNames: ['generic', 'large-modal'],
  currentType: alias('modalService.modalOpts.currentType'),
  model: alias('modalService.modalOpts.model'),
  mode: reads('modalService.modalOpts.mode'),

  modelMap: null,
  errors: null,
  disableTest: false,
  testing: false,
  testOk: true,

  addBtnLabel: function() {
    const mode = get(this, 'mode');
    if (mode === 'edit') {
      return 'generic.save';
    } else if (mode === 'clone') {
      return 'notifierPage.clone';
    } else if (mode === 'add') {
      return 'generic.add';
    }
  }.property('mode'),

  setModel(type) {
    const cachedModel = get(this, `modelMap.${type}`);
    const clusterId = get(this, 'cluster.id');
    const gs = get(this, 'globalStore');
    if (cachedModel) {
      set(this, 'model', cachedModel);
      return;
    }
    if (type === 'email') {
      type = 'smtp';
    }
    const configType = `${type}Config`;
    const opt = {
      type: 'notifier',
      name: null,
      description: null,
      clusterId,
      [configType]: gs.createRecord({type: configType}),
    };
    const model = get(this, 'globalStore').createRecord(opt);
    set(this, 'model', model);
    set(this, `modelMap.${type}`, model);
  },

  init(...args) {
    this._super(...args);
    const mode = get(this, 'mode');
    if (mode === 'edit' || mode === 'clone') {
      const t = get(this, 'currentType');
      this.set('types', TYPES.filterBy('type', t));
    } else if (mode === 'add') {
      set(this, 'modelMap', {});
      this.setModel(get(this, 'currentType'));
      this.set('types', TYPES);
    }
  },

  doneSaving() {
    get(this, 'modalService').toggleModal();
  },

  currentTypeChanged: function() {
    set(this, 'errors', null);
  }.observes('currentType'),

  actions: {
    switchType(type) {
      this.set('currentType', type);
      this.setModel(type);
    },
    test() {
      if (get(this, 'disableTest')) {
        return resolve();
      }
      const ok = this.validate();
      if (!ok) {
        return;
      }
      const data = get(this, 'model').serialize();
      const gs = get(this, 'globalStore');
      set(this, 'testing', true);
      // TODO: better way to do collection actions
      return gs.rawRequest({
        url: 'notifiers?action=send',
        method: 'POST',
        data,
      }).then(() => {
        this.setProperties({
          testOk: true,
          tested: true,
          testing: false,
          errors: null,
        });
        setTimeout(() => {
          this.setProperties({
            tested: false,
          });
        }, 3000);
      }).catch((xhr) => {
        this.setProperties({
          testOk: false,
          tested: true,
          testing: false,
          errors: [xhr.body.message || xhr.body.code],
        });
        setTimeout(() => {
          this.setProperties({
            tested: false,
          });
        }, 3000);
      });
    },
  },
});
