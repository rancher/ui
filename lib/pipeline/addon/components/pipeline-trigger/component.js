import Component from '@ember/component';
import { timezones } from 'pipeline/utils/timezones';
import { alias } from '@ember/object/computed';
import { observer } from '@ember/object';
import layout from './template'

export default Component.extend({
  layout,
  timezones: timezones,
  selected: '',
  selectedText:'',
  edit: true,
  cronA: '04',
  cronB: '00',
  cron: {
    hour: '04',
    min: '00'
  },
  state:{
    setCustomCron: false
  },
  customCron: '0 4 * * *',
  cronType: 'everyday',
  pipeline: alias('modalOpts.pipeline'),
  webhookDisabled: function(){
    let admin = this.get('selectedRepo.permissions.admin');
    return !admin;
  }.property('selectedRepo.permissions.{admin}'),
  init(){
    this._super(...arguments);
  },
  initTimeZone: function(){
    var triggerCronExpression = this.get('pipeline.triggerCronExpression');
    if (triggerCronExpression) {
      this.set('state.setCustomCron', true);
      this.set('customCron', triggerCronExpression);
      this.set('cronType', 'custom');
    }else{
      this.set('state.setCustomCron', false);
      this.set('cronType', 'everyday');
    }
  },
  customCronOberve: function(){
    let customCron = this.get('customCron');
    let state = this.get('state');
    if(state.setCustomCron){
      this.set('pipeline.triggerCronExpression', customCron);
    }
  }.observes('customCron'),
  cronObserve: observer('cron.{hour,min}','cronType',function(){
    let cron = this.get('cron');
    let cronType = this.get('cronType');
    if(cronType === 'everyday'){
      let cronSyntax = `${cron.min} ${cron.hour} * * *`;
      this.set('customCron', cronSyntax);
    }
  }),
  setCustomCronObeseve: function(){
    let state = this.get('state');
    var triggerCronExpression = this.get('pipeline.triggerCronExpression');
    if(state.setCustomCron){
      if(!triggerCronExpression){
        var t = new Date();
        var timeZone = -t.getTimezoneOffset() / 60;
        let selected = timezones.find(ele => (ele.offset === timeZone)&&ele.utcStr&&!ele.isdst);
        this.set('pipeline.triggerCronTimezone', selected.utcStr);
        this.set('cronType','everyday');
        this.set('cron',{
          hour: '04',
          min: '00'
        });
      }
    }else{
      this.set('pipeline.triggerCronExpression', '');
    }
  }.observes('state.setCustomCron'),
  observeOptionsChange: function(){
    let trigger={
      webhook: this.get('pipeline.triggerWebhook'),
      cron: !!this.get('state.setCustomCron')
    }
    this.sendAction('triggerOptionsChange', trigger);
  }.observes('pipeline.triggerWebhook', 'state.setCustomCron'),
  didInsertElement(){
    this.initTimeZone();
    this.cronObserve();
  }
});
