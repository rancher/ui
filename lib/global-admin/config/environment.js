/* eslint-env node */
'use strict';

var mode = process.env.UI_MODE || 'oss'; // 'caas' or 'oss'

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'global-admin',
    environment: environment,
    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      appName: 'Rancher',
      mode: mode,
      environment: environment,
      apiServer: 'http://localhost:8080',
      legacyApiEndpoint: '/v2',
      apiEndpoint: '/v3',
      catalogServer: '',
      catalogEndpoint: '/v1-catalog',
      authServer: '',
      authEndpoint: '/v1-auth',
      telemetryEndpoint: '/v1-telemetry',
      webhookEndpoint: '/v1-webhooks',
      clusterToken: '%CLUSTERID%',
      projectToken: '%PROJECTID%',
      magicEndpoint: '/r',
      kubernetesBase: '/k8s',
      kubectlEndpoint: '/r/projects/%PROJECTID%/kubectld:8091/v1-kubectl',
      kubernetesDashboard: '/k8s/clusters/%CLUSTERID%/api/v1/namespaces/kube-system/services/kubernetes-dashboard/proxy/',
      projectEndpoint: '/v3/projects/%PROJECTID%',
      proxyEndpoint: '/v3/proxy',
      wsEndpoint: '/v3/projects/%PROJECTID%/subscribe' +
                    '?eventNames=resource.change' +
                    '&resourceType_ne=auditLog' +
                    '&resourceType_ne=serviceLog' +
                    '&resourceType_ne=deploymentUnit',
      baseAssets: '/',
      stripe: {
        publishableKey: 'pk_test_g925RcuVORh2KgHWfFbE80by'
      },
    },
  };

  return ENV;
};
