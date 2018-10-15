const KIND_USER = 'user'; const KIND_CATALOG = 'catalog';
const KIND_SYSTEM = 'system';
const KIND_SYSTEM_CATALOG = 'system-catalog';
const KIND_LEGACY_KUBERNETES = 'kubernetes';
const KIND_KUBERNETES = 'k8s';
const KIND_INFRA = 'infra';
const KIND_NOT_ORCHESTRATION = 'cattle';

var C = {
  CATALOG: {
    LIBRARY_KEY:          'library',
    LIBRARY_VALUE:        'https://git.rancher.io/charts',
    SYSTEM_LIBRARY_KEY:   'system-library',
    SYSTEM_LIBRARY_VALUE: 'https://git.rancher.io/system-charts',
    HELM_STABLE_KEY:      'helm',
    HELM_STABLE_VALUE:    'https://kubernetes-charts.storage.googleapis.com/',
    HELM_INCUBATOR_KEY:   'helm-incubator',
    HELM_INCUBATOR_VALUE: 'https://kubernetes-charts-incubator.storage.googleapis.com/',
    DEFAULT_BRANCH:       'master',
    LIBRARY_BRANCH:       'v2.0-development', // @TODO-2.0 '${RELEASE}',
    COMMUNITY_BRANCH:     'v2.0-development', // @TODO-2.0 '${RELEASE}',
  },

  COOKIE: {
    TOKEN:                    'token',
    CSRF:                     'CSRF',
    LANG:                     'LANG',
    USERNAME:                 'R_USERNAME',
    ACTIVEDIRECTORY_USERNAME: 'ACTIVEDIRECTORY_USERNAME'
  },

  EXTERNAL_ID: {
    KIND_SEPARATOR:         '://',
    GROUP_SEPARATOR:        ':',
    BASE_SEPARATOR:         '*',
    ID_SEPARATOR:           ':',
    KIND_ALL:               'containers',
    KIND_USER,
    KIND_CATALOG,
    KIND_SYSTEM,
    KIND_SYSTEM_CATALOG,
    KIND_LEGACY_KUBERNETES,
    KIND_KUBERNETES,
    KIND_INFRA,
    KIND_NOT_ORCHESTRATION,
    KIND_ORCHESTRATION:     [
      KIND_KUBERNETES,
    ],
    UPGRADEABLE: [
      KIND_CATALOG,
      KIND_SYSTEM_CATALOG
    ],
    SYSTEM_KINDS: [
      KIND_SYSTEM,
      KIND_SYSTEM_CATALOG,
    ],
    SHOW_AS_SYSTEM: [
      KIND_SYSTEM,
      KIND_INFRA,
      KIND_NOT_ORCHESTRATION,
    ],
    SYSTEM_CATEGORIES: [
      'Rancher services'
    ],
    CATALOG_DEFAULT_GROUP: 'library',
  },

  EXT_REFERENCES: {
    CN_FORUM: 'https://forums.cnrancher.com/',
    FORUM:    'https://forums.rancher.com',
    COMPANY:  'https://rancher.com',
    GITHUB:   'https://github.com/rancher/rancher',
    DOCS:     'https://rancher.com/docs/rancher',
    SLACK:    'https://slack.rancher.io',
  },

  HEADER: {
    ACCOUNT_ID:         'X-Api-Account-Id',
    ACTIONS:            'X-Api-Action-Links',
    ACTIONS_VALUE:      'actionLinks',
    CSRF:               'X-Api-Csrf',
    NO_CHALLENGE:       'X-Api-No-Challenge',
    NO_CHALLENGE_VALUE: 'true',
    PROJECT_ID:         'X-Api-Project-Id',
    RANCHER_VERSION:    'X-Rancher-Version',
  },

  KEY: {
    LEFT:      37,
    UP:        38,
    RIGHT:     39,
    DOWN:      40,
    ESCAPE:    27,
    CR:        13,
    LF:        10,
    TAB:       9,
    SPACE:     32,
    PAGE_UP:   33,
    PAGE_DOWN: 34,
    HOME:      35,
    END:       36,
  },

  LABEL: {
    SYSTEM_PREFIX: 'io.rancher.',

    // Container
    DNS:                     'io.rancher.container.dns',
    HOSTNAME_OVERRIDE:       'io.rancher.container.hostname_override',
    HOSTNAME_OVERRIDE_VALUE: 'container_name',
    PULL_IMAGE:              'io.rancher.container.pull_image',
    PULL_IMAGE_VALUE:        'always',
    REQUESTED_IP:            'io.rancher.container.requested_ip',
    SERVICE_NAME:            'io.rancher.stack_service.name',
    START_ONCE:              'io.rancher.container.start_once',
    STACK_NAME:              'io.rancher.stack.name',
    STACK_UUID:              'io.rancher.stack.uuid',
    SYSTEM_TYPE:             'io.rancher.container.system',
    PER_HOST_SUBNET:         'io.rancher.network.per_host_subnet.subnet',

    // Catalog
    CERTIFIED:               'io.rancher.certified',
    CERTIFIED_PARTNER:       'partner',
    CERTIFIED_RANCHER:       'rancher',

    // Host
    DOCKER_VERSION: 'io.rancher.host.docker_version',
    KERNEL_VERSION: 'io.rancher.host.linux_kernel_version',
    KVM:            'io.rancher.host.kvm',
    SCHED_IPS:      'io.rancher.scheduler.ips',
    REQUIRE_ANY:    'io.rancher.scheduler.require_any',

    // Kubernetes
    K8S_DASHBOARD:     'io.rancher.k8s.kubernetes-dashboard',
    K8S_KUBECTL:       'io.rancher.k8s.kubectld',
    K8S_TOKEN:         'io.rancher.k8s.token',
    K8S_POD_NAME:      'io.kubernetes.pod.name',
    K8S_POD_NAMESPACE: 'io.kubernetes.pod.namespace',

    // Scheduling
    AFFINITY_PREFIX:       'io.rancher.scheduler.affinity:',
    SCHED_CONTAINER:       'io.rancher.scheduler.affinity:container',
    SCHED_CONTAINER_LABEL: 'io.rancher.scheduler.affinity:container_label',
    SCHED_GLOBAL:          'io.rancher.scheduler.global',
    SCHED_HOST_LABEL:      'io.rancher.scheduler.affinity:host_label',

    // Service
    DEPLOYMENT_UNIT:       'io.rancher.service.deployment.unit',
    HASH:                  'io.rancher.service.hash',
    LAUNCH_CONFIG:         'io.rancher.service.launch.config',
    LAUNCH_CONFIG_PRIMARY: 'io.rancher.service.primary.launch.config',
    BALANCER_TARGET:       'io.rancher.lb_service.target',

    DEPLOYMENT_REVISION: 'deployment.kubernetes.io/revision',

    CREATOR_ID: 'field.cattle.io/creatorId',
    TIMESTAMP:  'cattle.io/timestamp',

    // EKS Cluster session token
    EKS_SESSION_TOKEN: 'clusterstatus.management.cattle.io/temporary-security-credentials'
  },

  LANGUAGE: {
    DEFAULT:                 'en-us',
    FORMAT_RELATIVE_TIMEOUT: 1000,
    DOCS:                    ['en'],
  },

  WEBSOCKET: { SUBSCRIBE_DISCONNECTED_TIMEOUT: 30000 },

  PREFS: {
    ACCESS_WARNING:         'access-warning',
    BODY_BACKGROUND:        'body-background',
    EXPANDED_STACKS:        'expanded-stacks',
    FEEDBACK:               'feedback',
    HOST_VIEW:              'host-view',
    CONTAINER_VIEW:         'container-view',
    I_HATE_SPINNERS:        'ihatespinners',
    LANGUAGE:               'language',
    PROJECT_DEFAULT:        'default-project-id',
    CLUSTER_DEFAULT:        'default-cluster-id',
    LAST_SCALE_MODE:        'last-scale-mode',
    LAST_IMAGE_PULL_POLICY: 'last-image-pull-policy',
    WRAP_LINES:             'wrap-lines',
    PERIOD:                 'period',
    LAST_NAMESPACE:         'last-namespace',
    SORT_STACKS_BY:         'sort-stacks-by',
    TABLE_COUNT:            'table-count',
    THEME:                  'theme',
    PUSH_TO_REPO:           'push-to-repo',
  },

  PROJECT: {
    TYPE_RANCHER:                'local',
    TYPE_ACTIVE_DIRECTORY_USER:  'activedirectory_user',
    TYPE_ACTIVE_DIRECTORY_GROUP: 'activedirectory_group',
    TYPE_AZURE_USER:             'azuread_user',
    TYPE_AZURE_GROUP:            'azuread_group',
    TYPE_GITHUB_USER:            'github_user',
    TYPE_GITHUB_TEAM:            'github_team',
    TYPE_GITHUB_ORG:             'github_org',
    TYPE_KEYCLOAK_USER:          'keycloak_user',
    TYPE_KEYCLOAK_GROUP:         'keycloak_group',
    TYPE_LDAP_USER:              'ldap_user',
    TYPE_LDAP_GROUP:             'ldap_group',
    TYPE_OPENLDAP_USER:          'openldap_user',
    TYPE_OPENLDAP_GROUP:         'openldap_group',
    TYPE_SHIBBOLETH_USER:        'shibboleth_user',
    TYPE_SHIBBOLETH_GROUP:       'shibboleth_group',
    TYPE_PING_USER:              'ping_user',
    TYPE_PING_GROUP:             'ping_group',
    TYPE_ADFS_USER:              'adfs_user',
    TYPE_ADFS_GROUP:             'adfs_group',
    TYPE_FREEIPA_USER:           'freeipa_user',
    TYPE_FREEIPA_GROUP:          'freeipa_group',

    PERSON: 'person',
    TEAM:   'team',
    ORG:    'org',

    ROLE_MEMBER:  'member',
    ROLE_OWNER:   'owner',

    SUPPORTS_NETWORK_POLICY: [
      'ipsec',
      'vxlan',
    ]
  },

  SCHED_TOLERATION_OPERATOR: [
    {
      value: 'Equals',
      label: 'Equals'
    },
    {
      value: 'Exists',
      label: 'Exists'
    }
  ],

  SCHED_TOLERATION_EFFECT: [
    {
      value: 'NoSchedule',
      label: 'NoSchedule'
    },
    {
      value: 'NoExecute',
      label: 'NoExecute'
    }
  ],

  VOLUME_NODE_SELECTOR_OPERATOR: [
    {
      value: 'Exists',
      label: 'formScheduling.nodeSelector.operator.exists',
    },
    {
      value: 'DoesNotExist',
      label: 'formScheduling.nodeSelector.operator.notExists',
    },
    {
      value: 'In',
      label: 'formScheduling.nodeSelector.operator.in',
    },
    {
      value: 'NotIn',
      label: 'formScheduling.nodeSelector.operator.notIn',
    },
  ],

  SCHED_NODE_SELECTOR_OPERATOR: [
    {
      value: '=',
      label: 'formScheduling.nodeSelector.operator.eq',
    },
    {
      value: '!=',
      label: 'formScheduling.nodeSelector.operator.ne',
    },
    {
      value: 'Exists',
      label: 'formScheduling.nodeSelector.operator.exists',
    },
    {
      value: 'DoesNotExist',
      label: 'formScheduling.nodeSelector.operator.notExists',
    },
    {
      value: 'In',
      label: 'formScheduling.nodeSelector.operator.in',
    },
    {
      value: 'NotIn',
      label: 'formScheduling.nodeSelector.operator.notIn',
    },
    {
      value: '<=',
      label: 'formScheduling.nodeSelector.operator.le',
    },
    {
      value: '<',
      label: 'formScheduling.nodeSelector.operator.lt',
    },
    {
      value: '>',
      label: 'formScheduling.nodeSelector.operator.gt',
    },
    {
      value: '>=',
      label: 'formScheduling.nodeSelector.operator.ge',
    },
  ],

  PROJECT_TEMPLATE: { DEFAULT: 'cattle', },

  RULE_VERBS: [
    'create',
    'delete',
    // 'deletecollection',
    'get',
    'list',
    'patch',
    'update',
    'watch',
  ],

  BASIC_POD_SECURITY_POLICIES: [
    'allowPrivilegeEscalation',
    'defaultAllowPrivilegeEscalation',
    'hostIPC',
    'hostNetwork',
    'hostPID',
    'privileged',
    'readOnlyRootFilesystem'
  ],

  VOLUME_POLICIES: [
    'azureFile',
    'azureDisk',
    'flocker',
    'flexVolume',
    'hostPath',
    'emptyDir',
    'gcePersistentDisk',
    'awsElasticBlockStore',
    'gitRepo',
    'secret',
    'nfs',
    'iscsi',
    'glusterfs',
    'persistentVolumeClaim',
    'rbd',
    'cinder',
    'cephFS',
    'downwardAPI',
    'fc',
    'configMap',
    'vsphereVolume',
    'quobyte',
    'photonPersistentDisk',
    'projected',
    'portworxVolume',
    'scaleIO',
    'storageos',
    '*',
  ],

  BASIC_ROLE_TEMPLATE_ROLES: [
    'cluster-owner',
    'cluster-member',
    'project-owner',
    'project-member'
  ],

  ROLE_RULES: [
    'Apps',
    'AuthConfigs',
    'Catalogs',
    'ClusterAlerts',
    'ClusterComposeConfigs',
    'ClusterEvents',
    'ClusterLoggings',
    'ClusterPipelines',
    'ClusterRegistrationTokens',
    'ClusterRoleTemplateBindings',
    'CertificateSigningRequests',
    'ClusterRoleBindings',
    'ClusterRoles',
    'Clusters',
    'ComponentStatuses',
    'ConfigMaps',
    'ControllerRevisions',
    'CronJobs',
    'DaemonSets',
    'Deployments',
    'Endpoints',
    'Events',
    'GlobalComposeConfigs',
    'GlobalRoleBindings',
    'GlobalRoles',
    'GroupMembers',
    'Groups',
    'HorizontalPodAutoscalers',
    'Ingresses',
    'Jobs',
    'LimitRanges',
    'ListenConfigs',
    'Namespaces',
    'NetworkPolicies',
    'NodeDrivers',
    'NodePools',
    'NodeTemplates',
    'Nodes',
    'Notifiers',
    'PersistentVolumeClaims',
    'PersistentVolumes',
    'PodDisruptionBudgets',
    'PodPreset',
    'PodSecurityPolicies',
    'PodTemplates',
    'Pods',
    'PipelineExecutionLogs',
    'PipelineExecutions',
    'Pipelines',
    'PodSecurityPolicyTemplateProjectBindings',
    'PodSecurityPolicyTemplates',
    'Preferences',
    'Principals',
    'ProjectAlerts',
    'ProjectLoggings',
    'ProjectNetworkPolicies',
    'ProjectRoleTemplateBindings',
    'Projects',
    'ReplicaSets',
    'ReplicationControllers',
    'ResourceQuotas',
    'RoleBindings',
    'Roles',
    'RoleTemplates',
    'Secrets',
    'ServiceAccounts',
    'Services',
    'StatefulSets',
    'StorageClasses',
    'Settings',
    'SourceCodeCredentials',
    'SourceCodeRepositories',
    'TemplateVersions',
    'Templates',
    'Tokens',
    'Users',
  ],

  // Ephemeral but same but across all browser tabs
  SESSION: {
    // @TODO-2.0 remove most of these
    BACK_TO:         'backTo',
    CONTAINER_ROUTE: 'containerSubRoute',
    PROJECT_ROUTE:   'projectRoute',
    CLUSTER_ROUTE:   'clusterRoute',
    GITHUB_CACHE:    'githubCache',
    GITHUB_ORGS:     'orgs',
    GITHUB_TEAMS:    'teams',
    IDENTITY:        'userIdentity',
    IDENTITY_TYPE:   'userType',
    LANGUAGE:        'language',
    LOGIN_LANGUAGE:  'loginLanguage',
    USER_ID:         'user',
    USER_TYPE:       'userType',

    DESCRIPTION: 'UI Session',
    TTL:         16 * 60 * 60 * 1000,
  },

  SETTING: {
    IMAGE_RANCHER:             'server-image',
    VERSION_RANCHER:           'server-version',
    VERSION_COMPOSE:           'compose-version',
    VERSION_CLI:               'cli-version',
    VERSION_MACHINE:           'machine-version',
    VERSION_HELM:              'helm-version',
    VERSIONS_K8S:              'k8s-version-to-images',
    VERSION_K8S_DEFAULT:       'k8s-version',

    CLI_URL:                   {
      DARWIN:                  'cli-url-darwin',
      WINDOWS:                 'cli-url-windows',
      LINUX:                   'cli-url-linux',
    },

    API_HOST:                  'api-host',
    CA_CERTS:                  'cacerts',
    // CLUSTER_DEFAULTS:          'cluster-defaults',
    ENGINE_URL:                'engine-install-url',
    ENGINE_ISO_URL:            'engine-iso-url',
    FIRST_LOGIN:               'first-login',
    INGRESS_IP_DOMAIN:         'ingress-ip-domain',
    PL:                        'ui-pl',
    PL_RANCHER_VALUE:          'rancher',
    SUPPORTED_DOCKER:          'engine-supported-range',
    NEWEST_DOCKER:             'engine-newest-version',
    SERVER_URL:                'server-url',
    TELEMETRY:                 'telemetry-opt',

    AUTH_LOCAL_VALIDATE_DESC:  'auth-password-requirements-description',
    FEEDBACK_FORM:             'ui-feedback-form',
  },

  TABLES: { DEFAULT_COUNT: 50 },

  THEME: {
    AUTO_UPDATE_TIMER: 30 * 60 * 1000,
    START_HOUR:        7,
    END_HOUR:          18,
    DEFAULT:           'ui-light',
  },

  USER: {
    TYPE_NORMAL:  'user',
    TYPE_ADMIN:   'admin',
    BASIC_BEARER: 'x-api-bearer',
  },
};

C.SETTING.ALLOWED = {
  [C.SETTING.CA_CERTS]:          { kind: 'multiline' },
  // [C.SETTING.CLUSTER_DEFAULTS]:  { kind: 'json' },
  [C.SETTING.ENGINE_URL]:        {},
  [C.SETTING.ENGINE_ISO_URL]:    {},
  [C.SETTING.PL]:                {},
  [C.SETTING.INGRESS_IP_DOMAIN]: {},
  [C.SETTING.SERVER_URL]:        { kind: 'url' },
  'system-default-registry':     {},
  [C.SETTING.TELEMETRY]:         {
    kind:                        'enum',
    options:                     ['prompt', 'in', 'out']
  },
  'ui-index':                    {},
};

C.LABELS_TO_IGNORE = [
  C.LABEL.HASH,
];

C.LABEL_PREFIX_TO_IGNORE = [
  'io.cattle.lifecycle.',
  'beta.kubernetes.io/',
  'node-role.kubernetes.io/',
  'kubernetes.io/',
  'cattle.io/'
];

C.SYSTEM_LABELS_WITH_CONTROL = [
  C.LABEL.SCHED_GLOBAL,
  C.LABEL.HOSTNAME_OVERRIDE,
  C.LABEL.DNS,
  C.LABEL.START_ONCE,
  C.LABEL.REQUESTED_IP,
  C.LABEL.PULL_IMAGE,
  C.LABEL.REQUIRE_ANY,
  C.LABEL.SCHED_IPS,
  C.LABEL.DOCKER_VERSION,
  C.LABEL.KERNEL_VERSION,
  C.LABEL.KVM,
];

C.ACTIVEISH_STATES = [
  'running',
  'active',
  'healthy',
  'initializing',
  'reinitializing',
  'degraded',
  'unhealthy',
  'upgrading',
  'upgraded',
  'draining',
  'drained',
  'cordoned'
];

C.READY_STATES = [
  'healthy',
];

C.REMOVEDISH_STATES = [
  'removed',
  // 'removing',
  'purging',
  'purged'
];

C.DISCONNECTED_STATES = [
  'disconnected',
  'reconnecting',
  'unavailable',
];

C.INITIALIZING_STATES = [
  'initializing',
  'reinitializing'
];

// This is populated by each app/components/schema/*
C.SUPPORTED_SCHEMA_INPUTS = [
  'boolean',
  'certificate',
  'date',
  'enum',
  'float',
  'host',
  'hostname',
  'int',
  'multiline',
  'password',
  'service',
  'storageclass',
  'string',
  'masked',
  'secret',
  'base64',
];

C.RESOURCE_QUOTAS = [
  'limitsCpu',
  'requestsCpu',
  'limitsMemory',
  'requestsMemory',
  'requestsStorage',
  'servicesLoadBalancers',
  'servicesNodePorts',
  'pods',
  'services',
  'configMaps',
  'persistentVolumeClaims',
  'replicationControllers',
  'secrets',
];

C.AZURE_AD = {
  STANDARD: {
    KEY:            'standard',
    ENDPOINT:       'https://login.microsoftonline.com/',
    GRAPH_ENDPOINT: 'https://graph.windows.net/'
  },
  CHINA: {
    KEY:            'china',
    ENDPOINT:       'https://login.chinacloudapi.cn/',
    GRAPH_ENDPOINT: 'https://graph.chinacloudapi.cn/'
  },
  CUSTOM: { KEY: 'custom' }
};

C.AZURE_DEFAULTS = [
  'aadClientCertPassword',
  'aadClientCertPath',
  'aadClientId',
  'aadClientSecret',
  'cloud',
  'cloudProviderBackoff',
  'cloudProviderBackoffDuration',
  'cloudProviderBackoffExponent',
  'cloudProviderBackoffJitter',
  'cloudProviderBackoffRetries',
  'cloudProviderRateLimit',
  'cloudProviderRateLimitBucket',
  'cloudProviderRateLimitQPS',
  'location',
  'maximumLoadBalancerRuleCount',
  'primaryAvailabilitySetName',
  'primaryScaleSetName',
  'resourceGroup',
  'routeTableName',
  'securityGroupName',
  'subnetName',
  'subscriptionId',
  'tenantId',
  'useInstanceMetadata',
  'useManagedIdentityExtension',
  'vmType',
  'vnetName',
  'vnetResourceGroup',
];

C.VOLUME_TYPES = {
  BIND_MOUNT:      'bindMount',
  TMPFS:           'tmpfs',
  SECRET:          'secret',
  CERTIFICATE:     'certificate',
  CONFIG_MAP:      'configmap',
  CUSTOM_LOG_PATH: 'customLogPath'
}

C.NOTIFIER_TABLE_LABEL = {
  SLACK:     'Default Channel',
  PAGERDUTY: 'Service Key',
  SMTP:      'Default Recipient Address',
  WEBHOOK:   'URL',
  DEFAULT:   'Notifier',
}

C.EXPERIMENTAL_VERSIONS = { RKE_K8S: 'v1.12.0-rancher1-1' }

C.CONDITION = {
  SUCCESS: 'Success',
  CHANGED: 'Changed',
  FAILED:  'Failed',
}

C.ALERTING_COMPARISON = [
  'equal',
  'not-equal',
  'greater-than',
  'less-than',
  'greater-or-equal',
  'less-or-equal',
]

C.ALERT_DURATION = [{
  label: '1 minute',
  value: '1m',
}, {
  label: '2 minutes',
  value: '2m',
}, {
  label: '3 minutes',
  value: '3m',
}, {
  label: '4 minutes',
  value: '4m',
}, {
  label: '5 minutes',
  value: '5m',
}, {
  label: '10 minutes',
  value: '10m',
}, {
  label: '15 minutes',
  value: '15m',
}, {
  label: '20 minutes',
  value: '20m',
}, {
  label: '30 minutes',
  value: '30m',
}, {
  label: '1 hour',
  value: '1h',
}, {
  label: '2 hours',
  value: '2h',
}, {
  label: '3 hours',
  value: '3h',
}, {
  label: '6 hours',
  value: '6h',
}, {
  label: '7 hours',
  value: '7h',
}, {
  label: '12 hours',
  value: '12h',
}, {
  label: '13 hours',
  value: '13h',
}, {
  label: '23 hours 30 minutes',
  value: '1d',
}]

export default C;
