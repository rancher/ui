import Ember from 'ember';
/* global ZeroClipboard */

var COPY = 'Copy to Clipboard';

export default Ember.Component.extend({
  text: '',
  tooltip: COPY,
  block: false,
  icon: 'fa fa-copy',
  label: '',

  tagName: 'button',
  classNames: ['zeroclip','btn'],
  classNameBindings: ['block::small','block:btn-primary:btn-link'],
  attributeBindings: ['data-clipboard-text', 'data-clipboard-target','tooltip'],
  clip: null,

  "data-clipboard-text": function(){
    return this.get('text');
  }.property('text'),

  "data-clipboard-target": function(){
    return this.get('cbTarget');
  }.property('cbTarget'),

  didInsertElement: function () {
    var client = new ZeroClipboard(this.get('element'));
    this.set('clip', client);

    client.on('aftercopy', Ember.run.bind(this, function(event) {
      try {
        this.set('tooltip','Copied!');
        this.$().tooltip('show');

        Ember.run.later(this, () => {
          this.get('element').blur();
          this.set('tooltip', COPY);
        }, 500);
      } catch(e) {}

      this.sendAction('action', event);
    }));

    client.on('error', Ember.run.bind(this, function() {
      this.set('tooltip', 'Copy to Clipboard not available');
      this.$().hide();
    }));

    this.$().tooltip({
      animation: false,
      title: () => {
        return this.get('tooltip');
      },
    });
  },

  willDestroyElement: function() {
    this.get('clip').destroy();
    this.$().tooltip('destroy');
  },

  render: function (buffer) {
    if ( this.get('text') )
    {
      var icon = this.get('icon');
      var label = this.get('label');
      if ( icon )
      {
        buffer.push('<i class="'+ this.get('icon') + '"></i> ');
      }

      if ( label )
      {
        buffer.push(label);
      }
    }
  },

  stateChanged: function() {
      this.rerender();
  }.observes('icon','label','text')
});
