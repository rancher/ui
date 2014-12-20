import Ember from 'ember';
import OverlayEdit from "ui/views/overlay-edit";

export default OverlayEdit.extend({
  templateName: 'hosts/container-new',

  actions: {
    addArgument: function() {
      var self = this;
      this.controller.send('addArgument');
      Ember.run.next(function() {
        self.$('.argument-name').last().focus();
      });
    },

    addEnvironment: function() {
      var self = this;
      this.controller.send('addEnvironment');
      Ember.run.next(function() {
        self.$('.environment-name').last().focus();
      });
    },

    addPort: function() {
      var self = this;
      this.controller.send('addPort');
      Ember.run.next(function() {
        self.$('.port-public').last().focus();
      });
    },

    addLink: function() {
      var self = this;
      this.controller.send('addLink');
      Ember.run.next(function() {
        self.$('.link-container').last().focus();
      });
    },

    addVolume: function() {
      var self = this;
      this.controller.send('addVolume');
      Ember.run.next(function() {
        self.$('.volume-path').last().focus();
      });
    },

    addVolumeFrom: function() {
      var self = this;
      this.controller.send('addVolumeFrom');
      Ember.run.next(function() {
        self.$('.volumefrom-container').last().focus();
      });
    },

    addDns: function() {
      var self = this;
      this.controller.send('addDns');
      Ember.run.next(function() {
        self.$('.dns-value').last().focus();
      });
    },

    addDnsSearch: function() {
      var self = this;
      this.controller.send('addDnsSearch');
      Ember.run.next(function() {
        self.$('.dns-search-value').last().focus();
      });
    },

    addLxc: function() {
      var self = this;
      this.controller.send('addLxc');
      Ember.run.next(function() {
        self.$('.lxc-key').last().focus();
      });
    },

    selectTab: function(name) {
      this.set('context.tab',name);
      this.$('.tab').removeClass('active');
      this.$('.tab[data-section="'+name+'"]').addClass('active');
      this.$('.section').addClass('hide');
      this.$('.section[data-section="'+name+'"]').removeClass('hide');
    }
  },

  didInsertElement: function() {
    this._super();
    this.send('selectTab',this.get('context.tab'));

    var view = this;

    var opts = {
      maxHeight: 200,
      buttonClass: 'btn btn-default',
      buttonWidth: '100%',
      numberDisplayed: 2,

      templates: {
        li: '<li><a><label></label></a></li>',
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
          var ary = view.get('context.' + (this.$select.hasClass('select-cap-add') ? 'capAdd' : 'capDrop'));
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

  priviligedDidChange: function() {
    var add = this.$('.select-cap-add');
    var drop = this.$('.select-cap-drop');
    if ( add && drop )
    {
      if ( this.get('controller.privileged') )
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
  }.observes('controller.privileged')
});
