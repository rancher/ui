const KIND_USER = 'user'; const KIND_CATALOG = 'catalog';
const KIND_SYSTEM = 'system';
const KIND_SYSTEM_CATALOG = 'system-catalog';
const KIND_LEGACY_KUBERNETES = 'kubernetes';
const KIND_KUBERNETES = 'k8s';
const KIND_INFRA = 'infra';
const KIND_NOT_ORCHESTRATION = 'cattle';

var C = {
  CATALOG: {
    LIBRARY_KEY:           'library',
    LIBRARY_VALUE:         'https://git.rancher.io/charts',
    SYSTEM_LIBRARY_KEY:    'system-library',
    SYSTEM_LIBRARY_VALUE:  'https://git.rancher.io/system-charts',
    HELM_STABLE_KEY:       'helm',
    HELM_STABLE_VALUE:     'https://kubernetes-charts.storage.googleapis.com/',
    HELM_INCUBATOR_KEY:    'helm-incubator',
    HELM_INCUBATOR_VALUE:  'https://kubernetes-charts-incubator.storage.googleapis.com/',
    HELM_3_LIBRARY_KEY:    'helm3-library',
    HELM_3_LIBRARY_VALUE:  'https://git.rancher.io/helm3-charts',
    HELM_VERSION_2:        'rancher-helm',
    HELM_VERSION_3:        'helm_v3',
    HELM_VERSION_3_SHORT:  'v3',
    ALIBABA_APP_HUB_KEY:   'alibaba-app-hub',
    ALIBABA_APP_HUB_VALUE: 'https://apphub.aliyuncs.com',
    DEFAULT_BRANCH:        'master',
    LIBRARY_BRANCH:        'v2.0-development', // @TODO-2.0 '${RELEASE}',
    COMMUNITY_BRANCH:      'v2.0-development', // @TODO-2.0 '${RELEASE}',
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
    EULA:     'https://rancher.com/eula',
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
    CERTIFIED:                      'io.rancher.certified',
    CERTIFIED_PARTNER:              'partner',
    CERTIFIED_RANCHER:              'rancher',
    CERTIFIED_RANCHER_EXPERIMENTAL: 'experimental',

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
    EKS_SESSION_TOKEN: 'clusterstatus.management.cattle.io/temporary-security-credentials',

    // node driver special fields
    UI_HINTS: 'io.cattle.nodedriver/ui-field-hints',

    K3S_NODE_ARGS:        'k3s.io/node-args',
    K3S_NODE_CONFIG_HASH: 'k3s.io/node-config-hash',
    K3S_NODE_ENV:         'k3s.io/node-env',
    NODE_INSTANCE_TYPE:   'node.kubernetes.io/instance-type',
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
    CLUSTER_DEFAULT:        'default-cluster-id',
    CONTAINER_VIEW:         'container-view',
    COLLAPSED_CATALOGS:     'collapsed-catalogs',
    FEEDBACK:               'feedback',
    HOST_VIEW:              'host-view',
    I_HATE_SPINNERS:        'ihatespinners',
    LANGUAGE:               'language',
    LAST_IMAGE_PULL_POLICY: 'last-image-pull-policy',
    TARGET_OS:              'target-os',
    LAST_NAMESPACE:         'last-namespace',
    LAST_SCALE_MODE:        'last-scale-mode',
    PERIOD:                 'period',
    PROJECT_DEFAULT:        'default-project-id',
    PUSH_TO_REPO:           'push-to-repo',
    RECENT_CLUSTERS:        'recent-clusters',
    SORT_STACKS_BY:         'sort-stacks-by',
    TABLE_COUNT:            'table-count',
    THEME:                  'theme',
    WRAP_LINES:             'wrap-lines',
    LANDING:                'landing',
    SEEN_WHATS_NEW:         'seen-whats-new',
    CLOSED_BANNER:          'closed-banner',
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
    TYPE_OKTA_USER:              'okta_user',
    TYPE_OKTA_GROUP:             'okta_group',
    TYPE_FREEIPA_USER:           'freeipa_user',
    TYPE_FREEIPA_GROUP:          'freeipa_group',
    TYPE_GOOGLE_USER:            'googleoauth_user',
    TYPE_GOOGLE_GROUP:           'googleoauth_group',
    TYPE_GOOGLE_ORG:             'googleoauth_org',

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
      value: 'Equal',
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
    },
    {
      value: 'PreferNoSchedule',
      label: 'PreferNoSchedule'
    },
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
      value: '<',
      label: 'formScheduling.nodeSelector.operator.lt',
    },
    {
      value: '>',
      label: 'formScheduling.nodeSelector.operator.gt',
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
    ISTIO_ROUTE:     'istioSubRoute',
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
    IMAGE_RANCHER:                    'server-image',
    VERSION_RANCHER:                  'server-version',
    VERSION_COMPOSE:                  'compose-version',
    VERSION_CLI:                      'cli-version',
    VERSION_MACHINE:                  'machine-version',
    VERSION_HELM:                     'helm-version',
    VERSIONS_K8S:                     'k8s-version-to-images',
    VERSION_RKE_K8S_DEFAULT:          'k8s-version',
    VERSION_K8S_SUPPORTED_RANGE:      'ui-k8s-supported-versions-range',
    VERSION_SYSTEM_K8S_DEFAULT_RANGE: 'ui-k8s-default-version-range',

    CLI_URL:                          {
      DARWIN:                         'cli-url-darwin',
      WINDOWS:                        'cli-url-windows',
      LINUX:                          'cli-url-linux',
    },

    API_HOST:                         'api-host',
    CA_CERTS:                         'cacerts',
    // CLUSTER_DEFAULTS:              'cluster-defaults',
    ENGINE_URL:                       'engine-install-url',
    ENGINE_ISO_URL:                   'engine-iso-url',
    FIRST_LOGIN:                      'first-login',
    INGRESS_IP_DOMAIN:                'ingress-ip-domain',
    PL:                               'ui-pl',
    PL_RANCHER_VALUE:                 'rancher',
    UI_BANNERS:                       'ui-banners',
    UI_ISSUES:                        'ui-issues',
    SUPPORTED_DOCKER:                 'engine-supported-range',
    NEWEST_DOCKER:                    'engine-newest-version',
    SERVER_URL:                       'server-url',
    RKE_METADATA_CONFIG:              'rke-metadata-config',
    TELEMETRY:                        'telemetry-opt',
    EULA_AGREED:                      'eula-agreed',
    AUTH_USER_INFO_MAX_AGE_SECONDS:   'auth-user-info-max-age-seconds',
    AUTH_USER_SESSION_TTL_MINUTES:    'auth-user-session-ttl-minutes',
    AUTH_USER_INFO_RESYNC_CRON:       'auth-user-info-resync-cron',
    AUTH_LOCAL_VALIDATE_DESC:         'auth-password-requirements-description',
    FEEDBACK_FORM:                    'ui-feedback-form',
    CLUSTER_TEMPLATE_ENFORCEMENT:     'cluster-template-enforcement',
    UI_DEFAULT_LANDING:               'ui-default-landing',
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

  WHATS_NEW_VERSION: '2.5.0',
};

C.SETTING.ALLOWED = {
  [C.SETTING.CA_CERTS]:                       { kind: 'multiline' },
  // [C.SETTING.CLUSTER_DEFAULTS]:            { kind: 'json' },
  [C.SETTING.ENGINE_URL]:                     {},
  [C.SETTING.ENGINE_ISO_URL]:                 {},
  [C.SETTING.PL]:                             {},
  [C.SETTING.UI_ISSUES]:                      {},
  [C.SETTING.INGRESS_IP_DOMAIN]:              {},
  [C.SETTING.AUTH_USER_INFO_MAX_AGE_SECONDS]: {},
  [C.SETTING.AUTH_USER_SESSION_TTL_MINUTES]:  {},
  [C.SETTING.AUTH_USER_INFO_RESYNC_CRON]:     {},
  [C.SETTING.SERVER_URL]:                     { kind: 'url' },
  [C.SETTING.RKE_METADATA_CONFIG]:            { kind: 'json' },
  [C.SETTING.UI_BANNERS]:                     { kind: 'json' },
  'system-default-registry':                  {},
  'ui-index':                                 {},
  [C.SETTING.CLUSTER_TEMPLATE_ENFORCEMENT]:   { kind: 'boolean' },

  [C.SETTING.UI_DEFAULT_LANDING]: {
    kind:    'enum-map',
    options: {
      ember: 'Cluster Manager',
      vue:   'Cluster Explorer'
    },
  },
  [C.SETTING.TELEMETRY]: {
    kind:    'enum',
    options: ['prompt', 'in', 'out']
  },
};

C.LABELS_TO_IGNORE = [
  C.LABEL.HASH,
];

C.LABEL_ISTIO_RULE = 'io.rancher.istio';

C.READONLY_TAINT_PREFIX = [
  'node-role.kubernetes.io/',
  'node.kubernetes.io/',
  'node.cloudprovider.kubernetes.io/'
];

C.LABEL_PREFIX_TO_IGNORE = [
  'io.cattle.lifecycle.',
  'beta.kubernetes.io/',
  'failure-domain.beta.kubernetes.io/',
  'node-role.kubernetes.io/',
  'kubernetes.io/',
  'cattle.io/',
  'authz.management.cattle.io',
  'rke.cattle.io',
  'field.cattle.io',
  'workload.user.cattle.io/',
  'k3s.io',
  'node.kubernetes.io',
];

C.ANNOTATIONS_TO_IGNORE_CONTAINS = [
  'coreos.com/',
  'cattle.io/',
  'k3s.io',
]

C.ANNOTATIONS_TO_IGNORE_PREFIX = [
  'kubernetes.io/',
  'beta.kubernetes.io/',
  'node.alpha.kubernetes.io/',
  'volumes.kubernetes.io/',
  'k3s.io',
]

C.GRAY_OUT_ETCD_STATUS_PROVIDERS = [
  'k3s'
];

C.GRAY_OUT_SCHEDULER_STATUS_PROVIDERS = [
  'azureaks',
  'tencenttke'
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
  'locked',
  'reinitializing',
  'degraded',
  'unhealthy',
  'upgrading',
  'updating',
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
  'istiohost',
  'password',
  'pvc',
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
  'loadBalancerSku',
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
  WECHAT:    'Default Recipient',
}

C.CONDITION = {
  SUCCESS: 'Success',
  CHANGED: 'Changed',
  FAILED:  'Failed',
}

C.ALERTING_COMPARISON = {
  EQUAL:            'equal',
  NOT_EQUAL:        'not-equal',
  GREATER_THAN:     'greater-than',
  LESS_THAN:        'less-than',
  GREATER_OR_EQUAL: 'greater-or-equal',
  LESS_OR_EQUAL:    'less-or-equal',
  HAS_VALUE:        'has-value',
}

C.ALERT_DURATION = [{
  label: '1 second',
  value: '1s',
}, {
  label: '10 seconds',
  value: '10s',
}, {
  label: '30 seconds',
  value: '30s',
}, {
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
  label: '24 hours',
  value: '1d',
}]

C.LOGGING_TPYE_TO_CONFIG = {
  elasticsearch:  'elasticsearch',
  splunk_hec:     'splunk',
  remote_syslog:  'syslog',
  kafka_buffered: 'kafka',
  forward:        'fluentForwarder',
}

C.POSTGRESQL_SSL_MODE = [
  'disable',
  'allow',
  'prefer',
  'require',
  'verify-ca',
  'verify-full',
]

C.NETWORK_CONFIG_DEFAULTS = {
  FLANNEL:              'flannel',
  CANAL:                'canal',
  WEAVE:                'weave',
  VXLAN:                'vxlan',
  DEFAULT_BACKEND_TYPE: 'vxlan',
  BACKEND_PORT:         '4789',
  BACKEND_VNI:          '4096',
}

C.CLUSTER_TEMPLATE_ROLES = {
  OWNER:     'owner',
  READ_ONLY: 'read-only',
}

// these fields are filtered when launching a cluster with a template because they have UI components
C.CLUSTER_TEMPLATE_IGNORED_OVERRIDES = [
  'defaultPodSecurityPolicyTemplateId',
  'dockerRootDir',
  'enableNetworkPolicy',
  'windowsPreferedCluster',
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
  'rancherKubernetesEngineConfig.privateRegistries[0].url',
  'rancherKubernetesEngineConfig.privateRegistries[0].user',
  'rancherKubernetesEngineConfig.privateRegistries[0].password',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.enabled',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.intervalHours',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.retention',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.s3BackupConfig.accessKey',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.s3BackupConfig.bucketName',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.s3BackupConfig.endpoint',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.s3BackupConfig.region',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.s3BackupConfig.secretKey',
  'rancherKubernetesEngineConfig.services.etcd.backupConfig.s3BackupConfig.folder',
  'rancherKubernetesEngineConfig.services.kubeApi.podSecurityPolicy',
  'rancherKubernetesEngineConfig.services.kubeApi.serviceNodePortRange',
]

C.CAN_SHELL_STATES = [
  'running',
  'notready'
]

C.SYSTEM_CHART_APPS = [
  'cluster-monitoring',
  'project-monitoring',
  'cluster-alerting',
  'rancher-logging',
  'cluster-istio',
  'monitoring-operator',
]

C.RESOURCE_TYPES = {
  NAMESPACE: 'namespace',
  PROJECT:   'project',
  CLUSTER:   'cluster'
};

C.FEATURES = {
  UNSUPPORTED_STORAGE_DRIVERS: 'unsupported-storage-drivers',
  ISTIO_VIRTUAL_SERVICE_UI:    'istio-virtual-service-ui',
  DASHBOARD:                   'dashboard',
}

C.NODES = { MASTER_NODE: 'node-role.kubernetes.io/master' };

C.STORAGE = {
  LONGHORN_PROVISIONER_KEY:           'driver.longhorn.io',
  LONGHORN_CATALOG_TEMPLATE_ID:       'cattle-global-data:library-longhorn',
  LONGHORN_CATALOG_ITEM_DEFAULT_NAME: 'longhorn-system',
};

export default C;
