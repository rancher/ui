import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

function sanitize(input) {
  let config = input.serialize().config;

  let lc = config.launchConfig;
  if ( lc ) {
    delete lc.completeUpdate;
    delete lc.forceUpgrade;
    delete lc.version;

    if ( lc.logConfig && lc.logConfig.driver === '') {
      lc.logConfig.driver = null;
    }
  }

  if ( !config.lbConfig ) {
    config.lbConfig = {};
  }

  if ( !config.lbTargetConfig ) {
    config.lbTargetConfig = {};
  }

  if ( !config.metadata ) {
    config.metadata = {};
  }

  if ( !config.serviceLinks ) {
    config.serviceLinks = {};
  }

  if ( !config.secondaryLaunchConfigs ) {
    config.secondaryLaunchConfigs = [];
  }

  return config;
}

export default Component.extend(ModalBase, {
  layout,
  growl: service(),

  classNames: ['medium-modal'],

  name: null,
  error: null,
  loading: true,
  revisions: null,
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
    let model = this.get('modalService.modalOpts.originalModel').clone();
    this.set('model', model);

    model.followLink('revisions').then((revs) => {
      this.set('revisions', revs);
    }).catch((err) => {
      this.send('cancel');
      this.get('growl').fromError(err);
    }).finally(() => {
      this.set('loading', false);
    });
  },

  choices: function() {
    return (this.get('revisions')||[])
      .map((r) => {
        let time = moment(r.get('created'));

        return {
          label: r.get('id') + ': ' + time.format('YYYY-MM-DD HH:mm:ss') + ' (' + time.fromNow() + ')',
          value: r.get('id'),
          ts: r.get('createdTs'),
          disabled: (r.get('id') === this.get('model.revisionId')),
        };
      })
      .sortBy('ts')
      .reverse();
  }.property('revisions.[]'),

  current: function() {
    return this.get('revisions').findBy('id', this.get('model.revisionId'));
  }.property('model.revisionId','revisions.[]'),

  selected: function() {
    return this.get('revisions').findBy('id', this.get('revisionId'));
  }.property('revisionId','revisions.[]'),

  diff: function() {
    if ( this.get('current') && this.get('selected') ) {
      let left = sanitize(this.get('current'));
      let right = sanitize(this.get('selected'));
      var delta = jsondiffpatch.diff(left,right);
      jsondiffpatch.formatters.html.hideUnchanged();
      return jsondiffpatch.formatters.html.format(delta, left).htmlSafe();
    }
  }.property('current','selected'),
});
