let DriverChoices = {
  drivers: [
    {name: 'custom',       label: 'Custom',        css: 'custom',       sort: 1,                              },
    {name: 'amazonec2',    label: 'Amazon EC2',    css: 'amazon',       sort: 2, schema: 'amazonec2config'    },
    {name: 'azure',        label: 'Azure',         css: 'azure',        sort: 2, schema: 'azureConfig'        },
    {name: 'digitalocean', label: 'DigitalOcean',  css: 'digitalocean', sort: 2, schema: 'digitaloceanconfig' },
    {name: 'exoscale',     label: 'Exoscale',      css: 'exoscale',     sort: 2, schema: 'exoscaleconfig'     },
    {name: 'packet',       label: 'Packet',        css: 'packet',       sort: 2, schema: 'packetconfig'       },
    {name: 'rackspace',    label: 'RackSpace',     css: 'rackspace',    sort: 2, schema: 'rackspaceconfig'    },
    {name: 'ubiquity',     label: 'Ubiquity',      css: 'ubiquity',     sort: 2, schema: 'ubiquityconfig'     },
    {name: 'other',        label: 'Other',         css: 'other',        sort: 3,                              },
  ]
};

export default DriverChoices;
