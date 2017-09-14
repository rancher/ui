import Ember from 'ember';
import Driver from 'ui/mixins/driver';

let ioOptimized=[
  {
    value : "none",
  },
  {
    value: "optimized",
  },
];

export default Ember.Component.extend(Driver, {
  driverName       : 'aliyunecs',
  aliyunecsConfig      : Ember.computed.alias('model.aliyunecsConfig'),
  ioOptimized : ioOptimized,


  bootstrap: function() {
    let config = this.get('store').createRecord({
      type                  : 'aliyunecsConfig',
    });

    this.set('model', this.get('store').createRecord({
      type: 'host',
      aliyunecsConfig: config,
    }));
    this.set('model.engineRegistryMirror',['https://s06nkgus.mirror.aliyuncs.com']);
    this.set('model.engineInstallUrl','http://dev-tool.oss-cn-shenzhen.aliyuncs.com/docker-install/1.12.6.sh');
    //this.set('editing', false);
  },
  validate: function(){
    this._super();
    var errors = this.get('errors') || [];
    var name = this.get('model.hostname');
    if (name) {
      //name length rules
      if (name.length<2){
        errors.push("Name should have more then 2 letters.");
      }
      //check '.','-' can not be used as the first letter and the last letter
      if (!/^[a-zA-Z0-9]([\.-]?[a-zA-Z0-9]+[\.-]?)*[a-zA-Z0-9]$/.test(name)){
        errors.push("Name doesn't match the rule of Aliyunecs hostname rule");
      }
      //windows hostname can not have more than 15 letter. And we should not use windows image to setup a host, so we don't need to validate name for windows hostname.

      //linux hostname can not have more than 30 letter.
      if (name.length>30){
        errors.push("The hostname can not have more then 30 letters.");
      }
    }
    var accessKey = this.get('aliyunecsConfig.accessKeyId');
    var accessSecret = this.get('aliyunecsConfig.accessKeySecret');
    if (!accessKey){
      errors.push("Access key is required.");
    }
    if (!accessSecret){
      errors.push("Access Secret is required");
    }
    var sshPassword = this.get('aliyunecsConfig.sshPassword');
    if (sshPassword && (sshPassword.length<8) || sshPassword.length>30){
      errors.push("SSH Password should have at least 8 chatacter and less then 30 chatacter");
    }
    if (sshPassword&&!/[?+*$^().|<>';:\-=\[\]\{\},&%#@!~`\\a-zA-Z0-9]+/.test(sshPassword)) {
      errors.push("SSH Password has invalid charaters.");
    }
    var lower = /[a-z]/.test(sshPassword) ? 1:0;
    var upper = /[A-Z]/.test(sshPassword) ? 1:0;
    var number = /[0-9]/.test(sshPassword) ? 1:0;
    var special = /[?+*$^().|<>';:\-=\[\]\{\},&%#@!~`\\]/.test(sshPassword) ? 1:0;
    if (sshPassword&&(lower + upper + number + special <3)) {
      errors.push("SSH Password needs to containe 3 different kinds of charater, 3 in upper, lower, number and special.");
    }
    this.set('errors', errors);
    return !errors.length;
  },
});
