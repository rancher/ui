import Ember from 'ember';
import Driver from 'ui/mixins/driver';

const locations = [
    {
        id: 'us/las',
        name: 'Las Vegas, United States'
    },
    {
        id: 'de/fkb',
        name: 'Karlsruhe, Germany'
    },
    {
        id: 'de/fra',
        name: 'Frankfurt, Germany'
    }
];
const cpu_families = [
    {
        name: 'AMD Opteron',
        value: 'AMD_OPTERON'
    },
    {
        name: 'Intel XEON',
        value: 'INTEL_XEON'
    }
];
const rams = [
    {
        name: '1GB',
        value: 1024
    },
    {
        name: '2GB',
        value: 2048
    },
    {
        name: '3GB',
        value: 3072
    },
    {
        name: '4GB',
        value: 4096
    }
];
const cores = ['1', '2', '3', '4'];
const disk_types = ['SSD', 'HDD'];

export default Ember.Component.extend(Driver, {
	driverName:		'profitbricks',
	locations:		locations,
	cpu_families:	cpu_families,
	rams:			rams,
	cores:			cores,
	disk_types: 	disk_types,

	bootstrap () {
		let config = this.get('store').createRecord({
			type: 'profitbricksConfig'
		});

		this.set('model', this.get('store').createRecord({
			type: 'host',
			profitbricksConfig: config
		}));
	},

	init () {
		this._super(...arguments);
	},

	validate () {
		this._super();

		let errors		= this.get('errors') || [],
            model		= this.get('model.%%DRIVERNAME%%Config'), 
            error_keys	= {
                cores:		'"Cores" is required',
                cpuFamily:	'"CPU family" is required',
                diskSize:	'"Volume size" is required',
                diskType:	'"Disk type" is required',
                image:		'"Image" is required',
                location:	'"Location" is required',
                password:	'"Password" is required',
                ram:		'"RAM" is required',
                username:	'"Username" is required'
            },
            valid = true;

        Object.keys(error_keys).forEach((error_key) => {
            if(model[error_key] == null || model[error_key] === '') {
                errors.push(error_keys[error_key]);
                valid = false;
            }
        });

        if(!valid) {
        	this.set('errors', errors);
        }

        return valid;
	},

	willDestroyElement () {
		this.set('errors', null);
	},

	actions: {
		selectLocation (loc) {
			this.set('model.profitbricksConfig.location', loc);
		},
		selectCpuFamily (cpu_family) {
			this.set('model.profitbricksConfig.cpuFamily', cpu_family);
		},
		selectCores (cores) {
			this.set('model.profitbricksConfig.cores', cores);
		},
		selectRam (ram) {
			this.set('model.profitbricksConfig.ram', ram);
		},
		selectDiskType (type) {
			this.set('model.profitbricksConfig.diskType', type);
		},
		create () {
			// console.log(this.get('model.%%DRIVERNAME%%Config'));
		},
		cancel () {
			// console.log('actions:cancel');
		}
	}

});
