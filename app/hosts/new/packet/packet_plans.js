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
          "type": "gigabit"
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
  }
];
