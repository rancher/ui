import Ember from 'ember';
import NewHost from 'ui/mixins/new-host';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode: function(input) {var output = "";var chr1, chr2, chr3, enc1, enc2, enc3, enc4;var i = 0;input = Base64._utf8_encode(input);while (i < input.length) {chr1 = input.charCodeAt(i++);chr2 = input.charCodeAt(i++);chr3 = input.charCodeAt(i++);enc1 = chr1 >> 2;enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);enc4 = chr3 & 63;if (isNaN(chr2)) {	enc3 = enc4 = 64;} else if (isNaN(chr3)) {	enc4 = 64;}output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);}return output;},_utf8_encode: function(string) {string = string.replace(/\r\n/g, "\n");var utftext = "";for (var n = 0; n < string.length; n++) {var c = string.charCodeAt(n);if (c < 128) {	utftext += String.fromCharCode(c);}else if ((c > 127) && (c < 2048)) {	utftext += String.fromCharCode((c >> 6) | 192);	utftext += String.fromCharCode((c & 63) | 128);}else {	utftext += String.fromCharCode((c >> 12) | 224);	utftext += String.fromCharCode(((c >> 6) & 63) | 128);	utftext += String.fromCharCode((c & 63) | 128);}}return utftext;}};

export default Ember.ObjectController.extend(NewHost, {
  allDiskSizes: null,
  allInstanceProfiles: null,

  ubiquityhostingApi: 'api.ubiquityhosting.com/v25/api.php',

  step: 1,
  isStep1: Ember.computed.equal('step',1),
  isStep2: Ember.computed.equal('step',2),
  isGteStep3: Ember.computed.gte('step',3),
  
  
  zoneIdSelected: Ember.observer('model.ubiquityConfig.zoneId', function() {
	  var zone_id = this.get('model.ubiquityConfig.zoneId');
	  if (zone_id){
          this.getImages(zone_id);
	  }
	  
  }),
  
getZones: function(){
	// Get Zones
		this.apiRequest('list_zones').then((res) => {
			var zones = [];
			var defaultZone = null;

			/* Retrieve the list of zones. */
			(res.Zones || []).forEach((zone) => {
				var obj = {
					id: zone.id,
					name: zone.name,
					isDefault: zone.name === this.get('model.defaultZoneName')
				};

				zones.push(obj);
				if (obj.isDefault && !defaultZone) {
					defaultZone = obj;
				}
			});
			
			this.set('model.allZones', zones);
			this.set('model.defaultZone', defaultZone);

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
			var images = [];
			var defaultImage = null;

			/* Retrieve the list of zones. */
			(res.Images || []).forEach((image) => {
				var obj = {
					id: image.id,
					name: image.name,
					description: image.cat_desc,
					isDefault: image.name === this.get('model.defaultImageName')
				};

				images.push(obj);
				if (obj.isDefault && !defaultImage) {
					defaultImage = obj;
				}
			});

			this.set('model.allImages', images);
			this.set('model.defaultImage', defaultImage);		  
			
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
			var flavors = [];
			var defaultFlavor = null;

			/* Retrieve the list of zones. */
			(res.Flavors || []).forEach((flavor) => {
				var obj = {
					id: flavor.id,
					name: flavor.name,
					// description: flavor.cat_desc,
					isDefault: flavor.name === this.get('model.defaultFlavorName')
				};

				flavors.push(obj);
				if (obj.isDefault && !defaultFlavor) {
					defaultFlavor = obj;
				}
			});

			this.set('model.allFlavors', flavors);
			this.set('model.defaultFlavor', defaultFlavor);		  
			
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
		this.set('errors', null);
		this.set('step', 2);
		
		this.getZones();
		this.getFlavors();
		
		this.set('model.ubiquityConfig.clientId', (this.get('model.ubiquityConfig.clientId')||'').trim());
		this.set('model.ubiquityConfig.apiUsername', (this.get('model.ubiquityConfig.apiUsername')||'').trim());
		this.set('model.ubiquityConfig.apiToken', (this.get('model.ubiquityConfig.apiToken')||'').trim());		  
	},
},  

  apiErrorMessage: function(err, kind, prefix, def) {
    var answer = (err.xhr || {}).responseJSON || {};
    var text = (answer[kind] || {}).errortext;
    if (text) {
      return prefix + ": " + text;
    } else {
      return def;
    }
  },

  apiRequest: function(command, params) {
    var url = '/proxy/' + this.ubiquityhostingApi + "?method=cloud." + command;

	var auth = this.get('model.ubiquityConfig.clientId') + ':' + this.get('model.ubiquityConfig.apiUsername') + ':' + this.get('model.ubiquityConfig.apiToken');
    var auth_encoded = Base64.encode(auth);
	
    params = params || {};
	
	// console.log(url);
	// console.log(params);
	

    return ajaxPromise({url: url,
                        method: 'POST',
                        dataType: 'json',
                        headers: {
                          'Accept': 'application/json',
                          'X-API-Headers-Restrict': 'Content-Length',
						  'X-API-AUTH-HEADER': 'Basic ' + auth_encoded,
                        },
						beforeSend: (xhr, settings) => {
                          // Append 'rancher:' to Content-Type
                          xhr.setRequestHeader('Content-Type',
                                               'rancher:' + settings.contentType);
                          return true;
                        },
                        data: params,
						params: params}, true);
  },

  initFields: function() {
    this._super();
  },

  validate: function() {
    this._super();
    var errors = this.get('errors')||[];

    var name = this.get('name')||'';
    if ( name.length > 200 )
    {
      errors.push('"name" should be 1-200 characters long');
    }

    if ( name.match(/[^a-z0-9-]/i) )
    {
      errors.push('"name" can only contain letters, numbers, and hyphen');
    }

    if ( errors.get('length') )
    {
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
