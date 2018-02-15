import Component from '@ember/component';
import { timezones } from 'pipeline/utils/timezones';
import { alias } from '@ember/object/computed';
import { on } from '@ember/object/evented';
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
  init(){
    this._super(...arguments);
  },
  initTimeZone: function(){
    var triggerCronExpression = this.get('pipeline.triggerCronExpression');
    if (triggerCronExpression) {
      this.set('state.setCustomCron', true);
    }else{
      this.set('state.setCustomCron', false);
    }
  },
  customCronOberve: function(){
    let customCron = this.get('customCron');
    let state = this.get('state');
    if(state.setCustomCron){
      this.set('pipeline.triggerCronExpression', customCron);
    }
  }.observes('customCron'),
  cronObserve: on('init', observer('cron.{hour,min}','cronType',function(){
    let cron = this.get('cron');
    let cronType = this.get('cronType');
    if(cronType === 'everyday'){
      let cronSyntax = `${cron.min} ${cron.hour} * * *`;
      this.set('customCron', cronSyntax);
    }
  })),
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
  didInsertElement(){
    this.initTimeZone();
  }
});
