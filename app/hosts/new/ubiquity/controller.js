import Ember from 'ember';
import NewHost from 'ui/mixins/new-host';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

export default Ember.Controller.extend(NewHost, {
  ubiquityConfig: Ember.computed.alias('model.ubiquityConfig'),

  allDiskSizes: null,
  allInstanceProfiles: null,

  ubiquityhostingApi: 'api.ubiquityhosting.com/v25/api.php',

  step: 1,

  isStep1: Ember.computed.equal('step',1),
  isStep2: Ember.computed.equal('step',2),
  isGteStep3: Ember.computed.gte('step',3),

  zoneIdSelected: function() {
    var zone_id = this.get('ubiquityConfig.zoneId');

	  if (zone_id){
      this.getImages(zone_id);
	  }
  }.observes('ubiquityConfig.zoneId'),

  getZones: function(){
  	// Get Zones
  	this.apiRequest('list_zones').then((res) => {
      // Check for any out-of-band errors and handle as needed
      if ((res || '') == '') {
        var errors = this.get('errors')||[];

        errors.push('Authentication failure: please check the provided access credentials');

        this.set('errors', errors);
        this.set('step', 1);

        return false;
      }

      var zones = [];
  	  var defaultZone = null;

  		/* Retrieve the list of zones. */
  		(res.Zones || []).forEach((zone) => {
  			var obj = {
  				id: zone.id,
  				name: zone.name,
  				isDefault: zone.name === this.get('defaultZoneName')
  			};

  			zones.push(obj);

        if (obj.isDefault && !defaultZone) {
  				defaultZone = obj;
        }
      });

      this.set('allZones', zones);
  		this.set('defaultZone', defaultZone);

    }, (err) => {
  		var errors = this.get('errors')||[];

      errors.pushObject(
  			this.apiErrorMessage(
  				err,
  				'listzonesresponse',
  				'While requesting zones',
  				'Authentication failure: please check the provided access credentials'
  			)
  		);

  		this.set('errors', errors);
  		this.set('step', 1);
    });
  },

  getImages: function(zone_id){
  	// Get Images
  	this.apiRequest('list_images', {zone_id: zone_id, docker_machine: 'true'}).then((res) => {
      // Check for any out-of-band errors and handle as needed
      if ((res || '') == '') {
        var errors = this.get('errors')||[];

        errors.push('Authentication failure: please check the provided access credentials');

        this.set('errors', errors);
        this.set('step', 1);

        return false;
      }

  		var images = [];
  		var defaultImage = null;

  		/* Retrieve the list of zones. */
  		(res.Images || []).forEach((image) => {
  			var obj = {
  				id: image.id,
  				name: image.name,
  				description: image.cat_desc,
  				isDefault: image.name === this.get('defaultImageName')
  			};

  			images.push(obj);

  			if (obj.isDefault && !defaultImage) {
  				defaultImage = obj;
  			}
      });

  		this.set('allImages', images);
  		this.set('defaultImage', defaultImage);

    }, (err) => {
  		var errors = this.get('errors')||[];

  		errors.pushObject(
  			this.apiErrorMessage(
  				err,
  				'listimagesresponse',
  				'While requesting images',
  				'Authentication failure: please check the provided access credentials'
  			)
  		);

  		this.set('errors', errors);
  		this.set('step', 1);
    });
  },

  getFlavors: function(){
  	// Get Flavors
  	this.apiRequest('list_flavors').then((res) => {
      // Check for any out-of-band errors and handle as needed
      if ((res || '') == '') {
        var errors = this.get('errors')||[];

        errors.push('Authentication failure: please check the provided access credentials');

        this.set('errors', errors);
        this.set('step', 1);

        return false;
      }

      var flavors = [];
  		var defaultFlavor = null;

  		/* Retrieve the list of zones. */
  		(res.Flavors || []).forEach((flavor) => {
  			var obj = {
  				id: flavor.id,
  				name: flavor.name,
  				// description: flavor.cat_desc,
  				isDefault: flavor.name === this.get('defaultFlavorName')
  			};

  			flavors.push(obj);

  			if (obj.isDefault && !defaultFlavor) {
  				defaultFlavor = obj;
  			}
      });

  		this.set('allFlavors', flavors);
  		this.set('defaultFlavor', defaultFlavor);

  		/* Move to next step */
  		this.set('step', 3);
    }, (err) => {
  		var errors = this.get('errors')||[];

  		errors.pushObject(
        this.apiErrorMessage(
  				err,
  				'listflavorsresponse',
  				'While requesting flavors',
  				'Authentication failure: please check the provided access credentials'
  			)
      );

  		this.set('errors', errors);
  		this.set('step', 1);
    });
  },

  actions: {
    /* Login step */
  	ubiLogin: function() {
      this.getZones();
      this.getFlavors();

      this.set('errors', null);
      this.set('step', 2);

      this.set('ubiquityConfig.clientId', (this.get('ubiquityConfig.clientId')||'').trim());
  		this.set('ubiquityConfig.apiUsername', (this.get('ubiquityConfig.apiUsername')||'').trim());
  		this.set('ubiquityConfig.apiToken', (this.get('ubiquityConfig.apiToken')||'').trim());
  	},
  },

  apiErrorMessage: function(err, kind, prefix, def) {
    var answer = (err.xhr || {}).responseJSON || {};
    var text = (answer[kind] || {}).errortext;

    if (text) {
      return prefix + ": " + text;
    }
    else {
      return def;
    }
  },

  apiRequest: function(command, params) {
    var url = '/v1/proxy/' + this.ubiquityhostingApi + "?method=cloud." + command;

	  var auth = this.get('ubiquityConfig.clientId') + ':' + this.get('ubiquityConfig.apiUsername') + ':' + this.get('ubiquityConfig.apiToken');

    var auth_encoded = window.btoa(auth);

    params = params || {};

    var retval = ajaxPromise({
      url: url,
      method: 'POST',
      dataType: 'json',

      headers: {
        'Accept': 'application/json',
        'X-API-Headers-Restrict': 'Content-Length',
			  'X-API-AUTH-HEADER': 'Basic ' + auth_encoded,
      },

			beforeSend: (xhr, settings) => {
        // Prepend 'rancher:' to Content-Type
        xhr.setRequestHeader('Content-Type', 'rancher:' + settings.contentType);

        return true;
      },

      data: params,
			params: params
    }, true);

    return retval;
  },

  initFields: function() {
    this._super();
  },

  validate: function() {
    this._super();

    var errors = this.get('errors')||[];

    var name = this.get('name')||'';

    if (name.length > 200) {
      errors.push('"name" should be 1-200 characters long');
    }

    if (name.match(/[^a-z0-9-]/i)) {
      errors.push('"name" can only contain letters, numbers, and hyphen');
    }

    if (errors.get('length')) {
      this.set('errors',errors);

      return false;
    }

    return true;
  },

  doneSaving: function() {
    var out = this._super();

    this.transitionToRoute('hosts');

    return out;
  }
});
