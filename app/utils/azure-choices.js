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
      "displayName": "US GovTexas",
    }
  ].sortBy('name')
};

export let sizes = [
  {
    group: 'Basic',
    value: 'Basic_A0'
  },
  {
    group: 'Basic',
    value: 'Basic_A1'
  },
  {
    group: 'Basic',
    value: 'Basic_A2'
  },
  {
    group: 'Basic',
    value: 'Basic_A3'
  },
  {
    group: 'Basic',
    value: 'Basic_A4'
  },
  {
    group: 'Standard',
    value: 'Standard_A0'
  },
  {
    group: 'Standard',
    value: 'Standard_A1'
  },
  {
    group: 'Standard',
    value: 'Standard_A2'
  },
  {
    group: 'Standard',
    value: 'Standard_A3'
  },
  {
    group: 'Standard',
    value: 'Standard_A4'
  },
  {
    group: 'Standard',
    value: 'Standard_A5'
  },
  {
    group: 'Standard',
    value: 'Standard_A6'
  },
  {
    group: 'Standard',
    value: 'Standard_A7'
  },
  {
    group: 'Standard',
    value: 'Standard_A8'
  },
  {
    group: 'Standard',
    value: 'Standard_A9'
  },
  {
    group: 'Standard',
    value: 'Standard_A10'
  },
  {
    group: 'Standard',
    value: 'Standard_A11'
  },
  {
    group: 'Standard',
    value: 'Standard_D1'
  },
  {
    group: 'Standard',
    value: 'Standard_D2'
  },
  {
    group: 'Standard',
    value: 'Standard_D3'
  },
  {
    group: 'Standard',
    value: 'Standard_D4'
  },
  {
    group: 'Standard',
    value: 'Standard_D11'
  },
  {
    group: 'Standard',
    value: 'Standard_D12'
  },
  {
    group: 'Standard',
    value: 'Standard_D13'
  },
  {
    group: 'Standard',
    value: 'Standard_D14'
  },
  {
    group: 'Standard',
    value: 'Standard_D1_v2'
  },
  {
    group: 'Standard',
    value: 'Standard_D2_v2'
  },
  {
    group: 'Standard',
    value: 'Standard_D3_v2'
  },
  {
    group: 'Standard',
    value: 'Standard_D4_v2'
  },
  {
    group: 'Standard',
    value: 'Standard_D5_v2'
  },
  {
    group: 'Standard',
    value: 'Standard_D11_v2'
  },
  {
    group: 'Standard',
    value: 'Standard_D12_v2'
  },
  {
    group: 'Standard',
    value: 'Standard_D13_v2'
  },
  {
    group: 'Standard',
    value: 'Standard_D14_v2'
  },
  {
    group: 'Standard',
    value: 'Standard_DS1'
  },
  {
    group: 'Standard',
    value: 'Standard_DS2'
  },
  {
    group: 'Standard',
    value: 'Standard_DS3'
  },
  {
    group: 'Standard',
    value: 'Standard_DS12'
  },
  {
    group: 'Standard',
    value: 'Standard_DS13'
  },
  {
    group: 'Standard',
    value: 'Standard_DS14'
  },
  {
    group: 'Standard',
    value: 'Standard_G1'
  },
  {
    group: 'Standard',
    value: 'Standard_G2'
  },
  {
    group: 'Standard',
    value: 'Standard_G3'
  },
  {
    group: 'Standard',
    value: 'Standard_G4'
  },
  {
    group: 'Standard',
    value: 'Standard_G5'
  },
  {
    group: 'Standard',
    value: 'Standard_GS1'
  },
  {
    group: 'Standard',
    value: 'Standard_GS2'
  },
  {
    group: 'Standard',
    value: 'Standard_GS3'
  },
  {
    group: 'Standard',
    value: 'Standard_GS4'
  },
  {
    group: 'Standard',
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
    value: 'AzureUSGovernmentCloud'
  }
];
