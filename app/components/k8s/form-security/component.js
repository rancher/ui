import Ember from 'ember';

export default Ember.Component.extend({
  // Inputs
  model: null,

  securityContext: Ember.computed.alias('model.securityContext'),
  cap: Ember.computed.alias('securityContext.capabilities'),
  selinux: Ember.computed.alias('securityContext.seLinuxOptions'),

  didInitAttrs() {
    this.initCapability();
  },

  didInsertElement() {
    this.initMultiselect();
  },

  // ----------------------------------
  // Capability
  // ----------------------------------
  capabilityChoices: null,
  initCapability: function() {
    this.set('cap.add', this.get('cap.add') || []);
    this.set('cap.drop', this.get('cap.drop') || []);
    var choices = this.get('store').getById('schema','container').get('resourceFields.capAdd').options.sort();
    this.set('capabilityChoices',choices);
  },

  initMultiselect: function() {
    var view = this;

    var opts = {
      maxHeight: 200,
      buttonClass: 'btn btn-default',
      buttonWidth: '100%',

      templates: {
        li: '<li><a href="#"><label></label></a></li>',
      },

      buttonText: function(options, select) {
        var label = (select.hasClass('select-cap-add') ? 'Add' : 'Drop') + ": ";
        if ( options.length === 0 )
        {
          label += 'None';
        }
        else if ( options.length === 1 )
        {
          label += $(options[0]).text();
        }
        else
        {
          label += options.length + ' Selected';
        }

        return label;
      },

      onChange: function(/*option, checked*/) {
        var self = this;
        var options = $('option', this.$select);
        var selectedOptions = this.getSelected();
        var allOption = $('option[value="ALL"]',this.$select)[0];

        var isAll = $.inArray(allOption, selectedOptions) >= 0;

        if ( isAll )
        {
          options.each(function(k, option) {
            var $option = $(option);
            if ( option !== allOption )
            {
              self.deselect($(option).val());
              $option.prop('disabled',true);
              $option.parent('li').addClass('disabled');
            }
          });

          // @TODO Figure out why deslect()/select() doesn't fix the state in the ember object and remove this hackery...
          var ary = view.get('cap.' + (this.$select.hasClass('select-cap-add') ? 'add' : 'drop'));
          ary.clear();
          ary.pushObject('ALL');
        }
        else
        {
          options.each(function(k, option) {
            var $option = $(option);
            $option.prop('disabled',false);
            $option.parent('li').removeClass('disabled');
          });
        }

        this.$select.multiselect('refresh');
      }
    };

    this.$('.select-cap-add').multiselect(opts);
    this.$('.select-cap-drop').multiselect(opts);
  },

  privilegedDidChange: function() {
    var add = this.$('.select-cap-add');
    var drop = this.$('.select-cap-drop');
    if ( add && drop )
    {
      if ( this.get('securityContext.privileged') )
      {
        add.multiselect('disable');
        drop.multiselect('disable');
      }
      else
      {
        add.multiselect('enable');
        drop.multiselect('enable');
      }
    }
  }.observes('securityContext.privileged')
});
