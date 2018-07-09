import Component from '@ember/component';
import { timezones } from 'pipeline/utils/timezones';
import { alias } from '@ember/object/computed';
import { observer } from '@ember/object';
import layout from './template'
import { set, get } from '@ember/object';

export default Component.extend({
  layout,
  timezones,
  selected:     '',
  selectedText: '',
  edit:         true,
  cronA:        '04',
  cronB:        '00',
  cron:         {
    hour: '04',
    min:  '00'
  },
  state:           { setCustomCron: false },
  customCron:      '0 4 * * *',
  cronType:        'everyday',
  pipeline:        alias('modalOpts.pipeline'),
  webhookDisabled: function(){

    let admin = get(this, 'selectedRepo.permissions.admin');

    return !admin;

  }.property('selectedRepo.permissions.{admin}'),
  customCronOberve: function(){

    let customCron = get(this, 'customCron');
    let state = get(this, 'state');

    if (state.setCustomCron){

      set(this, 'pipeline.triggerCronExpression', customCron);

    }

  }.observes('customCron'),
  setCustomCronObeseve: function(){

    let state = get(this, 'state');
    var triggerCronExpression = get(this, 'pipeline.triggerCronExpression');

    if (state.setCustomCron){

      if (!triggerCronExpression){

        var t = new Date();
        var timeZone = -t.getTimezoneOffset() / 60;
        let selected = timezones.find((ele) => (ele.offset === timeZone) && ele.utcStr && !ele.isdst);

        set(this, 'pipeline.triggerCronTimezone', selected.utcStr);
        set(this, 'cronType', 'everyday');
        set(this, 'cron', {
          hour: '04',
          min:  '00'
        });

      }

    } else {

      set(this, 'pipeline.triggerCronExpression', '');

    }

  }.observes('state.setCustomCron'),
  observeOptionsChange: function(){

    let trigger = {
      webhook: get(this, 'pipeline.triggerWebhookPush'),
      cron:    !!get(this, 'state.setCustomCron')
    }

    this.sendAction('triggerOptionsChange', trigger);

  }.observes('pipeline.triggerWebhookPush', 'state.setCustomCron'),
  cronObserve: observer('cron.{hour,min}', 'cronType', function(){

    let cron = get(this, 'cron');
    let cronType = get(this, 'cronType');

    if (cronType === 'everyday'){

      let cronSyntax = `${ cron.min } ${ cron.hour } * * *`;

      set(this, 'customCron', cronSyntax);

    }

  }),
  init(){

    this._super(...arguments);

  },
  didInsertElement(){

    this.initTimeZone();
    this.cronObserve();

  },
  initTimeZone(){

    var triggerCronExpression = get(this, 'pipeline.triggerCronExpression');

    if (triggerCronExpression) {

      set(this, 'state.setCustomCron', true);
      set(this, 'customCron', triggerCronExpression);
      set(this, 'cronType', 'custom');

    } else {

      set(this, 'state.setCustomCron', false);
      set(this, 'cronType', 'everyday');

    }

  },
});
