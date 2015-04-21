export default {
  LOGGED_IN: 'isLoggedIn',
  ACCESS_WARNING: 'accessWarning',

  GITHUB: {
    URL: 'https://www.github.com/',
    API_URL: 'https://api.github.com/',
    PROXY_URL: '/github/',
  },

  SESSION: {
    TOKEN: 'jwt',
    USER_ID: 'user',
    ACCOUNT_ID: 'accountId',
    USER_TYPE: 'userType',
    PROJECT: 'projectId',
    PROJECT_DEFAULT: 'defaultProject',
  },

  HEADER: {
    AUTH: 'authorization',
    AUTH_TYPE: 'Bearer',

    PROJECT: 'x-api-project-id',
    PROJECT_USER_SCOPE: 'user',

    NO_CHALLENGE: 'x-api-no-challenge',
    NO_CHALLENGE_VALUE: 'true',

    ACCOUNT_ID: 'x-api-account-id',
  },

  USER: {
    TYPE_NORMAL: 'user',
    TYPE_ADMIN: 'admin',
  },

  PROJECT: {
    TYPE_RANCHER: 'rancher_id',
    TYPE_USER:    'github_user',
    TYPE_TEAM:    'github_team',
    TYPE_ORG:     'github_org',
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
  }
};
