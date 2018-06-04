import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend({
  growl:  service(),
  intl:   service(),
  router: service(),

  tagName:    'TR',
  classNames: 'main-row',

  toggling:               false,
  row:                    null,
  sourceCodeCredentialId: null,

  pipeline: alias('model.pipelineConfig'),

  actions: {
    disable() {
      set(this, 'toggling', true);
      get(this, 'row.pipeline').send('delete')
    },

    enable() {
      set(this, 'toggling', true);
      const pipeline = get(this, 'store').createRecord({ type: 'pipeline',  });
      const sourceCodeCredentialId = get(this, 'row.sourceCodeCredentialId');

      if ( sourceCodeCredentialId ) {
        set(pipeline, 'sourceCodeCredentialId', sourceCodeCredentialId);
      }
      set(pipeline, 'repositoryUrl', get(this, 'row.url'));
      set(pipeline, 'triggerWebhookPr', false);
      set(pipeline, 'triggerWebhookPush', !!sourceCodeCredentialId);
      set(pipeline, 'triggerWebhookTag', false);

      pipeline.save().catch((err) => {
        get(this, 'growl').fromError(err.message);
      })
        .finally(() => {
          set(this, 'toggling', false);
        })
    },
  }
});
