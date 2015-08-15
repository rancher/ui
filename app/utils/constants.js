var C = {
  PREFS: {
    ACCESS_WARNING: 'accessWarning',
    PROJECT_DEFAULT: 'defaultProjectId',
    I_HATE_SPINNERS: 'iHateSpinners',
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
    SERVICE_NAME: 'io.rancher.stack_service.name',
    PROJECT_NAME: 'io.rancher.stack.name',
    SCHED_GLOBAL: 'io.rancher.scheduler.global',
    SCHED_AFFINITY: 'io.rancher.scheduler.affinity:',
    SCHED_CONTAINER: 'io.rancher.scheduler.affinity:container',
    SCHED_HOST_LABEL: 'io.rancher.scheduler.affinity:host_label',
    SCHED_CONTAINER_LABEL: 'io.rancher.scheduler.affinity:container_label',
    HOSTNAME_OVERRIDE: 'io.rancher.container.hostname_override',
    HOSTNAME_OVERRIDE_VALUE: 'container_name',
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

export default C;
