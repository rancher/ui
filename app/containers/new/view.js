import Ember from 'ember';

export function addAction(action, selector) {
  return function() {
    this.get('controller').send(action);
    Ember.run.next(this, function() {
      this.$(selector).last().focus();
    });
  };
}

export default Ember.View.extend({
  actions: {
    addEnvironment: addAction('addEnvironment', '.environment-name'),
    addPort:        addAction('addPort',        '.port-public'),
    addLink:        addAction('addLink',        '.link-container'),
    addVolume:      addAction('addVolume',      '.volume-path'),
    addVolumeFrom:  addAction('addVolumeFrom',  '.volumefrom-container'),
    addDns:         addAction('addDns',         '.dns-value'),
    addDnsSearch:   addAction('addDnsSearch',   '.dns-search-value'),
    addDevice:      addAction('addDevice',      '.device-host'),

    selectTab: function(name) {
      this.set('context.tab',name);
      this.$('.tab').removeClass('active');
      this.$('.tab[data-section="'+name+'"]').addClass('active');
      this.$('.section').addClass('hide');
      this.$('.section[data-section="'+name+'"]').removeClass('hide');
    }
  },

  didInsertElement: function() {
    $('BODY').addClass('white');
    this._super();
    this.send('selectTab',this.get('context.tab'));

    // Cap add/drop multiselects
    this.initMultiselect();
    this.$('INPUT')[0].focus();
  },

  willDestroyElement: function() {
    $('BODY').removeClass('white');
  },

  initMultiselect: function() {
    var view = this;

    var opts = {
      maxHeight: 200,
      buttonClass: 'btn btn-default',
      buttonWidth: '100%',

      templates: {
        li: '<li><a><label></label></a></li>',
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
          var ary = view.get('context.instance.' + (this.$select.hasClass('select-cap-add') ? 'capAdd' : 'capDrop'));
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
