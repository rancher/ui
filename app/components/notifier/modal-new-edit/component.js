import Component from '@ember/component';
import { alias, reads } from '@ember/object/computed';
import ModalBase from 'ui/mixins/modal-base';
import { resolve } from 'rsvp';
import layout from './template';
import { get, set, computed, observer } from '@ember/object'
import { inject as service } from '@ember/service';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';

const TYPES = [
  {
    type:     'slack',
    label:    'notifierPage.notifierTypes.slack',
    css:      'slack',
    disabled: false,
  },
  {
    type:     'email',
    label:    'notifierPage.notifierTypes.email',
    css:      'email',
    disabled: false,
  },
  {
    type:     'pagerduty',
    label:    'notifierPage.notifierTypes.pagerduty',
    css:      'pagerduty',
    disabled: false,
  },
  {
    type:     'webhook',
    label:    'notifierPage.notifierTypes.webhook',
    css:      'webhook',
    disabled: false,
  },
  {
    type:     'wechat',
    label:    'notifierPage.notifierTypes.wechat',
    css:      'wechat',
    disabled: false,
  },
  {
    type:     'dingtalk',
    label:    'notifierPage.notifierTypes.dingtalk',
    css:      'dingtalk',
    disabled: false,
  },
  {
    type:     'msteams',
    label:    'notifierPage.notifierTypes.msteams',
    css:      'msteams',
    disabled: false,
  },
];

const RECIPIENT_TYPES = [
  {
    label: 'notifierPage.wechat.recipientType.party',
    value: 'party'
  },
  {
    label: 'notifierPage.wechat.recipientType.tag',
    value: 'tag'
  },
  {
    label: 'notifierPage.wechat.recipientType.user',
    value: 'user'
  }
]

export default Component.extend(ModalBase, NewOrEdit, {
  scope:          service('scope'),
  globalStore:    service(),
  intl:           service(),

  layout,
  classNames:     ['generic', 'large-modal'],

  modelMap:       null,
  errors:         null,
  testing:        false,
  testOk:         true,
  recipientTypes: RECIPIENT_TYPES,

  cluster: alias('scope.currentCluster'),

  currentType: alias('modalService.modalOpts.currentType'),
  model:       alias('modalService.modalOpts.model'),
  mode:        reads('modalService.modalOpts.mode'),

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

  actions: {
    switchType(type) {
      this.set('currentType', type);
      this.setModel(type);
    },
    test() {
      if (get(this, 'testing') || get(this, 'tested')) {
        return resolve();
      }
      const ok = this.validate();

      if (!ok) {
        return resolve();
      }
      const data = get(this, 'model').serialize();
      const gs = get(this, 'globalStore');

      set(this, 'testing', true);

      // TODO: better way to do collection actions
      return gs.rawRequest({
        url:    'notifiers?action=send',
        method: 'POST',
        data,
      }).then(() => {
        this.setProperties({
          testOk:  true,
          tested:  true,
          testing: false,
          errors:  null,
        });
        setTimeout(() => {
          this.setProperties({ tested: false, });
        }, 3000);
      })
        .catch((xhr) => {
          this.setProperties({
            testOk:  false,
            tested:  true,
            testing: false,
            errors:  [get(xhr, 'body.message') || get(xhr, 'body.code')],
          });
          setTimeout(() => {
            this.setProperties({ tested: false, });
          }, 3000);
        });
    },
  },
  currentTypeChanged: observer('currentType', function() {
    set(this, 'errors', null);
  }),

  addBtnLabel: computed('mode', function() {
    const mode = get(this, 'mode');

    if (mode === 'edit') {
      return 'generic.save';
    } else if (mode === 'clone') {
      return 'notifierPage.clone';
    } else if (mode === 'add') {
      return 'generic.add';
    }
  }),

  isSelectType: computed('currentType', function() {
    const types = TYPES.map((t) => t.type)

    return types.includes(get(this, 'currentType'))
  }),
  setModel(type) {
    const cachedModel = get(this, `modelMap.${ type }`);
    const clusterId = get(this, 'cluster.id');
    const gs = get(this, 'globalStore');

    if (cachedModel) {
      set(this, 'model', cachedModel);

      return;
    }
    if (type === 'email') {
      type = 'smtp';
    }
    const configType = `${ type }Config`;
    const opt = {
      type:         'notifier',
      name:         null,
      description:  null,
      clusterId,
      [configType]: gs.createRecord({ type: configType }),
    };
    const model = get(this, 'globalStore').createRecord(opt);

    set(this, 'model', model);
    set(this, `modelMap.${ type }`, model);
  },

  doneSaving() {
    get(this, 'modalService').toggleModal();
  },

  validate() {
    this._super(...arguments);
    const errors = get(this, 'errors') || [];
    const intl = get(this, 'intl')
    const preError = '"Default Recipient" is required'

    const notifierType = get(this, 'model.notifierType')

    if (errors.includes(preError)) {
      let afterError = ''

      if (notifierType === 'email') {
        afterError = C.NOTIFIER_TABLE_LABEL.SMTP
        errors.splice(errors.findIndex((e) => e === preError), 1, intl.t('validation.required', { key: afterError }))
      }
    }

    set(this, 'errors', errors);

    return get(this, 'errors.length') === 0;
  },
});
