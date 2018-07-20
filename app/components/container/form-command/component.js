import { get, set, observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  intl: service(),

  layout,

  // Inputs
  instance:           null,
  errors:             null,
  editing:            true,
  service:            null,
  isSidekick:         null,
  scaleMode:          null,

  // ----------------------------------
  terminal:          null,
  statusClass:       null,
  status:            null,

  init() {
    this._super(...arguments);
    this.initTerminal();
    this.scaleModeDidChange();
  },

  terminalDidChange: observer('terminal.type', function() {
    var val = get(this, 'terminal.type');
    var stdin = ( val === 'interactive' || val === 'both' );
    var tty = (val === 'terminal' || val === 'both');

    set(this, 'instance.tty', tty);
    set(this, 'instance.stdin', stdin);
  }),

  scaleModeDidChange: observer('scaleMode', function() {
    const restartPolicy = get(this, 'service.restartPolicy');

    if ( get(this, 'isJob') ) {
      if ( restartPolicy === 'Always' ) {
        set(this, 'service.restartPolicy', 'Never');
      }
    } else {
      set(this, 'service.restartPolicy', 'Always');
    }
  }),

  isJob: computed('scaleMode', function() {
    return get(this, 'scaleMode') === 'job' || get(this, 'scaleMode') === 'cronJob';
  }),

  // ----------------------------------
  // Terminal
  // 'both',
  initTerminal() {
    var instance = get(this, 'instance');
    var tty = get(instance, 'tty');
    var stdin = get(instance, 'stdin');
    var out = {
      type: 'both',
      name: get(this, 'intl').tHtml('formCommand.console.both'),
    };

    if ( tty !== undefined || stdin !== undefined ) {
      if ( tty && stdin ) {
        out.type = 'both';
        out.name = get(this, 'intl').tHtml('formCommand.console.both');
      } else if ( tty ) {
        out.type = 'terminal';
        out.name = get(this, 'intl').tHtml('formCommand.console.terminal');
      } else if ( stdin ) {
        out.type = 'interactive';
        out.name = get(this, 'intl').tHtml('formCommand.console.interactive');
      } else {
        out.type = 'none';
        out.name = get(this, 'intl').tHtml('formCommand.console.none');
      }
    }

    set(this, 'terminal', out);
    this.terminalDidChange();
  }
});
