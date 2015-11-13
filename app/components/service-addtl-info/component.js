import Ember from 'ember';
import ReadLabels from 'ui/mixins/read-labels';
import C from 'ui/utils/constants';


export default Ember.Component.extend(ReadLabels, {

  service: null,
  labelResource: Ember.computed.alias('service.launchConfig'),
  serviceContainers: null,

  tagName: 'div',

  classNames: ['service-addtl-info'],

  actions: {
    dismiss: function() {
      this.sendAction('dismiss');
    },
  },

  didInsertElement: function() {
    $('#application').addClass('summary-shown');
  },

  willDestroyElement: function() {
    $('#application').removeClass('summary-shown');
  },

  stateBackground: function() {
    return this.get('service.stateColor').replace("text-", "bg-");
  }.property('service.stateColor'),

  componentInit: Ember.on('init', function() {
    this.setup();
  }),

  serviceObserver: function() {
    this.setup();
  }.observes('service'),

  setup: function() {
    /*If we dont reset the component but swap out the service we need to reset this*/
    if (this.get('serviceContainers')) {
      this.set('serviceContainers', null);
    }

    /*if we're in a sidekick reset to the main tab when the service is changed*/
    if (!Ember.$('#service-tab').hasClass('active')) {
      Ember.$('#service-tab a').tab('show');
    }

    /* Need to filter the service containers when sidekicks are present cause they all just live in one object*/
    if (this.get('service.instances')) {
      this.set('serviceContainers', Ember.Object.create({}));
      this.get('service.instances').forEach((instance) => {
        /* if primary do things here */
        if (instance.get('labels')[C.LABEL.LAUNCH_CONFIG] === C.LABEL.LAUNCH_CONFIG_PRIMARY) {
          if (this.get('serviceContainers').hasOwnProperty('primary')) {
            this.get('serviceContainers.primary').pushObject(instance);
          } else {
            this.get('serviceContainers').set('primary', [instance]);
          }
        } else {
          /* not primary loop through secondary launch configs */
          this.get('service.secondaryLaunchConfigs').forEach((config) => {
            if (config.name === instance.get('labels')[C.LABEL.LAUNCH_CONFIG]) {
              if (config.hasOwnProperty('serviceContainers')) {
                config.get('serviceContainers').pushObject(instance);
              } else {
                config.set('serviceContainers', [instance]);
              }
            }
          });
        }
      });
    }
  },
});
