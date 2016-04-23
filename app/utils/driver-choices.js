let drivers = [
  {name: 'custom',       label: 'Custom',        css: 'custom',       sort: 1,                              },
  {name: 'amazonec2',    label: 'Amazon EC2',    css: 'amazon',       sort: 2, schema: 'amazonec2Config'    },
  {name: 'azure',        label: 'Azure',         css: 'azure',        sort: 2, schema: 'azureConfig'        },
  {name: 'digitalocean', label: 'DigitalOcean',  css: 'digitalocean', sort: 2, schema: 'digitaloceanConfig' },
  {name: 'exoscale',     label: 'Exoscale',      css: 'exoscale',     sort: 2, schema: 'exoscaleConfig'     },
  {name: 'packet',       label: 'Packet',        css: 'packet',       sort: 2, schema: 'packetConfig'       },
  {name: 'rackspace',    label: 'RackSpace',     css: 'rackspace',    sort: 2, schema: 'rackspaceConfig'    },
  {name: 'ubiquity',     label: 'Ubiquity',      css: 'ubiquity',     sort: 2, schema: 'ubiquityConfig'     },
  {name: 'vsphere',      label: 'VMware vSphere',css: 'vsphere',      sort: 2, schema: 'vmwarevsphereConfig'},
  {name: 'other',        label: 'Other',         css: 'other',        sort: 3,                              },
];

let defaultDriver = 'custom';

// Addon integration hooks
export function get() {
  return drivers.slice();
}

export function add(driver) {
  drivers.push(driver);
}

export function remove(nameOrObj) {
  let name = ( typeof nameOrObj === 'object' ? nameOrObj.name : nameOrObj);
  drivers.removeObjects(drivers.filterBy('name', name));
}

export function getDefault() {
  return defaultDriver;
}

export function setDefault(name) {
  defaultDriver = name;
}
// End: Addon integration hooks

export default {get, add, remove, getDefault, setDefault};
