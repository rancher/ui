import Ember from 'ember';

// Select that shows id as the label if the key at optionLabelPath is empty
export var OptionView = Ember.SelectOption.extend({
  labelPathDidChange: Ember.observer('parentView.optionLabelPath', function() {
    var labelPath = Ember.get(this, 'parentView.optionLabelPath');
    var valuePath = Ember.get(this, 'parentView.optionValuePath');

    if (!labelPath && !valuePath)
    {
      return;
    }

    Ember.defineProperty(this, 'label', Ember.computed(function() {
      return Ember.get(this, labelPath) || '('+Ember.get(this, valuePath)+')';
    }).property(labelPath, valuePath));
  }),
});

var DisplayNameSelect = Ember.Select.extend({
  optionView: OptionView
});

Ember.Handlebars.helper('display-name-select', DisplayNameSelect);

export default DisplayNameSelect;
