import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import NewOrEdit from 'shared/mixins/new-or-edit';
import layout from './template';
import { alias, notEmpty } from '@ember/object/computed';
import { get, set, setProperties, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import C from 'ui/utils/constants';
import { isEmpty } from '@ember/utils';

const { HELM_VERSION_2: helmV2, HELM_VERSION_3: helmV3 } = C.CATALOG;

const kindChoices = [
  {
    translationKey: 'catalogSettings.more.kind.helm',
    value:          'helm'
  },
];

const scopeChoices = [
  { scope: 'global' },
  { scope: 'cluster' },
  { scope: 'project' }
];

export default Component.extend(ModalBase, NewOrEdit, {
  scopeService:  service('scope'),
  globalStore:   service(),
  intl:          service(),
  layout,
  classNames:    ['medium-modal'],
  model:         null,
  allNamespaces: null,
  allProjects:   null,
  selectedScope: null,
  allScopes:     null,
  helmVersions:  null,
  isPrivate:     false,


  kindChoices,

  originalModel:  alias('modalService.modalOpts.model'),
  editing:        notEmpty('originalModel.id'),
  scope:          alias('modalService.modalOpts.scope'),

  init() {
    this._super(...arguments);

    const orig  = this.get('originalModel');
    const clone = orig.clone();

    this._initScope();
    this.initHelmVerions();

    set(clone, 'kind', 'helm');

    if (isEmpty(clone.helmVersion)) {
      set(clone, 'helmVersion', helmV2);
    }

    setProperties(this, {
      model:     clone,
      username:  get(clone, 'username'),
      isPrivate: get(clone, 'username') ? true : false,
    })
  },

  watchScope: observer('selectedScope', function() {
    set(this, 'model', this._initModel(get(this, 'selectedScope')));
  }),

  willSave() {
    const isPrivate = get(this, 'isPrivate')
    const pr = get(this, 'primaryResource')

    if (isPrivate) {
      setProperties(pr, {
        username: get(this, 'username'),
        password: get(this, 'password'),
      })
    } else {
      setProperties(pr, {
        username: null,
        password: null,
      })
    }

    return this._super(...arguments);
  },

  validate() {
    this._super(...arguments);
    const errors = get(this, 'errors') || [];
    const isPrivate = get(this, 'isPrivate')

    if (isPrivate) {
      if (!get(this, 'username')) {
        errors.push(get(this, 'intl').t('catalogSettings.more.username.required'))
      }
      if (!get(this, 'password')) {
        errors.push(get(this, 'intl').t('catalogSettings.more.password.required'))
      }
    }
    set(this, 'errors', errors);

    return errors.length === 0;
  },

  doneSaving() {
    this.send('cancel');
  },

  _initScope() {
    const { scope } = this;
    let choices     = scopeChoices;

    switch (scope) {
    case 'cluster':
      choices = scopeChoices.filter( (s) => s.scope !== 'project');
      break;
    case 'global':
      choices = scopeChoices.filter( (s) => s.scope === 'global');
      break;
    case 'project':
    default:
      break;
    }

    setProperties(this, {
      allScopes:     choices,
      selectedScope: scope
    });
  },

  _initModel(scope = 'global') {
    const current  = get(this, 'model');
    const record   = {
      type:   'catalog',
      kind:   'helm',
      branch: 'master',
    }

    switch (scope) {
    case 'cluster':
      setProperties(record, {
        type:      'clusterCatalog',
        clusterId: get(this, 'scopeService.currentCluster.id'),
      });
      break;
    case 'project':
      setProperties(record, {
        type:      'projectCatalog',
        projectId: get(this, 'scopeService.currentProject.id'),
      });
      break;
    case 'global':
    default:
      break;
    }

    if (current) {
      setProperties(record, {
        branch:     get(current, 'branch'),
        url:        get(current, 'url'),
        name:       get(current, 'name'),
        username:   get(current, 'username'),
      });
    }

    if (get(current, 'username')) {
      set(this, 'isPrivate', true)
    } else {
      set(this, 'isPrivate', false)
    }

    return get(this, 'globalStore').createRecord(record);
  },

  initHelmVerions() {
    const mappedVerions = [
      {
        label: 'Helm v2',
        value: helmV2,
      },
      {
        label: 'Helm v3',
        value: helmV3,
      },
    ];

    set(this, 'helmVersions', mappedVerions);
  },

});
