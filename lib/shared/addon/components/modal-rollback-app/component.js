import { inject as service } from '@ember/service';
import { get, set, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,

  classNames: ['large-modal'],

  revisions: alias('model.status.releases'),
  selectedRevision: null,

  actions: {
    save(cb) {
      const revision = get(this, 'selectedRevision');
      get(this, 'model').doAction('rollback', {
        revision,
      }).then(() => {
        this.send('cancel');
      }).finally(() => {
        cb();
      });
    },
  },

  didReceiveAttrs() {
    let model = get(this, 'modalService.modalOpts.originalModel').clone();
    set(this, 'model', model);
  },

  choices: computed('revisions.[]', function () {
    return (get(this, 'revisions') || [])
      .sortBy('createTimestamp')
      .reverse()
      .map((r) => {
        let time = moment(get(r, 'createTimestamp'));
        return {
          label: get(r, 'name') + ': ' + time.format('YYYY-MM-DD HH:mm:ss') + ' (' + time.fromNow() + ')',
          value: get(r, 'version'),
          data: r,
        };
      });
  }),

  current: computed('choices.[]', function () {
    return get(this, 'choices.firstObject.data');
  }),

  selected: computed('revision', 'revisions.[]', function () {
    return get(this, 'revisions').findBy('version', get(this, 'revision'));
  }),

  diff: computed('current', 'selected', function () {
    if (get(this, 'current') && get(this, 'selected')) {
      let left = '';
      let right = '';
      var delta = jsondiffpatch.diff(left, right);
      jsondiffpatch.formatters.html.hideUnchanged();
      return jsondiffpatch.formatters.html.format(delta, left).htmlSafe();
    }
  }),
});
