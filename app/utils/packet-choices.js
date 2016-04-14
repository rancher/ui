export let PacketFacilities = [
  {
    "name": "Parsippany, NJ",
    "internalName": null,
    "code": "ewr1",
    "description": null,
    "address": null,
    "emergencyPhone": null,
    "features": [
      "baremetal"
    ],
    "clli": null,
    "npanxx": null,
    "hardware": null,
    "devices": null,
    "provider": null,
    "providerId": null,
    "public": null,
    "id": "e1e9c52e-a0bc-4117-b996-0fc94843ea09",
    "href": "/facilities/e1e9c52e-a0bc-4117-b996-0fc94843ea09",
    "createdAt": null,
    "updatedAt": null
  }
];

export let PacketOs = [
  {
    "slug": "centos_7",
    "name": "CentOS 7",
    "distro": "centos",
    "version": "7",
    "id": null,
    "href": null,
    "createdAt": null,
    "updatedAt": null
  },
  {
    "slug": "coreos_stable",
    "name": "CoreOS (stable)",
    "distro": "coreos",
    "version": "stable",
    "id": null,
    "href": null,
    "createdAt": null,
    "updatedAt": null
  },
  {
    "slug": "ubuntu_14_04",
    "name": "Ubuntu 14.04 LTS",
    "distro": "ubuntu",
    "version": "14.04",
    "id": null,
    "href": null,
    "createdAt": null,
    "updatedAt": null
  },
  {
    "slug": "debian_7",
    "name": "Debian 7",
    "distro": "debian",
    "version": "7",
    "id": null,
    "href": null,
    "createdAt": null,
    "updatedAt": null
  }
];

export let PacketPlans = [
  {
    "id": "e69c0169-4726-46ea-98f1-939c9e8a3607",
    "slug": "baremetal_0",
    "name": "Type 0",
    "description": "Our Type 0 configuration is a general use \"cloud killer\" server, with a Intel Atom 2.4Ghz processor and 8GB of RAM.",
    "line": "baremetal",
    "specs": {
      "cpus": [
        {
          "count": 1,
          "type": "Intel Atom C2550 @ 2.4Ghz"
        }
      ],
      "memory": {
        "total": "8GB"
      },
      "drives": [
        {
          "count": 1,
          "size": "80GB",
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
        "raid": false,
        "txt": true
      }
    },
    "pricing": {
      "hour": 0.05
    }
  },
  {
    "id": "6d1f1ffa-7912-4b78-b50d-88cc7c8ab40f",
    "slug": "baremetal_1",
    "name": "Type 1",
    "description": "Our Type 1 configuration is a zippy general use server, with an Intel E3-1240 v3 processor and 32GB of RAM.",
    "line": "baremetal",
    "specs": {
      "cpus": [
        {
          "count": 1,
          "type": "Intel E3-1240 v3"
        }
      ],
      "memory": {
        "total": "32GB"
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
      "hour": 0.4
    }
  },
  {
    "id": "741f3afb-bb2f-4694-93a0-fcbad7cd5e78",
    "slug": "baremetal_3",
    "name": "Type 3",
    "description": "Our Type 3 configuration is a high core, high IO server, with dual Intel E5-2640 v3 processors, 128GB of DDR4 RAM and ultra fast NVME flash drives.",
    "line": "baremetal",
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
      "hour": 1.75
    }
  }
];
