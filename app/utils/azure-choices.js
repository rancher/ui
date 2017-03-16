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
      "name": "japanwest",
      "displayName": "Japan West",
    },
    {
      "name": "japaneast",
      "displayName": "Japan East",
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
  'AzureUSGovernment': [
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
      "displayName": "US GovTexas",
    }
  ].sortBy('name')
};

export let sizes = [
  {
    value: 'Standard_A0'
  },
  {
    value: 'Standard_A1'
  },
  {
    value: 'Standard_A2'
  },
  {
    value: 'Standard_A3'
  },
  {
    value: 'Standard_A4'
  },
  {
    value: 'Standard_A5'
  },
  {
    value: 'Standard_A6'
  },
  {
    value: 'Standard_A7'
  },
  {
    value: 'Standard_A8'
  },
  {
    value: 'Standard_A9'
  },
  {
    value: 'Standard_A10'
  },
  {
    value: 'Standard_A11'
  },
  {
    value: 'Standard_D1'
  },
  {
    value: 'Standard_D2'
  },
  {
    value: 'Standard_D3'
  },
  {
    value: 'Standard_D4'
  },
  {
    value: 'Standard_D11'
  },
  {
    value: 'Standard_D12'
  },
  {
    value: 'Standard_D13'
  },
  {
    value: 'Standard_D14'
  },
  {
    value: 'Standard_D1_v2'
  },
  {
    value: 'Standard_D2_v2'
  },
  {
    value: 'Standard_D3_v2'
  },
  {
    value: 'Standard_D4_v2'
  },
  {
    value: 'Standard_D5_v2'
  },
  {
    value: 'Standard_D11_v2'
  },
  {
    value: 'Standard_D12_v2'
  },
  {
    value: 'Standard_D13_v2'
  },
  {
    value: 'Standard_D14_v2'
  },
  {
    value: 'Standard_DS1'
  },
  {
    value: 'Standard_DS2'
  },
  {
    value: 'Standard_DS3'
  },
  {
    value: 'Standard_DS12'
  },
  {
    value: 'Standard_DS13'
  },
  {
    value: 'Standard_DS14'
  },
  {
    value: 'Standard_G1'
  },
  {
    value: 'Standard_G2'
  },
  {
    value: 'Standard_G3'
  },
  {
    value: 'Standard_G4'
  },
  {
    value: 'Standard_G5'
  },
  {
    value: 'Standard_GS1'
  },
  {
    value: 'Standard_GS2'
  },
  {
    value: 'Standard_GS3'
  },
  {
    value: 'Standard_GS4'
  },
  {
    value: 'Standard_GS5'
  },
];

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
    value: 'AzureUSGovernment'
  }
];