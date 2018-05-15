export let regions = {
  'AzurePublicCloud': [
    {
      "name": "eastasia",
      "displayName": "East Asia",
    },
    {
      "name": "southeastasia",
      "displayName": "Southeast Asia",
    },
    {
      "name": "centralus",
      "displayName": "Central US",
    },
    {
      "name": "eastus",
      "displayName": "East US",
    },
    {
      "name": "eastus2",
      "displayName": "East US 2",
    },
    {
      "name": "westus",
      "displayName": "West US",
    },
    {
      "name": "northcentralus",
      "displayName": "North Central US",
    },
    {
      "name": "southcentralus",
      "displayName": "South Central US",
    },
    {
      "name": "northeurope",
      "displayName": "North Europe",
    },
    {
      "name": "westeurope",
      "displayName": "West Europe",
    },
    {
      "name": "ukwest",
      "displayName": "UK West",
    },
    {
      "name": "uksouth",
      "displayName": "UK South",
    },
    {
      "name": "francecentral",
      "displayName": "France Central",
    },
    {
      "name": "francesouth",
      "displayName": "France South",
    },
    {
      "name": "japanwest",
      "displayName": "Japan West",
    },
    {
      "name": "japaneast",
      "displayName": "Japan East",
    },
    {
      "name": "koreacentral",
      "displayName": "Korea Central",
    },
    {
      "name": "koreasouth",
      "displayName": "Korea South",
    },
    {
      "name": "brazilsouth",
      "displayName": "Brazil South",
    },
    {
      "name": "australiaeast",
      "displayName": "Australia East",
    },
    {
      "name": "australiasoutheast",
      "displayName": "Australia Southeast",
    },
    {
      "name": "australiacentral1",
      "displayName": "Australia Central 1",
    },
    {
      "name": "australiacentral2",
      "displayName": "Australia Central 2",
    },
    {
      "name": "southindia",
      "displayName": "South India",
    },
    {
      "name": "centralindia",
      "displayName": "Central India",
    },
    {
      "name": "westindia",
      "displayName": "West India",
    },
    {
      "name": "canadacentral",
      "displayName": "Canada Central",
    },
    {
      "name": "canadaeast",
      "displayName": "Canada East",
    },
    {
      "name": "southafricawest",
      "displayName": "South Africa West",
    },
    {
      "name": "southafricanorth",
      "displayName": "South Africa North",
    },
    {
      "name": "westcentralus",
      "displayName": "West Central US",
    },
    {
      "name": "westus2",
      "displayName": "West US 2",
    }
  ].sortBy('name'),
  'AzureGermanCloud': [
    {
      "name": "germanynortheast",
      "displayName": "Germany Northeast",
    },
    {
      "name": "germanycentral",
      "displayName": "Germany Central",
    }
  ].sortBy('name'),
  'AzureChinaCloud': [
    {
      "name": "chinanorth",
      "displayName": "China North",
    },
    {
      "name": "chinaeast",
      "displayName": "China East",
    }
  ].sortBy('name'),
  'AzureUSGovernmentCloud': [
    {
      "name": "usgovvirginia",
      "displayName": "US Gov Virginia",
    },
    {
      "name": "usgovlowa",
      "displayName": "US Gov lowa",
    },
    {
      "name": "usgovarizona",
      "displayName": "US Gov Arizona",
    },
    {
      "name": "usgovTexas",
      "displayName": "US Gov Texas",
    },
    {
      "name": "usdodeast",
      "displayName": "US DoD East",
    },
    {
      "name": "usdodcentral",
      "displayName": "US DoD Central",
    },
  ].sortBy('name')
};

export let storageTypes = [
  {
    name: 'Standard LRS',
    value: 'Standard_LRS',
  },
  {
    name: 'Standard ZRS',
    value: 'Standard_ZRS',
  },
  {
    name: 'Standard GRS',
    value: 'Standard_GRS',
  },
  {
    name: 'Standard RAGRS',
    value: 'Standard_RAGRS',
  },
  {
    name: 'Premium LRS',
    value: 'Premium_LRS',
  }
];

export let environments = [
  {
    value: 'AzurePublicCloud'
  },
  {
    value: 'AzureGermanCloud'
  },
  {
    value: 'AzureChinaCloud'
  },
  {
    value: 'AzureUSGovernmentCloud'
  }
];
