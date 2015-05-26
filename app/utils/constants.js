export default {
  SESSION: {
    LOGGED_IN: 'isLoggedIn',
    BACK_TO: 'backTo',
    TOKEN: 'jwt',
    USER_ID: 'user',
    ACCOUNT_ID: 'accountId',
    USER_TYPE: 'userType',
    PROJECT: 'projectId',
    GITHUB_CACHE: 'githubCache',
    GITHUB_ORGS: 'orgs',
    GITHUB_TEAMS: 'teams',
  },

  PREFS: {
    ACCESS_WARNING: 'accessWarning',
    PROJECT_DEFAULT: 'defaultProjectId',
  },

  TOKEN_TO_SESSION_KEYS: ['accountId', 'defaultProject','jwt','orgs','teams','user','userType'],

  HEADER: {
    AUTH: 'authorization',
    AUTH_TYPE: 'Bearer',
    AUTH_FAKE_USER: 'x-api-bearer',

    PROJECT: 'x-api-project-id',

    NO_CHALLENGE: 'x-api-no-challenge',
    NO_CHALLENGE_VALUE: 'true',

    ACCOUNT_ID: 'x-api-account-id',
  },

  USER: {
    TYPE_NORMAL: 'user',
    TYPE_ADMIN: 'admin',
  },

  GITHUB: {
    URL: 'https://www.github.com/',
    DEFAULT_HOSTNAME: 'github.com',
    AUTH_PATH: '/login/oauth/authorize',
    PROXY_URL: '/github/',
    SCOPE: 'read:org',
  },

  PROJECT: {
    TYPE_RANCHER: 'rancher_id',
    TYPE_USER:    'github_user',
    TYPE_TEAM:    'github_team',
    TYPE_ORG:     'github_org',
    ROLE_MEMBER:  'member',
    ROLE_OWNER:   'owner',
    FROM_GITHUB: {
      'user': 'github_user',
      'team': 'github_team',
      'org': 'github_org',
    },
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
    SERVICE_NAME: 'io.rancher.service.name',
  },
};
