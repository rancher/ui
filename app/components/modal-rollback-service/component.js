import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  growl: Ember.inject.service(),

  classNames: ['medium-modal'],

  name: null,
  error: null,
  loading: true,
  choices: null,
  revisionId: null,

  actions: {
    save(cb) {
      this.set('error', null);
      this.get('model').doAction('rollback', {
        revisionId: this.get('revisionId'),
      }).then(() => {
        this.send('cancel');
      }).catch((err) => {
        this.set('error', err);
      }).finally(() => {
        cb();
      });
    },
  },

  didReceiveAttrs() {
    this.set('model', this.get('modalService.modalOpts.originalModel').clone());
    this.get('model').followLink('revisions').then((revs) => {
      let choices = revs.map((x) => {
        let time = moment(x.get('created'));
        return {
          label: x.get('id') + ': ' + time.format('YYYY-MM-DD HH:mm:ss') + ' (' + time.fromNow() + ')',
          value: x.get('id'),
          ts: x.get('createdTs'),
        };
      }).sortBy('ts').reverse();

      this.set('choices',choices);
    }).catch((err) => {
      this.send('cancel');
      this.get('growl').fromError(err);
    }).finally(() => {
      this.set('loading', false);
    });
  },
});
