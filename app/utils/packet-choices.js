export let PacketFacilities = [
  {
    "id": "e1e9c52e-a0bc-4117-b996-0fc94843ea09",
    "name": "Parsippany, NJ",
    "code": "ewr1",
    "features": [
      "baremetal",
      "storage"
    ],
    "address": null
  },
  {
    "id": "8e6470b3-b75e-47d1-bb93-45b225750975",
    "name": "Amsterdam, NL",
    "code": "ams1",
    "features": [
      "storage"
    ],
    "address": null
  },
  {
    "id": "2b70eb8f-fa18-47c0-aba7-222a842362fd",
    "name": "Sunnyvale, CA",
    "code": "sjc1",
    "features": [],
    "address": null
  },
  {
    "id": "8ea03255-89f9-4e62-9d3f-8817db82ceed",
    "name": "Tokyo, JP",
    "code": "nrt1",
    "features": [
      "baremetal"
    ],
    "address": null
  }
];

export let PacketOs = [
  {
    "slug": "centos_7",
    "name": "CentOS 7 (legacy)",
    "distro": "centos",
    "version": "7",
    "provisionable_on": [
      "baremetal_0",
      "baremetal_1",
      "baremetal_3"
    ]
  },
  {
    "slug": "centos_7_image",
    "name": "CentOS 7",
    "distro": "centos",
    "version": "7",
    "provisionable_on": [
      "baremetal_0",
      "baremetal_1",
      "baremetal_2",
      "baremetal_3"
    ]
  },
  {
    "slug": "coreos_stable",
    "name": "CoreOS (stable)",
    "distro": "coreos",
    "version": "stable",
    "provisionable_on": [
      "baremetal_0",
      "baremetal_1",
      "baremetal_2",
      "baremetal_3"
    ]
  },
  {
    "slug": "coreos_beta",
    "name": "CoreOS (beta)",
    "distro": "coreos",
    "version": "beta",
    "provisionable_on": [
      "baremetal_0",
      "baremetal_1",
      "baremetal_2",
      "baremetal_3"
    ]
  },
  {
    "slug": "coreos_alpha",
    "name": "CoreOS (alpha)",
    "distro": "coreos",
    "version": "alpha",
    "provisionable_on": [
      "baremetal_0",
      "baremetal_1",
      "baremetal_2",
      "baremetal_3"
    ]
  },
  {
    "slug": "debian_8",
    "name": "Debian 8 (legacy)",
    "distro": "debian",
    "version": "8",
    "provisionable_on": [
      "baremetal_0",
      "baremetal_1",
      "baremetal_2",
      "baremetal_3"
    ]
  },
  {
    "slug": "ubuntu_14_04",
    "name": "Ubuntu 14.04 LTS (legacy)",
    "distro": "ubuntu",
    "version": "14.04",
    "provisionable_on": [
      "baremetal_0",
      "baremetal_1",
      "baremetal_3"
    ]
  },
  {
    "slug": "ubuntu_14_04_image",
    "name": "Ubuntu 14.04 LTS",
    "distro": "ubuntu",
    "version": "14.04",
    "provisionable_on": [
      "baremetal_0",
      "baremetal_1",
      "baremetal_2",
      "baremetal_3"
    ]
  },
  {
    "slug": "ubuntu_16_04_image",
    "name": "Ubuntu 16.04 LTS",
    "distro": "ubuntu",
    "version": "16.04",
    "provisionable_on": [
      "baremetal_0",
      "baremetal_1",
      "baremetal_2",
      "baremetal_2a",
      "baremetal_3"
    ]
  },
  {
    "slug": "rancher",
    "name": "RancherOS",
    "distro": "rancher",
    "version": "0.7.0",
    "provisionable_on": [
      "baremetal_0",
      "baremetal_1",
      "baremetal_2",
      "baremetal_2a",
      "baremetal_3"
    ]
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
    "available_in": [
      {
        "href": "/facilities/2b70eb8f-fa18-47c0-aba7-222a842362fd"
      },
      {
        "href": "/facilities/8e6470b3-b75e-47d1-bb93-45b225750975"
      },
      {
        "href": "/facilities/e1e9c52e-a0bc-4117-b996-0fc94843ea09"
      },
      {
        "href": "/facilities/8ea03255-89f9-4e62-9d3f-8817db82ceed"
      }
    ],
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
    "available_in": [
      {
        "href": "/facilities/2b70eb8f-fa18-47c0-aba7-222a842362fd"
      },
      {
        "href": "/facilities/8e6470b3-b75e-47d1-bb93-45b225750975"
      },
      {
        "href": "/facilities/e1e9c52e-a0bc-4117-b996-0fc94843ea09"
      },
      {
        "href": "/facilities/8ea03255-89f9-4e62-9d3f-8817db82ceed"
      }
    ],
    "pricing": {
      "hour": 0.4
    }
  },
  {
    "id": "a3729923-fdc4-4e85-a972-aafbad3695db",
    "slug": "baremetal_2",
    "name": "Type 2",
    "description": "Our Type 2 configuration is the perfect all purpose virtualization server, with dual E5-2650 v4 processors, 256 GB of DDR4 RAM, and six SSDs totaling 2.8 TB of storage.",
    "line": "baremetal",
    "specs": {
      "cpus": [
        {
          "count": 2,
          "type": "Intel Xeon E5-2650 v4 @2.2GHz"
        }
      ],
      "memory": {
        "total": "256GB"
      },
      "drives": [
        {
          "count": 6,
          "size": "480GB",
          "type": "SSD"
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
    "available_in": [
      {
        "href": "/facilities/2b70eb8f-fa18-47c0-aba7-222a842362fd"
      },
      {
        "href": "/facilities/8e6470b3-b75e-47d1-bb93-45b225750975"
      },
      {
        "href": "/facilities/8ea03255-89f9-4e62-9d3f-8817db82ceed"
      }
    ],
    "pricing": {
      "hour": 1.25
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
          "count": 1,
          "size": "1.6TB",
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
    "available_in": [
      {
        "href": "/facilities/2b70eb8f-fa18-47c0-aba7-222a842362fd"
      },
      {
        "href": "/facilities/8e6470b3-b75e-47d1-bb93-45b225750975"
      },
      {
        "href": "/facilities/e1e9c52e-a0bc-4117-b996-0fc94843ea09"
      }
    ],
    "pricing": {
      "hour": 1.75
    }
  },
  {
    "id": "87728148-3155-4992-a730-8d1e6aca8a32",
    "slug": "storage_1",
    "name": "Standard",
    "description": "TBD",
    "line": "storage",
    "specs": {},
    "available_in": [],
    "pricing": {
      "hour": 0.000104
    }
  },
  {
    "id": "d6570cfb-38fa-4467-92b3-e45d059bb249",
    "slug": "storage_2",
    "name": "Performance",
    "description": "TBD",
    "line": "storage",
    "specs": {},
    "available_in": [],
    "pricing": {
      "hour": 0.000223
    }
  }
];
