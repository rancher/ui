export let Regions = {
  "regions": [{
    "name": "New York 1",
    "slug": "nyc1",
    "sizes": [],
    "features": ["virtio", "backups"],
    "available": false
  }, {
    "name": "New York 2",
    "slug": "nyc2",
    "sizes": ["32gb", "16gb", "2gb", "1gb", "4gb", "8gb", "512mb", "64gb", "48gb"],
    "features": ["virtio", "private_networking", "backups"],
    "available": true
  }, {
    "name": "New York 3",
    "slug": "nyc3",
    "sizes": ["32gb", "16gb", "2gb", "1gb", "4gb", "8gb", "512mb", "64gb", "48gb"],
    "features": ["virtio", "private_networking", "backups", "ipv6", "metadata"],
    "available": true
  }, {
    "name": "Amsterdam 1",
    "slug": "ams1",
    "sizes": [],
    "features": ["virtio", "backups"],
    "available": false
  }, {
    "name": "Amsterdam 2",
    "slug": "ams2",
    "sizes": ["32gb", "16gb", "2gb", "1gb", "4gb", "8gb", "512mb", "64gb", "48gb"],
    "features": ["virtio", "private_networking", "backups", "ipv6", "metadata"],
    "available": true
  }, {
    "name": "Amsterdam 3",
    "slug": "ams3",
    "sizes": ["32gb", "16gb", "2gb", "1gb", "4gb", "8gb", "512mb", "64gb", "48gb"],
    "features": ["virtio", "private_networking", "backups", "ipv6", "metadata"],
    "available": true
  }, {
    "name": "San Francisco 1",
    "slug": "sfo1",
    "sizes": ["32gb", "16gb", "2gb", "1gb", "4gb", "8gb", "512mb", "64gb", "48gb"],
    "features": ["virtio", "private_networking", "backups", "ipv6", "metadata"],
    "available": true
  }, {
    "name": "Singapore 1",
    "slug": "sgp1",
    "sizes": ["32gb", "16gb", "2gb", "1gb", "4gb", "8gb", "512mb", "64gb", "48gb"],
    "features": ["virtio", "private_networking", "backups", "ipv6", "metadata"],
    "available": true
  }, {
    "name": "London 1",
    "slug": "lon1",
    "sizes": ["32gb", "16gb", "2gb", "1gb", "4gb", "8gb", "512mb", "64gb", "48gb"],
    "features": ["virtio", "private_networking", "backups", "ipv6", "metadata"],
    "available": true
  }, {
    "name": "Frankfurt 1",
    "slug": "fra1",
    "sizes": ["32gb", "16gb", "2gb", "1gb", "4gb", "8gb", "512mb", "64gb", "48gb"],
    "features": ["virtio", "private_networking", "backups", "ipv6", "metadata"],
    "available": true
  }],
  "links": {},
  "meta": {
    "total": 10
  }
};

export let Images = {
  "images": [{
    "id": 11374310,
    "name": "647.0.0 (alpha)",
    "distribution": "CoreOS",
    "slug": "coreos-alpha",
    "public": true,
    "regions": ["sfo1", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-04-09T17:29:01Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 11420434,
    "name": "633.1.0 (stable)",
    "distribution": "CoreOS",
    "slug": "coreos-stable",
    "public": true,
    "regions": ["sfo1", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-04-14T19:29:27Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 11434448,
    "name": "647.0.0 (beta)",
    "distribution": "CoreOS",
    "slug": "coreos-beta",
    "public": true,
    "regions": ["sfo1", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-04-15T17:24:29Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 6370882,
    "name": "20 x64",
    "distribution": "Fedora",
    "slug": "fedora-20-x64",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2014-09-26T15:29:01Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 6370885,
    "name": "20 x32",
    "distribution": "Fedora",
    "slug": "fedora-20-x32",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2014-09-26T15:29:18Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 6372321,
    "name": "5.10 x64",
    "distribution": "CentOS",
    "slug": "centos-5-8-x64",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2014-09-26T16:40:18Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 6372425,
    "name": "5.10 x32",
    "distribution": "CentOS",
    "slug": "centos-5-8-x32",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2014-09-26T16:45:29Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 6372581,
    "name": "6.0 x64",
    "distribution": "Debian",
    "slug": "debian-6-0-x64",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2014-09-26T16:56:00Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 6372662,
    "name": "6.0 x32",
    "distribution": "Debian",
    "slug": "debian-6-0-x32",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2014-09-26T17:00:21Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 9640922,
    "name": "21 x64",
    "distribution": "Fedora",
    "slug": "fedora-21-x64",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-01-02T19:06:09Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 9801948,
    "name": "14.04 x32",
    "distribution": "Ubuntu",
    "slug": "ubuntu-14-04-x32",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-01-08T18:40:58Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 9801950,
    "name": "14.04 x64",
    "distribution": "Ubuntu",
    "slug": "ubuntu-14-04-x64",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-01-08T18:41:13Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 9801951,
    "name": "14.10 x32",
    "distribution": "Ubuntu",
    "slug": "ubuntu-14-10-x32",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-01-08T18:41:22Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 9801954,
    "name": "14.10 x64",
    "distribution": "Ubuntu",
    "slug": "ubuntu-14-10-x64",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-01-08T18:41:29Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 10144573,
    "name": "10.1",
    "distribution": "FreeBSD",
    "slug": "freebsd-10-1-x64",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-01-20T20:04:34Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 10321756,
    "name": "12.04.5 x64",
    "distribution": "Ubuntu",
    "slug": "ubuntu-12-04-x64",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-01-28T15:50:38Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 10321777,
    "name": "12.04.5 x32",
    "distribution": "Ubuntu",
    "slug": "ubuntu-12-04-x32",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-01-28T15:54:17Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 10322059,
    "name": "7.0 x64",
    "distribution": "Debian",
    "slug": "debian-7-0-x64",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-01-28T16:09:29Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 10322378,
    "name": "7.0 x32",
    "distribution": "Debian",
    "slug": "debian-7-0-x32",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-01-28T16:23:04Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 10322623,
    "name": "7 x64",
    "distribution": "CentOS",
    "slug": "centos-7-0-x64",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-01-28T16:36:06Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 10325922,
    "name": "6.5 x64",
    "distribution": "CentOS",
    "slug": "centos-6-5-x64",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-01-28T20:20:28Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }, {
    "id": 10325992,
    "name": "6.5 x32",
    "distribution": "CentOS",
    "slug": "centos-6-5-x32",
    "public": true,
    "regions": ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1", "lon1", "nyc3", "ams3", "fra1"],
    "created_at": "2015-01-28T20:26:38Z",
    "min_disk_size": 20,
    "type": "snapshot"
  }],
  "links": {},
  "meta": {
    "total": 22
  }
};
