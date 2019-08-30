import Component from '@ember/component';
import layout from './template';
import { computed, set } from '@ember/object';
import { inject as service } from '@ember/service';
import C from 'shared/utils/constants';

const HEADERS = [
  {
    translationKey: 'clusterTemplateQuestions.table.question',
    name:           'question',
    sort:           ['question'],
    searchField:    'variable',
  },
  {
    translationKey: 'clusterTemplateQuestions.table.type',
    name:           'type',
    sort:           ['type'],
    width:          '150px',
  },
  {
    translationKey: 'clusterTemplateQuestions.table.answer',
    name:           'answer',
    sort:           ['answer'],
    searchField:    'default',
    width:          '250px',
  },
  {
    translationKey: 'clusterTemplateQuestions.table.required',
    name:           'required',
    width:          '70px',
  },
];

const clusterTemplateTranslationMap = [
  {
    key:            'defaultClusterRoleForProjectMembers',
    translationKey: 'clusterTemplateQuestions.schemaLabels.defaultClusterRoleForProjectMembers'
  },
  {
    key:            'defaultPodSecurityPolicyTemplateId',
    translationKey: 'clusterTemplateQuestions.schemaLabels.defaultPodSecurityPolicyTemplateId'
  },
  {
    key:            'desiredAgentImage',
    translationKey: 'clusterTemplateQuestions.schemaLabels.desiredAgentImage'
  },
  {
    key:            'desiredAuthImage',
    translationKey: 'clusterTemplateQuestions.schemaLabels.desiredAuthImage'
  },
  {
    key:            'dockerRootDir',
    translationKey: 'clusterTemplateQuestions.schemaLabels.dockerRootDir'
  },
  {
    key:            'enableClusterAlerting',
    translationKey: 'clusterTemplateQuestions.schemaLabels.enableClusterAlerting'
  },
  {
    key:            'enableClusterMonitoring',
    translationKey: 'clusterTemplateQuestions.schemaLabels.enableClusterMonitoring'
  },
  {
    key:            'enableNetworkPolicy',
    translationKey: 'clusterTemplateQuestions.schemaLabels.enableNetworkPolicy'
  },
  {
    key:            'localClusterAuthEndpoint',
    translationKey: 'clusterTemplateQuestions.schemaLabels.localClusterAuthEndpoint'
  },
  {
    key:            'caCerts',
    translationKey: 'clusterTemplateQuestions.schemaLabels.caCerts'
  },
  {
    key:            'fqdn',
    translationKey: 'clusterTemplateQuestions.schemaLabels.fqdn'
  },
  {
    key:            'addonJobTimeout',
    translationKey: 'clusterTemplateQuestions.schemaLabels.addonJobTimeout'
  },
  {
    key:            'addons',
    translationKey: 'clusterTemplateQuestions.schemaLabels.addons'
  },
  {
    key:            'addonsInclude',
    translationKey: 'clusterTemplateQuestions.schemaLabels.addonsInclude'
  },
  {
    key:            'authentication',
    translationKey: 'clusterTemplateQuestions.schemaLabels.authentication'
  },
  {
    key:            'authorization',
    translationKey: 'clusterTemplateQuestions.schemaLabels.authorization'
  },
  {
    key:            'bastionHost',
    translationKey: 'clusterTemplateQuestions.schemaLabels.bastionHost'
  },
  {
    key:            'cloudProvider',
    translationKey: 'clusterTemplateQuestions.schemaLabels.cloudProvider'
  },
  {
    key:            'clusterName',
    translationKey: 'clusterTemplateQuestions.schemaLabels.clusterName'
  },
  {
    key:            'dns',
    translationKey: 'clusterTemplateQuestions.schemaLabels.dns'
  },
  {
    key:            'ignoreDockerVersion',
    translationKey: 'clusterTemplateQuestions.schemaLabels.ignoreDockerVersion'
  },
  {
    key:            'ingress',
    translationKey: 'clusterTemplateQuestions.schemaLabels.ingress'
  },
  {
    key:            'kubernetesVersion',
    translationKey: 'clusterTemplateQuestions.schemaLabels.kubernetesVersion'
  },
  {
    key:            'monitoring',
    translationKey: 'clusterTemplateQuestions.schemaLabels.monitoring'
  },
  {
    key:            'network',
    translationKey: 'clusterTemplateQuestions.schemaLabels.network'
  },
  {
    key:            'prefixPath',
    translationKey: 'clusterTemplateQuestions.schemaLabels.prefixPath'
  },
  {
    key:            'privateRegistries',
    translationKey: 'clusterTemplateQuestions.schemaLabels.privateRegistries'
  },
  {
    key:            'restore',
    translationKey: 'clusterTemplateQuestions.schemaLabels.restore'
  },
  {
    key:            'rotateCertificates',
    translationKey: 'clusterTemplateQuestions.schemaLabels.rotateCertificates'
  },
  {
    key:            'services',
    translationKey: 'clusterTemplateQuestions.schemaLabels.services'
  },
  {
    key:            'sshAgentAuth',
    translationKey: 'clusterTemplateQuestions.schemaLabels.sshAgentAuth'
  },
  {
    key:            'sshCertPath',
    translationKey: 'clusterTemplateQuestions.schemaLabels.sshCertPath'
  },
  {
    key:            'sshKeyPath',
    translationKey: 'clusterTemplateQuestions.schemaLabels.sshKeyPath'
  }
];

const IGNORED_FIELDS = C.CLUSTER_TEMPLATE_IGNORED_OVERRIDES;

export default Component.extend({
  globalStore:          service(),
  intl:                 service(),
  layout,

  questionsHeaders:     HEADERS,
  ignoreFields:         IGNORED_FIELDS,
  translationMap:       clusterTemplateTranslationMap,
  sortBy:               'name',
  searchText:           '',
  applyClusterTemplate: false,
  allQuestions:         null,
  schemaQuestions:      null,
  descending:           false,
  bulkActions:          false,

  actions: {
    addQuestion() {
      this.addQuestion();
    },
  },

  filteredQuestions: computed('allQuestions.[]', function() {
    let {
      allQuestions = [],
      ignoreFields,
    } = this;

    allQuestions = ( allQuestions || []).slice();

    allQuestions.forEach((q) => {
      if (ignoreFields.includes(q.variable)) {
        set(q, 'isBuiltIn', true);
      }
    });

    return (allQuestions || []);
  }),

  rows: computed('filteredQuestions.[]', function() {
    const {
      filteredQuestions: allQuestions,
      applyClusterTemplate,
      clusterTemplateCreate,
      ignoreFields,
    } = this;

    return (allQuestions || []).filter((question) => {
      if (applyClusterTemplate) {
        // on apply we want to ignore all fields that have a UI componet and any UI only ovverrides like backupTarget that only have a UI componet and no property target on the cluster.
        return !ignoreFields.includes(question.variable) && !question.variable.includes('azureCloudProvider') && !question.variable.startsWith('uiOverride');
      } else {
        // hide question will only persist on the first time we create a RKE Template revision because the field is not on the question schema so we cant rely on this only
        if (question.hasOwnProperty('hideQuestion') && question.hideQuestion === false) {
          return true;
        } else if (!question.hasOwnProperty('hideQuestion')) {
          if (question.variable) {
            if (clusterTemplateCreate && question.variable.startsWith('uiOverride')) {
              return false;
            } else {
              return true
            }
          } else {
            // this is an empty override added from add override button
            return true;
          }
        }

        return false;
      }
    });
  }),

  addQuestion() {
    throw new Error('add question override is required');
  },

  removeQuestion() {
    throw new Error('remove question override is required');
  },

});
