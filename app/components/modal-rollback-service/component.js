import { inject as service } from '@ember/service';
import { get, set, computed } from '@ember/object';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import C from 'shared/utils/constants';
import moment from 'moment';

import jsondiffpatch from 'jsondiffpatch';

const HIDDEN_FIELDS = ['created', 'creatorId', 'name', 'ownerReferences', 'removed', 'scale', 'state', 'uuid', 'workloadLabels', 'workloadAnnotations'];

function sanitize(config, keys) {
  const result = {};

  keys.forEach((key) => {
    if (config[key] !== undefined) {
      result[key] = config[key]
    }
    if (key === 'labels' && result.labels) {
      delete result.labels['pod-template-hash'];
    }
    if (key === 'selector' && result.selector && result.selector.matchLabels) {
      delete result.selector.matchLabels['pod-template-hash'];
    }
  });

  return result;
}

export default Component.extend(ModalBase, {
  growl: service(),

  layout,
  classNames: ['large-modal'],

  keys: null,

  name:       null,
  loading:    true,
  revisions:  null,
  revisionId: null,

  init() {
    this._super(...arguments);

    const schema = get(this, 'store').getById('schema', 'workload');
    const resourceFields = get(schema, 'resourceFields');

    set(this, 'keys', Object.keys(resourceFields).filter((field) => !field.endsWith('Status') && HIDDEN_FIELDS.indexOf(field) === -1));
  },

  didReceiveAttrs() {
    let model = get(this, 'modalService.modalOpts.originalModel').clone();

    set(this, 'model', model);
    get(this, 'store').rawRequest({
      url:    get(model, 'links.revisions'),
      method: 'GET',
    })
      .then((revs) => {
        set(this, 'revisions', revs.body.data);
      })
      .catch((err) => {
        this.send('cancel');
        get(this, 'growl').fromError(err);
      })
      .finally(() => {
        set(this, 'loading', false);
      });
  },

  actions: {
    save(cb) {
      const id = get(this, 'selected.id');

      get(this, 'model').doAction('rollback', { replicaSetId: id, })
        .then(() => {
          this.send('cancel');
        })
        .finally(() => {
          cb();
        });
    },
  },

  choices: computed('revisions.[]', function() {
    return (get(this, 'revisions') || [])
      .sortBy('createdTS')
      .reverse()
      .map((r) => {
        let time = moment(get(r, 'created'));
        let id = get(r, 'id');

        return {
          label:    `${ id  }: ${  time.format('YYYY-MM-DD HH:mm:ss')  } (${  time.fromNow()  })`,
          value:    id,
          ts:       get(r, 'createdTS'),
          data:     r,
          disabled: r.workloadAnnotations[C.LABEL.DEPLOYMENT_REVISION] === get(this, 'model.workloadAnnotations')[C.LABEL.DEPLOYMENT_REVISION]
        };
      });
  }),

  current: computed('revisions.@each.workloadAnnotations', function() {
    const currentRevision = get(this, 'model.workloadAnnotations')[C.LABEL.DEPLOYMENT_REVISION];

    return (get(this, 'revisions') || []).find((r) => get(r, 'workloadAnnotations')[C.LABEL.DEPLOYMENT_REVISION] === currentRevision);
  }),

  selected: computed('revisionId', 'revisions.[]', function() {
    return (get(this, 'revisions') || []).findBy('id', get(this, 'revisionId'));
  }),

  diff: computed('current', 'selected', function() {
    if (get(this, 'current') && get(this, 'selected')) {
      let left = sanitize(get(this, 'current'), get(this, 'keys'));
      let right = sanitize(get(this, 'selected'), get(this, 'keys'));
      var delta = jsondiffpatch.diff(left, right);

      jsondiffpatch.formatters.html.hideUnchanged();

      return jsondiffpatch.formatters.html.format(delta, left).htmlSafe();
    }
  }),
});
