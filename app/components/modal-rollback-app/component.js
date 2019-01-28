import { get, set, computed } from '@ember/object';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import jsondiffpatch from 'jsondiffpatch';
import moment from 'moment';

const HIDDEN_FIELDS = ['digest'];

function sanitize(config) {
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

  loading:      true,
  forceUpgrade: false,
  revisions:    null,
  revisionId:   null,

  didReceiveAttrs() {
    let model = get(this, 'modalService.modalOpts.originalModel').clone();

    set(this, 'model', model);
    get(this, 'store').rawRequest({
      url:    get(model, 'links.revision'),
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
      const { forceUpgrade, revisionId } = this;

      get(this, 'model').doAction('rollback', {
        revisionId,
        forceUpgrade,
      })
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

  current: computed('choices.[]', function() {
    return get(this, 'choices.firstObject.data');
  }),

  selected: computed('revisionId', 'revisions.[]', function() {
    return get(this, 'revisions').findBy('name', get(this, 'revisionId'));
  }),

  diff: computed('current', 'selected', function() {
    if (get(this, 'current') && get(this, 'selected')) {
      let left = get(this, 'current.status');
      let right = get(this, 'selected.status');
      var delta = jsondiffpatch.diff(sanitize(left), sanitize(right));

      jsondiffpatch.formatters.html.hideUnchanged();

      return jsondiffpatch.formatters.html.format(delta, left).htmlSafe();
    }
  }),
});
