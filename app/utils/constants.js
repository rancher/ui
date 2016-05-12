const KIND_USER = 'user';
const KIND_CATALOG = 'catalog';
const KIND_SYSTEM = 'system';
const KIND_SYSTEM_CATALOG = 'system-catalog';
const KIND_KUBERNETES = 'kubernetes';
const KIND_SWARM = 'swarm';
const KIND_MESOS = 'mesos';
const KIND_NOT_KUBERNETES = `not-${KIND_KUBERNETES}`;
const KIND_NOT_SWARM = `not-${KIND_SWARM}`;
const KIND_NOT_MESOS = `not-${KIND_MESOS}`;

var C = {
  COOKIE: {
    TOKEN: 'token',
    PL: 'PL',
    PL_RANCHER_VALUE: 'rancher',
    CSRF: 'CSRF',
  },

  EXTERNALID: {
    KIND_SEPARATOR: '://',
    GROUP_SEPARATOR: ':',
    KIND_ALL: 'all',
    KIND_USER: KIND_USER,
    KIND_CATALOG: KIND_CATALOG,
    KIND_SYSTEM: KIND_SYSTEM,
    KIND_SYSTEM_CATALOG: KIND_SYSTEM_CATALOG,
    KIND_KUBERNETES: KIND_KUBERNETES,
    KIND_SWARM: KIND_SWARM,
    KIND_NOT_KUBERNETES: KIND_NOT_KUBERNETES,
    KIND_NOT_SWARM: KIND_NOT_SWARM,
    KIND_NOT_MESOS: KIND_NOT_MESOS,
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
      KIND_NOT_KUBERNETES,
      KIND_NOT_SWARM,
      KIND_NOT_MESOS,
    ],
    SYSTEM_CATEGORIES: [
      'Rancher services'
    ],
    CATALOG_DEFAULT_GROUP: 'library',
  },

  CATALOG: {
    LIBRARY_KEY: 'library',
    LIBRARY_VALUE: 'https://github.com/rancher/rancher-catalog.git',
    COMMUNITY_KEY: 'community',
    COMMUNITY_VALUE: 'https://github.com/rancher/community-catalog.git',
  },

  GITHUB: {
    DEFAULT_HOSTNAME: 'github.com',
    AUTH_PATH: '/login/oauth/authorize',
    PROXY_URL: '/github/',
    SCOPE: 'read:org',
  },

  HEADER: {
    //PROJECT: 'x-api-project-id',
    NO_CHALLENGE: 'x-api-no-challenge',
    NO_CHALLENGE_VALUE: 'true',
    ACCOUNT_ID: 'x-api-account-id',
  },

  KEY: {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ESCAPE: 27,
    CR: 13,
    LF: 10,
    TAB: 9,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    HOME: 35,
    END: 36,
  },

  LABEL: {
    SYSTEM_PREFIX: 'io.rancher.',
    AFFINITY_PREFIX: 'io.rancher.scheduler.affinity:',

    SERVICE_NAME: 'io.rancher.stack_service.name',
    STACK_NAME: 'io.rancher.stack.name',
    SCHED_GLOBAL: 'io.rancher.scheduler.global',
    SCHED_CONTAINER: 'io.rancher.scheduler.affinity:container',
    SCHED_HOST_LABEL: 'io.rancher.scheduler.affinity:host_label',
    SCHED_CONTAINER_LABEL: 'io.rancher.scheduler.affinity:container_label',
    HOSTNAME_OVERRIDE: 'io.rancher.container.hostname_override',
    HOSTNAME_OVERRIDE_VALUE: 'container_name',
    BALANCER_SSL_PORTS: 'io.rancher.loadbalancer.ssl.ports',
    SIDEKICK: 'io.rancher.sidekicks',
    DEPLOYMENT_UNIT: 'io.rancher.service.deployment.unit',
    LAUNCH_CONFIG: 'io.rancher.service.launch.config',
    LAUNCH_CONFIG_PRIMARY: 'io.rancher.service.primary.launch.config',
    START_ONCE: 'io.rancher.container.start_once',
    HASH: 'io.rancher.service.hash',
    DNS: 'io.rancher.container.dns',
    DOCKER_VERSION: 'io.rancher.host.docker_version',
    KERNEL_VERSION: 'io.rancher.host.linux_kernel_version',
    REQUESTED_IP: 'io.rancher.container.requested_ip',
    PULL_IMAGE: 'io.rancher.container.pull_image',
    PULL_IMAGE_VALUE: 'always',
    KVM: 'io.rancher.host.kvm',
    K8S_POD_NAMESPACE: 'io.kubernetes.pod.namespace',
    K8S_POD_NAME: 'io.kubernetes.pod.name',
    K8S_KUBECTL: 'io.rancher.k8s.kubectld',
    K8S_API: 'io.rancher.k8s.api-server',
    SWARM_CLI: 'io.rancher.swarm.cli',
  },

  PREFS: {
    ACCESS_WARNING  : 'accessWarning',
    PROJECT_DEFAULT : 'defaultProjectId',
    EXPANDED_STACKS : 'expandedStacks',
    SORT_STACKS_BY  : 'sortStacksBy',
    THEME           : 'theme',
    LANGUAGE        : 'language'
  },

  LANGUAGE: {
    DEFAULT: 'en-us',
    FORMAT_RELATIVE_TIMEOUT: 1000,
  },

  THEME: {
    AUTO_UPDATE_TIMER : 1800000,
    START_HOUR        : 7,
    END_HOUR          : 18,
    DEFAULT           : 'ui-light',
  },

  PROJECT: {
    TYPE_RANCHER:         'rancher_id',
    TYPE_GITHUB_USER:     'github_user',
    TYPE_GITHUB_TEAM:     'github_team',
    TYPE_GITHUB_ORG:      'github_org',
    TYPE_LDAP_USER:       'ldap_user',
    TYPE_LDAP_GROUP:      'ldap_group',
    TYPE_OPENLDAP_USER:   'openldap_user',
    TYPE_OPENLDAP_GROUP:  'openldap_group',

    PERSON: 'person',
    TEAM: 'team',
    ORG:  'org',

    ROLE_MEMBER:  'member',
    ROLE_OWNER:   'owner',
  },

  // Ephemeral but same but across all browser tabs
  SESSION: {
    BACK_TO        : 'backTo',
    USER_ID        : 'user',
    ACCOUNT_ID     : 'accountId',
    USER_TYPE      : 'userType',
    PROJECT        : 'projectId',
    IDENTITY       : 'userIdentity',
    IDENTITY_TYPE  : 'userType',
    GITHUB_CACHE   : 'githubCache',
    GITHUB_ORGS    : 'orgs',
    GITHUB_TEAMS   : 'teams',
    LANGUAGE       : 'language',
    LOGIN_LANGUAGE : 'loginLanguage',
  },

  // Ephemeral and unique for each browser tab
  TABSESSION: {
    PROJECT: 'projectId',
    NAMESPACE: 'namespaceId',
  },

  SETTING: {
    // Dots in key names do not mix well with Ember, so use $ in their place.
    DOT_CHAR:         '$',
    VERSION_RANCHER:  'rancher$server$image',
    VERSION_COMPOSE:  'rancher$compose$version',
    VERSION_CATTLE:   'cattle$version',
    VERSION_MACHINE:  'docker$machine$version',
    VERSION_GMS:      'go$machine$service$version',
    COMPOSE_URL: {
      DARWIN:         'rancher$compose$darwin$url',
      WINDOWS:        'rancher$compose$windows$url',
      LINUX:          'rancher$compose$linux$url',
    },
    API_HOST:         'api$host',
    CATALOG_URL:      'catalog$url',
    SWARM_PORT:       'swarm$tls$port',
    ENGINE_URL:       'engine$install$url',
    MIN_DOCKER:       'ui$min$docker$version',
    HELP_VERSION:     'ui$help$version',
  },

  USER: {
    TYPE_NORMAL: 'user',
    TYPE_ADMIN: 'admin',
    BASIC_BEARER: 'x-api-bearer',
  },

  AUTH_TYPES: {
    AdminAuth: 'None',
    BasicAuth: 'API Key',
    HeaderAuth: 'HeaderAuth',
    RegistrationToken: 'Host Registration',
    TokenAccount: 'TokenAccount',
    TokenAuth: 'UI Session'
  },

  EXT_REFERENCES: {
    FORUM: 'https://forums.rancher.com',
    COMPANY: 'http://rancher.com',
    GITHUB: 'https://github.com/rancher/rancher',
    DOCS: 'http://docs.rancher.com/rancher',
  },

  K8S: {
    BASE: 'api',
    BASE_VERSION: 'api/v1',
    TYPE_PREFIX: 'k8s-',
    ID_SEPARATOR: '::'
  },

  MESOS: {
    HEALTH: 'health',
    FRAMEWORKS: 'frameworks',
    MASTER_SERVICE: 'mesos-master',
    MASTER_PORT: 5050,
  },
};

C.TOKEN_TO_SESSION_KEYS = [
  C.SESSION.ACCOUNT_ID,
  C.SESSION.USER_ID,
  C.SESSION.USER_TYPE,
  C.SESSION.GITHUB_TEAMS,
  C.SESSION.GITHUB_ORGS,
  C.SESSION.IDENTITY,
  C.SESSION.IDENTITY_TYPE
];

C.LABELS_TO_IGNORE = [
  C.LABEL.HASH,
];

C.SYSTEM_LABELS_WITH_CONTROL = [
  C.LABEL.SCHED_GLOBAL,
  C.LABEL.HOSTNAME_OVERRIDE,
  C.LABEL.DNS,
  C.LABEL.START_ONCE,
  C.LABEL.REQUESTED_IP,
  C.LABEL.PULL_IMAGE,
];

C.ACTIVEISH_STATES = [
  'running',
  'active',
  'updating-active',
  'updating-running',
  'healthy',
  'initializing',
  'reinitializing',
  'degraded',
  'unhealthy',
  'started-once',
];

C.REMOVEDISH_STATES = [
  'removed',
  'purging',
  'purged'
];

C.INITIALIZING_STATES = [
  'initializing',
  'reinitializing'
];

C.VM_CAPABLE_STORAGE_DRIVERS = [
  'convoy-gluster',
  'convoy-longhorn',
  'longhorn',
];

// This is populated by each app/components/schema/*
C.SUPPORTED_SCHEMA_INPUTS= [
  'boolean',
  'certificate',
  'date',
  'enum',
  'float',
  'int',
  'multiline',
  'password',
  'service',
  'string',
];


export default C;
