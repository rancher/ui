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

  didReceiveAttrs() {
    this.serviceChanged();
  },

  stateBackground: function() {
    return this.get('service.stateColor').replace("text-", "bg-");
  }.property('service.stateColor'),

  showChanged: function() {
    if (this.get('show'))
    {
      $('.stacks-wrap').addClass('summary-shown');
      this.$().show().animate({height: '260px'}, 250, 'easeOutBack');
    }
    else
    {
      this.$().animate({height: '0'}, 250, () => {
        if ( this._state === 'inDOM' )
        {
          this.$().hide();
        }

        $('.stacks-wrap').removeClass('summary-shown');
      });

      this.setProperties({
        primaryContainers: null,
        sidekicks: null,
        service: null,
      });
    }
  }.observes('show'),

  primaryContainers: null,
  sidekicks: null,
  serviceChanged: function() {
    if ( !this.get('service') )
    {
      return;
    }

    this.initLabels(this.get('service.launchConfig.labels'));
    this.set('activeTab','');

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

      if ( C.REMOVEDISH_STATES.includes(instance.state) )
      {
        return;
      }

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
  }.observes('service.instances.@each.{state,labels}'),
});
