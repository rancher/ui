import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

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

const INGORED_UI_ONLY_FIELDS = [
  'overrideBackupStrategy',
];

// these fields are filtered when launching a cluster with a template because they have UI components
const IGNORED_OVERRIDES = [
  'defaultPodSecurityPolicyTemplateId',
  'dockerRootDir',
  'enableNetworkPolicy',
  'localClusterAuthEndpoint.caCerts',
  'localClusterAuthEndpoint.enabled',
  'localClusterAuthEndpoint.fqdn',
  'rancherKubernetesEngineConfig.ignoreDockerVersion',
  'rancherKubernetesEngineConfig.ingress.provider',
  'rancherKubernetesEngineConfig.kubernetesVersion',
  'rancherKubernetesEngineConfig.monitoring.provider',
  'rancherKubernetesEngineConfig.network.options',
  'rancherKubernetesEngineConfig.network.options.flannel_backend_port',
  'rancherKubernetesEngineConfig.network.options.flannel_backend_type',
  'rancherKubernetesEngineConfig.network.options.flannel_backend_vni',
  'rancherKubernetesEngineConfig.network.plugin',
  'rancherKubernetesEngineConfig.network.weaveNetworkProvider',
  'rancherKubernetesEngineConfig.privateRegistries[]',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.enabled',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.intervalHours',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.retention',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.s3BackupConfig.accessKey',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.s3BackupConfig.bucketName',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.s3BackupConfig.endpoint',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.s3BackupConfig.region',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.s3BackupConfig.secretKey',
  'rancherKubernetesEngineConfig.services.kubeApi.podSecurityPolicy',
  'rancherKubernetesEngineConfig.services.kubeApi.serviceNodePortRange',
];

export default Component.extend({
  globalStore:          service(),
  intl:                 service(),
  layout,

  questionsHeaders:     HEADERS,
  ignoreFields:         IGNORED_OVERRIDES,
  ignoreUIOnlyFields:   INGORED_UI_ONLY_FIELDS,
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

  rows: computed('allQuestions.[]', function() {
    const {
      allQuestions,
      applyClusterTemplate,
      clusterTemplateCreate,
      ignoreFields,
      ignoreUIOnlyFields,
    } = this;

    const allFields = [...ignoreFields, ...ignoreUIOnlyFields];

    return (allQuestions || []).filter((question) => {
      if (applyClusterTemplate) {
        // on apply we want to ignore all fields that have a UI componet and any UI only ovverrides like backupTarget that only have a UI componet and no property target on the cluster.
        return !allFields.includes(question.variable) && !question.variable.includes('azureCloudProvider');
      } else {
        // hide question will only persist on the first time we create a cluster template revision because the field is not on the question schema so we cant rely on this only
        if (question.hasOwnProperty('hideQuestion') && question.hideQuestion === false) {
          return true;
        } else if (!question.hasOwnProperty('hideQuestion')) {
          if (clusterTemplateCreate && !ignoreUIOnlyFields.includes(question.variable)) {
            return true
          } else {
            return false;
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
