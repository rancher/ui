import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import NewOrEdit from 'shared/mixins/new-or-edit';
import layout from './template';
import { alias, notEmpty } from '@ember/object/computed';
import { get, set, setProperties, observer } from '@ember/object';
import { inject as service } from '@ember/service';

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
  layout,
  classNames:    ['medium-modal'],
  model:         null,
  allNamespaces: null,
  allProjects:   null,
  selectedScope: null,
  allScopes:     null,

  kindChoices,

  originalModel:  alias('modalService.modalOpts.model'),
  editing:        notEmpty('originalModel.id'),
  scope:          alias('modalService.modalOpts.scope'),

  init() {
    this._super(...arguments);

    const orig  = this.get('originalModel');
    const clone = orig.clone();

    this._initScope();

    set(clone, 'kind', 'helm');
    set(this, 'model', clone);
  },

  watchScope: observer('selectedScope', function() {
    set(this, 'model', this._initModel(get(this, 'selectedScope')));
  }),

  doneSaving() {
    this.send('cancel');
  },

  _initScope() {
    const { scope } = this;
    let choices     = scopeChoices.sortBy('scope');

    switch (scope) {
    case 'cluster':
      choices = scopeChoices.filter( (s) => s.scope !== 'project').sortBy('scope');
      break;
    case 'global':
      choices = scopeChoices.filter( (s) => s.scope === 'global').sortBy('scope');
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
      set(record, 'type', );
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
        branch: get(current, 'branch'),
        url:    get(current, 'url'),
        name:   get(current, 'name'),
      });
    }

    return get(this, 'globalStore').createRecord(record);
  },

});
