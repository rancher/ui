export default [
  {
    "slug": "baremetal_1",
    "name": "Type 1",
    "specs": {
      "cpus": [
        {
          "count": 1,
          "type": "Intel E3-1240 v3"
        }
      ],
      "memory": {
        "total": "16GB"
      },
      "drives": [
        {
          "count": 2,
          "size": "120GB",
          "type": "SSD"
        }
      ],
      "nics": [
        {
          "count": 2,
          "type": "1Gbps"
        }
      ],
      "features": {
        "raid": true,
        "txt": true
      }
    },
    "pricing": {
      "hourly": 0.4
    },
    "description": "Our Type 1 configuration is a zippy general use server, with an Intel E3-1240 v3 processor and 16GB of RAM.",
    "id": "6d1f1ffa-7912-4b78-b50d-88cc7c8ab40f",
    "href": null,
    "createdAt": null,
    "updatedAt": null
  },
  {
    "slug": "baremetal_3",
    "name": "Type 3",
    "specs": {
      "cpus": [
        {
          "count": 2,
          "type": "Intel E5-2640 v3"
        }
      ],
      "memory": {
        "total": "128GB"
      },
      "drives": [
        {
          "count": 2,
          "size": "120GB",
          "type": "SSD"
        },
        {
          "count": 2,
          "size": "800GB",
          "type": "NVME"
        }
      ],
      "nics": [
        {
          "count": 2,
          "type": "10Gbps"
        }
      ],
      "features": {
        "raid": true,
        "txt": true
      }
    },
    "pricing": {
      "hourly": 1.75
    },
    "description": "Our Type 3 configuration is a high core, high IO server, with dual Intel E5-2640 v3 processors, 128GB of DDR4 RAM and ultra fast NVME flash drives.",
    "id": "741f3afb-bb2f-4694-93a0-fcbad7cd5e78",
    "href": null,
    "createdAt": null,
    "updatedAt": null
  }
];
