import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import C from 'ui/utils/constants';


export default Ember.Component.extend(ManageLabels, {
  service: null,
  show: false,
  activeTab: '',

  tagName: 'div',

  classNames: ['service-addtl-info', 'collapse'],

  actions: {
    selectTab(tab) {
      this.set('activeTab', tab);
    },

    dismiss() {
      this.sendAction('dismiss');
    },
  },

  stateBackground: function() {
    return this.get('service.stateColor').replace("text-", "bg-");
  }.property('service.stateColor'),

  componentInit: function() {
    if (this.get('show')) {
    $('main').addClass('summary-shown');
      this.$().show().animate({height: '260px'}, 250, 'easeOutBack');
    } else {
      this.$().animate({height: '0'}, 250, () => {
        if ( this._state !== 'destroying' )
        {
          this.$().hide();
        }
        $('main').removeClass('summary-shown');
      });
    }
  }.observes('show'),

  serviceChanged: function() {
    this.initLabels(this.get('service.launchConfig.labels'));
    this.set('activeTab','');
  }.observes('service'),

  primaryContainers: null,
  sidekicks: null,
  serviceContainers: function() {
    var primary = [];
    var sidekicks = [];
    var sidekickByName = {};

    var slcs = (this.get('service.secondaryLaunchConfigs')||[]);
    slcs.forEach((config) => {
      var obj = {
        name: config.name,
        config: config,
        instances: [],
      };

      sidekicks.push(obj);
      sidekickByName[config.name] = obj;
    });

    (this.get('service.instances')||[]).forEach((instance) => {
      var lc = instance.get('labels')[C.LABEL.LAUNCH_CONFIG];

      // Primary service
      if ( lc === C.LABEL.LAUNCH_CONFIG_PRIMARY)
      {
        primary.push(instance);
      }
      else
      {
        // Sidekick services
        var sidekick = sidekickByName[lc];
        if ( sidekick )
        {
          sidekick.instances.push(instance);
        }
      }
    });

    this.setProperties({
      primaryContainers: primary,
      sidekicks: sidekicks,
    });
  }.observes('service.instances.[]'),
});
