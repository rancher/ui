import Component from '@ember/component';
import layout from './template';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import ChildHook from 'shared/mixins/child-hook';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Errors from 'ui/utils/errors';
import { randomStr } from 'shared/utils/util';
import { reject } from 'rsvp';



export default Component.extend(ViewNewEdit, ChildHook, {
  globalStore:                service(),
  router:                     service(),

  layout,

  classNames:                 ['horizontal-form', 'container-fluid'],

  clusterTemplate:            null,
  clusterTemplateRevision:    null,
  clusterTemplateRevisionId:  null,
  errors:                     null,
  originalCluster:            null,
  memberErrors:               null,
  nodePoolErrors:             null,
  setDefaultTemplateRevision: false,
  mode:                       'new',

  model:                      alias('clusterTemplate'),
  cluster:                    alias('clusterTemplateRevision.clusterConfig'),

  init() {
    this._super(...arguments);

    set(this, 'originalCluster', get(this, 'clusterTemplateRevision.clusterConfig').clone());

    let { clusterTemplateRevision } = this;

    if (!clusterTemplateRevision.name) {
      set(clusterTemplateRevision, 'name', `revision-${ randomStr(8, 8, 'loweralpha') }`);
    }
  },

  actions: {
    addQuestion() {
      const { clusterTemplateRevision } = this;
      let question = this.globalStore.createRecord({ type: 'question' });

      set(question, 'type', 'string');

      if (clusterTemplateRevision.questions) {
        clusterTemplateRevision.questions.pushObject(question);
      } else {
        set(clusterTemplateRevision, 'questions', [question]);
      }
    },

    removeQuestion(question) {
      const { clusterTemplateRevision } = this;

      clusterTemplateRevision.questions.removeObject(question);
    },

    addAuthorizedPrincipal(member) {
      let { members = [] } = this.primaryResource;

      if (!members) {
        members = [];
      }

      if (member) {
        members.pushObject(this.globalStore.createRecord(member));
      } else {
        members.pushObject(this.globalStore.createRecord({ type: 'member' }));
      }

      set(this, 'primaryResource.members', members);
    },

    removeMember(member) {
      let { members } = this.primaryResource;

      members.removeObject(member);
    },

    cancel() {
      this.cancel();
    },
  },

  willSave() {
    set(this, 'clusterTemplateRevision.clusterTemplateId', '__TEMPID__');

    let revisionOkay = this.validateClusterTemplateRevision();

    if (revisionOkay) {
      return this._super(...arguments);
    } else {
      return false;
    }
  },


  doneSaving(neu) {
    if (neu) {
      const { clusterTemplateRevision } = this;

      set(clusterTemplateRevision, 'clusterTemplateId', neu.id);

      return this.clusterTemplateRevision.save().then((ctr) => {
        if (this.setDefaultTemplateRevision) {
          set(neu, 'defaultRevisionId', get(ctr, 'id'));

          return neu.save().then(() => {
            return this.send('cancel');
          }).catch((err) => {
            if (err) {
              let body = Errors.stringify(err);

              set(this, 'errors', [body]);
            } else {
              set(this, 'errors', null);
            }

            return false;
          });
        }

        return this.send('cancel');
      }).catch((err) => {
        return reject(err);
      });
    } else {
      return reject();
    }
  },

  validateClusterTemplateRevision() {
    // var model  = get(this, 'clusterTemplateRevision');
    // TODO - localclusterauth and rkeconfig get cleared in trimvalues
    // var errors = model.validationErrors();
    var errors = [];

    if ( errors.get('length') ) {
      set(this, 'errors', errors);

      return false;
    }

    set(this, 'errors', null);

    return true;
  },

});
