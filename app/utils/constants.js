var C = {
  PREFS: {
    ACCESS_WARNING: 'accessWarning',
    PROJECT_DEFAULT: 'defaultProjectId',
    I_HATE_SPINNERS: 'iHateSpinners',
    EXPANDED_STACKS: 'expandedStacks',
    SORT_STACKS_BY: 'sortStacksBy',
  },

  COOKIE: {
    TOKEN: 'token',
  },

  SESSION: {
    BACK_TO: 'backTo',
    USER_ID: 'user',
    ACCOUNT_ID: 'accountId',
    USER_TYPE: 'userType',
    PROJECT: 'projectId',
    IDENTITY: 'userIdentity',
    IDENTITY_TYPE: 'userType',
    GITHUB_CACHE: 'githubCache',
    GITHUB_ORGS: 'orgs',
    GITHUB_TEAMS: 'teams',
  },

  HEADER: {
    PROJECT: 'x-api-project-id',
    NO_CHALLENGE: 'x-api-no-challenge',
    NO_CHALLENGE_VALUE: 'true',
    ACCOUNT_ID: 'x-api-account-id',
  },

  USER: {
    TYPE_NORMAL: 'user',
    TYPE_ADMIN: 'admin',
    BASIC_BEARER: 'x-api-bearer',
  },

  GITHUB: {
    DEFAULT_HOSTNAME: 'github.com',
    AUTH_PATH: '/login/oauth/authorize',
    PROXY_URL: '/github/',
    SCOPE: 'read:org',
  },

  PROJECT: {
    TYPE_RANCHER:     'rancher_id',
    TYPE_GITHUB_USER: 'github_user',
    TYPE_GITHUB_TEAM: 'github_team',
    TYPE_GITHUB_ORG:  'github_org',
    TYPE_LDAP_USER:   'ldap_user',
    TYPE_LDAP_GROUP:  'ldap_group',

    PERSON: 'person',
    TEAM: 'team',
    ORG:  'org',

    ROLE_MEMBER:  'member',
    ROLE_OWNER:   'owner',
  },

  SETTING: {
    API_HOST: 'api.host',
  },

  KEY: {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ESCAPE: 27,
    CR: 13,
    LF: 10,
  },

  LABEL: {
    SYSTEM_PREFIX: 'io.rancher.',
    AFFINITY_PREFIX: 'io.rancher.scheduler.affinity:',

    SERVICE_NAME: 'io.rancher.stack_service.name',
    PROJECT_NAME: 'io.rancher.stack.name',
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
  },

  EXTERNALID: {
    KIND_SEPARATOR: '://',
    GROUP_SEPARATOR: ':',
    KIND_ALL: 'all',
    KIND_USER: 'user',
    KIND_CATALOG: 'catalog',
    KIND_SYSTEM: 'system',
    KIND_KUBERNETES: 'kubernetes',
    CATALOG_DEFAULT_GROUP: 'library',
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

export default C;
