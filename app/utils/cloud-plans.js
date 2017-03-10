var CLOUD_PLANS = {
  "logicalRegions" : [
    {
      id: "us-west",
      name: "US West",
      "instanceTypes": [
        {
          "id": "t1.micro",
          "displayName": "",
          "driver": "amazon",
          "memory": "0.0613GB",
          "storage": "EBS-Only",
          "availabilityZone": "us-west-1",
          "pricePerHour": "0.020",
          "pricePerMonth": "",
          "amazonPricing": true,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "t1.micro",
          "driver": "amazon",
          "memory": "0.0613GB",
          "storage": "EBS-Only",
          "availabilityZone": "us-west-2",
          "pricePerHour": "0.020",
          "pricePerMonth": "",
          "amazonPricing": true,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "t2.micro",
          "driver": "amazon",
          "memory": "1.0GB",
          "storage": "EBS-Only",
          "availabilityZone": "us-west-1",
          "pricePerHour": "0.015",
          "pricePerMonth": "",
          "amazonPricing": true,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "t2.micro",
          "driver": "amazon",
          "memory": "1.0GB",
          "storage": "EBS-Only",
          "availabilityZone": "us-west-2",
          "pricePerHour": "0.015",
          "pricePerMonth": "",
          "amazonPricing": true,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "t2.nano",
          "driver": "amazon",
          "memory": "0.5GB",
          "storage": "EBS-Only",
          "availabilityZone": "us-west-1",
          "pricePerHour": "0.008",
          "pricePerMonth": "",
          "amazonPricing": true,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "t2.nano",
          "driver": "amazon",
          "memory": "0.5GB",
          "storage": "EBS-Only",
          "availabilityZone": "us-west-2",
          "pricePerHour": "0.008",
          "pricePerMonth": "",
          "amazonPricing": true,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "sfo1-small",
          "driver": "digitalOcean",
          "memory": "512MB",
          "storage": "20GB",
          "availabilityZone":"sfo1",
          "pricePerHour": "0.007439999841153622",
          "pricePerMonth": "5.00",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "sfo2-medium",
          "driver": "digitalOcean",
          "memory": "1GB",
          "storage": "30GB",
          "availabilityZone": "sfo2",
          "pricePerHour": "0.014879999682307243",
          "pricePerMonth": "10.00",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "sfo1-medium",
          "driver": "digitalOcean",
          "memory": "1GB",
          "storage": "30GB",
          "availabilityZone": "sfo1",
          "pricePerHour": "0.014879999682307243",
          "pricePerMonth": "10.00",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "sfo1-large",
          "driver": "digitalOcean",
          "memory": "2GB",
          "storage": "40GB",
          "availabilityZone": "sfo1",
          "pricePerHour": "0.029759999364614487",
          "pricePerMonth": "20.00",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "sfo2-large",
          "driver": "digitalOcean",
          "memory": "2GB",
          "storage": "40GB",
          "availabilityZone": "sfo2",
          "pricePerHour": "0.029759999364614487",
          "pricePerMonth": "20.00",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "baremetal_type0",
          "driver": "packet",
          "memory": "8GB",
          "storage": "80GB",
          "availabilityZone": "sjc1",
          "pricePerHour": "0.05",
          "pricePerMonth": "",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "baremetal_type1",
          "driver": "packet",
          "memory": "32GB",
          "storage": "120GB",
          "availabilityZone": "sjc1",
          "pricePerHour": "0.4",
          "pricePerMonth": "",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "baremetal_type2",
          "driver": "packet",
          "memory": "256GB",
          "storage": "480GB",
          "availabilityZone": "sjc1",
          "pricePerHour": "1.25",
          "pricePerMonth": "",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
      ]
    },
    {
      "id": "us-east",
      "name": "US East",
      "instanceTypes": [
        {
          "id": "t1.micro",
          "displayName": "",
          "driver": "amazon",
          "memory": "0.0613GB",
          "storage": "EBS-Only",
          "availabilityZone": "us-east-1",
          "pricePerHour": "0.020",
          "pricePerMonth": "",
          "amazonPricing": true,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "t1.micro",
          "driver": "amazon",
          "memory": "0.0613GB",
          "storage": "EBS-Only",
          "availabilityZone": "us-east-2",
          "pricePerHour": "0.020",
          "pricePerMonth": "",
          "amazonPricing": true,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "t2.micro",
          "driver": "amazon",
          "memory": "1.0GB",
          "storage": "EBS-Only",
          "availabilityZone": "us-east-1",
          "pricePerHour": "0.015",
          "pricePerMonth": "",
          "amazonPricing": true,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "t2.micro",
          "driver": "amazon",
          "memory": "1.0GB",
          "storage": "EBS-Only",
          "availabilityZone": "us-east-2",
          "pricePerHour": "0.015",
          "pricePerMonth": "",
          "amazonPricing": true,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "t2.nano",
          "driver": "amazon",
          "memory": "0.5GB",
          "storage": "EBS-Only",
          "availabilityZone": "us-east-1",
          "pricePerHour": "0.008",
          "pricePerMonth": "",
          "amazonPricing": true,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "t2.nano",
          "driver": "amazon",
          "memory": "0.5GB",
          "storage": "EBS-Only",
          "availabilityZone": "us-east-2",
          "pricePerHour": "0.008",
          "pricePerMonth": "",
          "amazonPricing": true,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "nyc1-small",
          "driver": "digitalOcean",
          "memory": "512MB",
          "storage": "20GB",
          "availabilityZone":"nyc1",
          "pricePerHour": "0.007439999841153622",
          "pricePerMonth": "5.00",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "nyc2-small",
          "driver": "digitalOcean",
          "memory": "512MB",
          "storage": "20GB",
          "availabilityZone":"nyc2",
          "pricePerHour": "0.007439999841153622",
          "pricePerMonth": "5.00",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "nyc1-medium",
          "driver": "digitalOcean",
          "memory": "1GB",
          "storage": "30GB",
          "availabilityZone": "nyc1",
          "pricePerHour": "0.014879999682307243",
          "pricePerMonth": "10.00",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "nyc2-medium",
          "driver": "digitalOcean",
          "memory": "1GB",
          "storage": "30GB",
          "availabilityZone": "nyc2",
          "pricePerHour": "0.014879999682307243",
          "pricePerMonth": "10.00",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "nyc3-medium",
          "driver": "digitalOcean",
          "memory": "1GB",
          "storage": "30GB",
          "availabilityZone": "nyc3",
          "pricePerHour": "0.014879999682307243",
          "pricePerMonth": "10.00",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "nyc1-large",
          "driver": "digitalOcean",
          "memory": "2GB",
          "storage": "40GB",
          "availabilityZone": "nyc1",
          "pricePerHour": "0.029759999364614487",
          "pricePerMonth": "20.00",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "nyc2-large",
          "driver": "digitalOcean",
          "memory": "2GB",
          "storage": "40GB",
          "availabilityZone": "nyc2",
          "pricePerHour": "0.029759999364614487",
          "pricePerMonth": "20.00",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "baremetal_0",
          "driver": "packet",
          "memory": "8GB",
          "storage": "80GB",
          "availabilityZone": "ewr1",
          "pricePerHour": "0.05",
          "pricePerMonth": "",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "baremetal_1",
          "driver": "packet",
          "memory": "32GB",
          "storage": "120GB",
          "availabilityZone": "ewr1",
          "pricePerHour": "0.4",
          "pricePerMonth": "",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
        {
          "id": "baremetal_2",
          "driver": "packet",
          "memory": "256GB",
          "storage": "480GB",
          "availabilityZone": "ewr1",
          "pricePerHour": "1.25",
          "pricePerMonth": "",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
      ]
    },
    {
      "id": "eu-west",
      "name": "EU West",
      "instanceTypes": [
        {
          "id": "",
          "driver": "",
          "memory": "",
          "storage": "",
          "availabilityZone": "",
          "pricePerHour": "",
          "pricePerMonth": "",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
      ]
    },
    {
      "id": "asia",
      "name": "Asia",
      "instanceTypes": [
        {
          "id": "",
          "driver": "",
          "memory": "",
          "storage": "",
          "availabilityZone": "",
          "pricePerHour": "",
          "pricePerMonth": "",
          "amazonPricing": false,
          "instanceConfig": { // this will be the config that passes to the machine driver create
          }
        },
      ]
    }
  ]
};
export default CLOUD_PLANS;
