import Ember from 'ember';

// Select that shows id as the label if the key at optionLabelPath is empty
export var OptionView = Ember.SelectOption.extend({
  labelPathDidChange: Ember.observer('parentView.optionLabelPath', function() {
    Ember.defineProperty(this, 'label', Ember.computed(function() {
      var email = Ember.get(this, 'content.email');
      var pub = Ember.get(this,'content.publicValue');

      if ( email && pub )
      {
        return email + ' - ' + pub;
      }
      else if ( email )
      {
        return email;
      }
      else if ( pub )
      {
        return pub;
      }
      else
      {
        return '(' + Ember.get(this,'content.id') + ')';
      }
    }).property('content.{email,publicValue}'));
  }),
});

var RegistryCredentialSelect = Ember.Select.extend({
  optionView: OptionView
});

Ember.Handlebars.helper('registry-credential-select', RegistryCredentialSelect);

export default RegistryCredentialSelect;
