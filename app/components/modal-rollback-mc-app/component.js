import { get, set, computed } from '@ember/object';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import jsondiffpatch from 'jsondiffpatch';
import moment from 'moment';
import { notEmpty } from '@ember/object/computed';

const HIDDEN_FIELDS = ['digest', 'created', 'createdTS', 'links', 'uuid', 'id', 'name'];

function sanitizeToRemoveHiddenKeys(config) {
  HIDDEN_FIELDS.forEach((key) => {
    if (config.hasOwnProperty(key)) {
      delete config[key];
    }
  });

  return config;
}

export default Component.extend(ModalBase, {
  layout,

  classNames: ['large-modal'],

  loading:    true,
  revisions:  null,
  revisionId: null,

  multiClusterAppHasUpgradeStrategy: notEmpty('model.upgradeStrategy.rollingUpdate'),

  didReceiveAttrs() {
    this.initModelWithClone();

    this.getMultiClusterAppRevisions();
  },

  actions: {
    save(cb) {
      const { revisionId } = this;
      const neu            = { revisionId };

      if (get(this, 'multiClusterAppHasUpgradeStrategy')) {
        set(neu, 'batch', this.model.upgradeStrategy.rollingUpdate);
      }

      this.model.doAction('rollback', { revisionId, })
        .then(() => this.send('cancel'))
        .finally(() => cb());
    },
  },

  choices: computed('revisions.[]', function() {
    return (get(this, 'revisions') || [])
      .sortBy('created')
      .reverse()
      .map((r) => {
        let time = moment(get(r, 'created'));

        return {
          label: `${ get(r, 'name')  }: ${  time.format('YYYY-MM-DD HH:mm:ss')  } (${  time.fromNow()  })`,
          value: get(r, 'name'),
          data:  r,
        };
      });
  }),


  currentMultiClusterAppRevision: computed('choices.[]', 'revisionId', 'selectedMultiClusterAppRevision', function() {
    return get(this, 'choices.firstObject.data');
  }),

  selectedMultiClusterAppRevision: computed('choices.[]', 'revisionId', 'currentMultiClusterAppRevision', function() {
    const match = get(this, 'choices').findBy('value', get(this, 'revisionId'));

    return match ? match.data : null;
  }),

  answersDiff: computed('currentMultiClusterAppRevision', 'selectedMultiClusterAppRevision', 'revisionId', function() {
    if (get(this, 'currentMultiClusterAppRevision') && get(this, 'selectedMultiClusterAppRevision')) {
      const { currentMultiClusterAppRevision, selectedMultiClusterAppRevision }  = this;

      return this.generateAnswersJsonDiff(currentMultiClusterAppRevision, selectedMultiClusterAppRevision);
    }
  }),

  initModelWithClone() {
    set(this, 'model', get(this, 'modalService.modalOpts.originalModel').clone());
  },

  generateAnswersJsonDiff(left, right) {
    const delta = jsondiffpatch.diff(sanitizeToRemoveHiddenKeys(left), sanitizeToRemoveHiddenKeys(right));

    jsondiffpatch.formatters.html.hideUnchanged();

    return jsondiffpatch.formatters.html.format(delta, left).htmlSafe();
  },

  getMultiClusterAppRevisions() {
    const revisionsURL = get(this, 'modalService.modalOpts.revisionsLink');

    return get(this, 'store').rawRequest({
      url:    revisionsURL,
      method: 'GET',
    })
      .then((revs) => set(this, 'revisions', revs.body.data))
      .catch((err) => {
        this.send('cancel');

        get(this, 'growl').fromError(err);
      })
      .finally(() => set(this, 'loading', false));
  }
});
