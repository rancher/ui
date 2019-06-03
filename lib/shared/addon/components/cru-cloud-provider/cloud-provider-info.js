const azure = {
  'subscriptionId': {
    'description': 'cloudProvider.azureCloudConfig.subscriptionId.description',
    'group':       'auth-config',
    'required':    true
  },
  'tenantId': {
    'description': 'cloudProvider.azureCloudConfig.tenantId.description',
    'group':       'auth-config',
    'required':    true
  },
  'aadClientId': {
    'description': 'cloudProvider.azureCloudConfig.aadClientId.description',
    'group':       'auth-config',
    'required':    true
  },
  'aadClientSecret': {
    'description': 'cloudProvider.azureCloudConfig.aadClientSecret.description',
    'group':       'auth-config',
    'required':    true,
    'type':        'password'
  },
  'cloudProviderBackoff': {
    'description': 'cloudProvider.azureCloudConfig.cloudProviderBackoff.description',
    'group':       'cluster-config'
  },
  'cloudProviderBackoffDuration': {
    'description': 'cloudProvider.azureCloudConfig.cloudProviderBackoffDuration.description',
    'group':       'cluster-config'
  },
  'cloudProviderBackoffExponent': {
    'description': 'cloudProvider.azureCloudConfig.cloudProviderBackoffExponent.description',
    'group':       'cluster-config'
  },
  'cloudProviderBackoffJitter': {
    'description': 'cloudProvider.azureCloudConfig.cloudProviderBackoffJitter.description',
    'group':       'cluster-config'
  },
  'cloudProviderBackoffRetries': {
    'description': 'cloudProvider.azureCloudConfig.cloudProviderBackoffRetries.description',
    'group':       'cluster-config'
  },
  'cloudProviderRateLimit': {
    'description': 'cloudProvider.azureCloudConfig.cloudProviderRateLimit.description',
    'group':       'cluster-config'
  },
  'cloudProviderRateLimitBucket': {
    'description': 'cloudProvider.azureCloudConfig.cloudProviderRateLimitBucket.description',
    'group':       'cluster-config'
  },
  'cloudProviderRateLimitQPS': {
    'description': 'cloudProvider.azureCloudConfig.cloudProviderRateLimitQPS.description',
    'group':       'cluster-config'
  },
  'maximumLoadBalancerRuleCount': {
    'description': 'cloudProvider.azureCloudConfig.maximumLoadBalancerRuleCount.description',
    'group':       'cluster-config'
  },
  'useInstanceMetadata': {
    'description': 'cloudProvider.azureCloudConfig.useInstanceMetadata.description',
    'group':       'cloud-config'
  },
  'useManagedIdentityExtension': {
    'description': 'cloudProvider.azureCloudConfig.useManagedIdentityExtension.description',
    'group':       'auth-config'
  },
  'aadClientCertPassword': {
    'description': 'cloudProvider.azureCloudConfig.aadClientCertPassword.description',
    'group':       'auth-config'
  },
  'aadClientCertPath': {
    'description': 'cloudProvider.azureCloudConfig.aadClientCertPath.description',
    'group':       'auth-config'
  },
  'cloud': {
    'description': 'cloudProvider.azureCloudConfig.cloud.description',
    'group':       'auth-config'
  },
  'location': {
    'description': 'cloudProvider.azureCloudConfig.location.description',
    'group':       'cluster-config'
  },
  'primaryAvailabilitySetName': {
    'description': 'cloudProvider.azureCloudConfig.primaryAvailabilitySetName.description',
    'group':       'cluster-config'
  },
  'primaryScaleSetName': {
    'description': 'cloudProvider.azureCloudConfig.primaryScaleSetName.description',
    'group':       'cluster-config'
  },
  'resourceGroup': {
    'description': 'cloudProvider.azureCloudConfig.resourceGroup.description',
    'group':       'cluster-config'
  },
  'routeTableName': {
    'description': 'cloudProvider.azureCloudConfig.routeTableName.description',
    'group':       'cluster-config'
  },
  'securityGroupName': {
    'description': 'cloudProvider.azureCloudConfig.securityGroupName.description',
    'group':       'cluster-config'
  },
  'subnetName': {
    'description': 'cloudProvider.azureCloudConfig.subnetName.description',
    'group':       'cluster-config'
  },
  'vmType': {
    'description': 'cloudProvider.azureCloudConfig.vmType.description',
    'group':       'cluster-config'
  },
  'vnetName': {
    'description': 'cloudProvider.azureCloudConfig.vnetName.description',
    'group':       'cluster-config'
  },
  'vnetResourceGroup': {
    'description': 'cloudProvider.azureCloudConfig.vnetResourceGroup.description',
    'group':       'cluster-config'
  },
  'loadBalancerSku': {
    'description': 'cloudProvider.azureCloudConfig.loadBalancerSku.description',
    'group':       'cluster-config'
  }
};

export { azure };
