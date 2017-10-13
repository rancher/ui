import Ember from 'ember';
import Driver from 'ui/mixins/driver';
import { validateHostname } from 'ui/utils/validate-dns';

let ioOptimized=[
  {
    value : "none",
  },
  {
    value: "optimized",
  },
];

let systemDiskCategory=[{value:"cloud"}];
let dataDiskCategory=[{value:"cloud"}];
let optimizedDiskCategory=[
  {
    value:"cloud_efficiency",
  },{
    value:"cloud_ssd",
  } 
];

let regions=[
  {
    value:"cn-shenzhen",
  },
  {
    value:"cn-qingdao",
  },
  {
    value:"cn-beijing",
  },
  {
    value:"cn-zhangjiakou",
  },
  {
    value:"cn-hangzhou",
  },
  {
    value:"cn-shanghai",
  },
  {
    value:"cn-hongkong",
  },
  {
    value:"ap-northeast-1",
  },
  {
    value:"ap-southeast-1",
  },
  {
    value:"ap-southeast-2",
  },
  {
    value:"us-east-1",
  },
  {
    value:"us-west-1",
  },
  {
    value:"me-east-1",
  },
  {
    value:"eu-central-1",
  },
];

let instanceType=[];

let notOptimizedinstanceType=[
  {
    value: "ecs.t1.small",
    description:  "ecs.t1.small - 1 CPU,1 GB memory",
  },
  {
    value: "ecs.s1.small",
    description: "ecs.s1.small - 1 CPU,2 GB memory",
  },
  {
    value: "ecs.s1.medium",
    description: "ecs.s1.medium - 1 CPU,4 GB memory",
  },
  {
    value: "ecs.s1.large",
    description: "ecs.s1.large - 1 CPU,8 GB memory",
  },
  {
    value: "ecs.s2.small",
    description: "ecs.s2.small - 2 CPU,2 GB memory",
  },
  {
    value: "ecs.s2.large",
    description: "ecs.s2.large - 2 CPU,4 GB memory",
  },
  {
    value: "ecs.s2.2xlarge",
    description: "ecs.s2.2xlarge - 2 CPU,16 GB memory",
  },
  {
    value: "ecs.s3.medium",
    description: "ecs.s3.medium - 4 CPU,4 GB memory",
  },
  {
    value: "ecs.s3.large",
    description: "ecs.s3.large - 4 CPU,8 GB memory",
  },
  {
    value: "ecs.m1.medium",
    description: "ecs.m1.medium - 4 CPU,16 GB memory",
  },
  {
    value: "ecs.m2.medium",
    description: "ecs.m2.medium - 4 CPU,32 GB memory",
  },
];

let isOptimizedinstanceType=[
  {
    value: "ecs.n1.tiny",
    description: "ecs.n1.tiny - 1 CPU,1 GB memory",
  },
  {
    value: "ecs.n1.small",
    description: "ecs.n1.small - 1 CPU,2 GB memory",
  },
  {
    value: "ecs.n1.medium",
    description: "ecs.n1.medium - 2 CPU,4 GB memory",
  },
  {
    value: "ecs.n1.large",
    description: "ecs.n1.large - 4 CPU,8 GB memory",
  },
  {
    value: "ecs.n1.xlarge",
    description: "ecs.n1.xlarge - 8 CPU,16 GB memory",
  },
  {
    value: "ecs.n1.3xlarge",
    description: "ecs.n1.3xlarge - 16 CPU,32 GB memory",
  },
  {
    value: "ecs.n1.7xlarge",
    description: "ecs.n1.7xlarge - 32 CPU,64 GB memory",
  },
  {
    value: "ecs.n2.small",
    description: "ecs.n2.small - 1 CPU,4 GB memory",
  },
  {
    value: "ecs.n2.medium",
    description: "ecs.n2.medium - 2 CPU,8 GB memory",
  },
  {
    value: "ecs.n2.large",
    description: "ecs.n2.large - 4 CPU,16 GB memory",
  },
  {
    value: "ecs.n2.xlarge",
    description: "ecs.n2.xlarge - 8 CPU,32 GB memory",
  },
  {
    value: "ecs.n2.3xlarge",
    description: "ecs.n2.3xlarge - 16 CPU,64 GB memory",
  },
  {
    value: "ecs.n2.7xlarge",
    description: "ecs.n2.7xlarge - 32 CPU,128 GB memory",
  },
  {
    value: "ecs.e3.small",
    description: "ecs.e3.small - 1 CPU,8 GB memory",
  },
  {
    value: "ecs.e3.medium",
    description: "ecs.e3.medium - 2 CPU,16 GB memory",
  },
  {
    value: "ecs.e3.large",
    description: "ecs.e3.large - 4 CPU,32 GB memory",
  },
  {
    value: "ecs.e3.xlarge",
    description: "ecs.e3.xlarge - 8 CPU,64 GB memory",
  },
  {
    value: "ecs.e3.3xlarge",
    description: "ecs.e3.3xlarge - 16 CPU,128 GB memory",
  },
  {
    value: "ecs.s2.large",
    description: "ecs.s2.large - 2 CPU,4 GB memory",
  },
  {
    value: "ecs.s2.xlarge",
    description: "ecs.s2.xlarge - 2 CPU,8 GB memory",
  },
  {
    value: "ecs.s2.2xlarge",
    description: "ecs.s2.2xlarge - 2 CPU,16 GB memory",
  },
  {
    value: "ecs.s3.medium",
    description: "ecs.s3.medium - 4 CPU,4 GB memory",
  },
  {
    value: "ecs.s3.large",
    description: "ecs.s3.large - 4 CPU,8 GB memory",
  },
  {
    value: "ecs.m1.medium",
    description: "ecs.m1.medium - 4 CPU,16 GB memory",
  },
  {
    value: "ecs.m1.xlarge",
    description: "ecs.m1.xlarge - 8 CPU,32 GB memory",
  },
  {
    value: "ecs.m2.medium",
    description: "ecs.m2.medium - 4 CPU,32 GB memory",
  },
  {
    value: "ecs.m2.xlarge",
    description: "ecs.m2.xlarge - 8 CPU,64 GB memory",
  },
  {
    value: "ecs.c1.small",
    description: "ecs.c1.small - 8 CPU,8 GB memory",
  },
  {
    value: "ecs.c1.large",
    description: "ecs.c1.large - 8 CPU,16 GB memory",
  },
  {
    value: "ecs.c2.medium",
    description: "ecs.c2.medium - 16 CPU,16 GB memory",
  },
  {
    value: "ecs.c2.large",
    description: "ecs.c2.large - 16 CPU,32 GB memory",
  },
  {
    value: "ecs.c2.xlarge",
    description: "ecs.c2.xlarge - 16 CPU,64 GB memory",
  },
  {
    value: "ecs.n4.small",
    description: "ecs.n4.small - 1 CPU,2 GB memory,0.5 Gbps network bandwidth,50k PPS",
  },
  {
    value: "ecs.n4.large",
    description: "ecs.n4.large - 2 CPU,4 GB memory,0.5 Gbps network bandwidth,50k PPS",
  },
  {
    value: "ecs.n4.xlarge",
    description: "ecs.n4.xlarge - 4 CPU,8 GB memory,0.8 Gbps network bandwidth,80k PPS",
  },
  {
    value: "ecs.n4.2xlarge",
    description: "ecs.n4.2xlarge - 8 CPU,16 GB memory,1.2 Gbps network bandwidth,150k PPS",
  },
  {
    value: "ecs.n4.4xlarge",
    description: "ecs.n4.4xlarge - 16 CPU,32 GB memory,2.5 Gbps network bandwidth,300k PPS",
  },
  {
    value: "ecs.n4.8xlarge",
    description: "ecs.n4.8xlarge - 32 CPU,64 GB memory,5 Gbps network bandwidth,500k PPS",
  },
  {
    value: "ecs.mn4.small",
    description: "ecs.mn4.small - 1 CPU,4 GB memory,0.5 Gbps network bandwidth,50k PPS",
  },
  {
    value: "ecs.mn4.large",
    description: "ecs.mn4.large - 2 CPU,8 GB memory,0.5 Gbps network bandwidth,50k PPS",
  },
  {
    value: "ecs.mn4.xlarge",
    description: "ecs.mn4.xlarge - 4 CPU,16 GB memory,0.8 Gbps network bandwidth,80k PPS",
  },
  {
    value: "ecs.mn4.2xlarge",
    description: "ecs.mn4.2xlarge - 8 CPU,32 GB memory,1.2 Gbps network bandwidth,150k PPS",
  },
  {
    value: "ecs.mn4.4xlarge",
    description: "ecs.mn4.4xlarge - 16 CPU,64 GB memory,2.5 Gbps network bandwidth,300k PPS",
  },
  {
    value: "ecs.mn4.8xlarge",
    description: "ecs.mn4.8xlarge - 32 CPU,128 GB memory,5 Gbps network bandwidth,500k PPS",
  },
  {
    value: "ecs.xn4.small",
    description: "ecs.xn4.small - 1 CPU,1 GB memory,0.5 Gbps network bandwidth,50k PPS",
  },
  {
    value: "ecs.e4.small",
    description: "ecs.e4.small - 1 CPU,8 GB memory,0.5 Gbps network bandwidth,50k PPS",
  },
  {
    value: "ecs.sn2.medium",
    description: "ecs.sn2.medium - 2 CPU,8 GB memory,0.5 Gbps network bandwidth,50k PPS",
  },
  {
    value: "ecs.sn2.large",
    description: "ecs.sn2.large - 4 CPU,16 GB memory,0.8 Gbps network bandwidth,100k PPS",
  },
  {
    value: "ecs.sn2.xlarge",
    description: "ecs.sn2.xlarge - 8 CPU,32 GB memory,1.5 Gbps network bandwidth,200k PPS",
  },
  {
    value: "ecs.sn2.3xlarge",
    description: "ecs.sn2.3xlarge - 16 CPU,64 GB memory,3 Gbps network bandwidth,400k PPS",
  },
  {
    value: "ecs.sn2.13xlarge",
    description: "ecs.sn2.13xlarge - 56 CPU,224 GB memory,10 Gbps network bandwidth,1200k PPS",
  },
  {
    value: "ecs.sn2ne.large",
    description: "ecs.sn2ne.large - 2 CPU,8 GB memory,1 Gbps network bandwidth,300k PPS",
  },
  {
    value: "ecs.sn2ne.xlarge",
    description: "ecs.sn2ne.xlarge - 4 CPU,16 GB memory,1.5 Gbps network bandwidth,500k PPS",
  },
  {
    value: "ecs.sn2ne.2xlarge",
    description: "ecs.sn2ne.2xlarge - 8 CPU,32 GB memory,2 Gbps network bandwidth,1m PPS",
  },
  {
    value: "ecs.sn2ne.4xlarge",
    description: "ecs.sn2ne.4xlarge - 16 CPU,64 GB memory,3 Gbps network bandwidth,1600k PPS",
  },
  {
    value: "ecs.sn2ne.8xlarge",
    description: "ecs.sn2ne.8xlarge - 32 CPU,128 GB memory,6 Gbps network bandwidth,2500k PPS",
  },
  {
    value: "ecs.sn2ne.14xlarge",
    description: "ecs.sn2ne.14xlarge - 56 CPU,224 GB memory,10 Gbps network bandwidth,4500k PPS",
  },
  {
    value: "ecs.sn1.medium",
    description: "ecs.sn1.medium - 2 CPU,4 GB memory,0.5 Gbps network bandwidth,50k PPS",
  },
  {
    value: "ecs.sn1.large",
    description: "ecs.sn1.large - 4 CPU,8 GB memory,0.8 Gbps network bandwidth,100k PPS",
  },
  {
    value: "ecs.sn1.xlarge",
    description: "ecs.sn1.xlarge - 8 CPU,16 GB memory,1.5 Gbps network bandwidth,200k PPS",
  },
  {
    value: "ecs.sn1.3xlarge",
    description: "ecs.sn1.3xlarge - 16 CPU,32 GB memory,3 Gbps network bandwidth,400k PPS",
  },
  {
    value: "ecs.sn1.7xlarge",
    description: "ecs.sn1.7xlarge - 32 CPU,64 GB memory,6 Gbps network bandwidth,800k PPS",
  },
  {
    value: "ecs.sn1ne.large",
    description: "ecs.sn1ne.large - 2 CPU,4 GB memory,1 Gbps network bandwidth,300k PPS",
  },
  {
    value: "ecs.sn1ne.xlarge",
    description: "ecs.sn1ne.xlarge - 4 CPU,8 GB memory,1.5 Gbps network bandwidth,500k PPS",
  },
  {
    value: "ecs.sn1ne.2xlarge",
    description: "ecs.sn1ne.2xlarge - 8 CPU,16 GB memory,2 Gbps network bandwidth,1m PPS",
  },
  {
    value: "ecs.sn1ne.4xlarge",
    description: "ecs.sn1ne.4xlarge - 16 CPU,32 GB memory,3 Gbps network bandwidth,1600k PPS",
  },
  {
    value: "ecs.sn1ne.8xlarge",
    description: "ecs.sn1ne.8xlarge - 32 CPU,64 GB memory,6 Gbps network bandwidth,2500k PPS",
  },
  {
    value: "ecs.se1.xlarge",
    description: "ecs.se1.xlarge - 4 CPU,32 GB memory,0.8 Gbps network bandwidth,100k PPS",
  },
  {
    value: "ecs.se1.2xlarge",
    description: "ecs.se1.2xlarge - 8 CPU,64 GB memory,1.5 Gbps network bandwidth,200k PPS",
  },
  {
    value: "ecs.se1.4xlarge",
    description: "ecs.se1.4xlarge - 16 CPU,128 GB memory,3 Gbps network bandwidth,400k PPS",
  },
  {
    value: "ecs.se1.8xlarge",
    description: "ecs.se1.8xlarge - 32 CPU,256 GB memory,6 Gbps network bandwidth,800k PPS",
  },
  {
    value: "ecs.se1.14xlarge",
    description: "ecs.se1.14xlarge - 56 CPU,480 GB memory,10 Gbps network bandwidth,1200k PPS",
  },
  {
    value: "ecs.se1ne.large",
    description: "ecs.se1ne.large - 2 CPU,16 GB memory,1 Gbps network bandwidth,300k PPS",
  },
  {
    value: "ecs.se1ne.xlarge",
    description: "ecs.se1ne.xlarge - 4 CPU,32 GB memory,1.5 Gbps network bandwidth,500k PPS",
  },
  {
    value: "ecs.se1ne.2xlarge",
    description: "ecs.se1ne.2xlarge - 8 CPU,64 GB memory,2 Gbps network bandwidth,1m PPS",
  },
  {
    value: "ecs.se1ne.4xlarge",
    description: "ecs.se1ne.4xlarge - 16 CPU,128 GB memory,3 Gbps network bandwidth,1600k PPS",
  },
  {
    value: "ecs.se1ne.8xlarge",
    description: "ecs.se1ne.8xlarge - 32 CPU,256 GB memory,6 Gbps network bandwidth,2500k PPS",
  },
  {
    value: "ecs.se1ne.14xlarge",
    description: "ecs.se1ne.14xlarge - 56 CPU,480 GB memory,10 Gbps network bandwidth,4500k PPS",
  },
  {
    value: "ecs.d1.2xlarge",
    description: "ecs.d1.2xlarge - 8 CPU,32 GB memory,3 Gbps network bandwidth,300k PPS",
  },
  {
    value: "ecs.d1.4xlarge",
    description: "ecs.d1.4xlarge - 16 CPU,64 GB memory,6 Gbps network bandwidth,600k PPS",
  },
  {
    value: "ecs.d1.6xlarge",
    description: "ecs.d1.6xlarge - 24 CPU,96 GB memory,8 Gbps network bandwidth,800k PPS",
  },
  {
    value: "ecs.d1.8xlarge",
    description: "ecs.d1.8xlarge - 32 CPU,128 GB memory,10 Gbps network bandwidth,1m PPS",
  },
  {
    value: "ecs.d1.14xlarge",
    description: "ecs.d1.14xlarge - 56 CPU,224 GB memory,17 Gbps network bandwidth,1800k PPS",
  },
  {
    value: "ecs.i1.xlarge",
    description: "ecs.i1.xlarge - 8 CPU,16 GB memory,0.8 Gbps network bandwidth,100k PPS",
  },
  {
    value: "ecs.i1.2xlarge",
    description: "ecs.i1.2xlarge - 8 CPU,32 GB memory,1.5 Gbps network bandwidth,200k PPS",
  },
  {
    value: "ecs.i1.4xlarge",
    description: "ecs.i1.4xlarge - 16 CPU,64 GB memory,3 Gbps network bandwidth,400k PPS",
  },
  {
    value: "ecs.i1-c5d1.4xlarge",
    description: "ecs.i1-c5d1.4xlarge - 16 CPU,64 GB memory,3 Gbps network bandwidth,400k PPS",
  },
  {
    value: "ecs.i1.8xlarge",
    description: "ecs.i1.8xlarge - 32 CPU,128 GB memory,6 Gbps network bandwidth,800k PPS",
  },
  {
    value: "ecs.i1-c10d1.8xlarge",
    description: "ecs.i1-c10d1.8xlarge - 32 CPU,128 GB memory,6 Gbps network bandwidth,800k PPS",
  },
  {
    value: "ecs.i1.14xlarge",
    description: "ecs.i1.14xlarge - 56 CPU,224 GB memory,10 Gbps network bandwidth,1200k PPS",
  },
  {
    value: "ecs.cm4.xlarge",
    description: "ecs.cm4.xlarge - 4 CPU,16 GB memory,1.5 Gbps network bandwidth,200k PPS",
  },
  {
    value: "ecs.cm4.2xlarge",
    description: "ecs.cm4.2xlarge - 8 CPU,32 GB memory,3 Gbps network bandwidth,400k PPS",
  },
  {
    value: "ecs.cm4.4xlarge",
    description: "ecs.cm4.4xlarge - 16 CPU,64 GB memory,6 Gbps network bandwidth,800k PPS",
  },
  {
    value: "ecs.cm4.6xlarge",
    description: "ecs.cm4.6xlarge - 24 CPU,96 GB memory,10 Gbps network bandwidth,1200k PPS",
  },
  {
    value: "ecs.ce4.xlarge",
    description: "ecs.ce4.xlarge - 4 CPU,32 GB memory,1.5 Gbps network bandwidth,200k PPS",
  },
  {
    value: "ecs.c4.xlarge",
    description: "ecs.c4.xlarge - 4 CPU,8 GB memory,1.5 Gbps network bandwidth,200k PPS",
  },
  {
    value: "ecs.c4.2xlarge",
    description: "ecs.c4.2xlarge - 8 CPU,16 GB memory,3 Gbps network bandwidth,400k PPS",
  },
  {
    value: "ecs.c4.4xlarge",
    description: "ecs.c4.4xlarge - 16 CPU,32 GB memory,6 Gbps network bandwidth,800k PPS",
  },
];

export default Ember.Component.extend(Driver, {
  driverName       : 'aliyunecs',
  aliyunecsConfig      : Ember.computed.alias('model.aliyunecsConfig'),
  ioOptimized : ioOptimized,
  instanceType: instanceType,
  dataDiskCategory: dataDiskCategory,
  systemDiskCategory: systemDiskCategory,
  regions: regions,
  intl: Ember.inject.service(),
  settings: Ember.inject.service(),
  ioOptimizedObserves: function(){
    if (this.get('aliyunecsConfig.ioOptimized')==='none'){
      this.set('instanceType',notOptimizedinstanceType);
      this.set('dataDiskCategory',[{value:"cloud"}]);
      this.set('systemDiskCategory',[{value:"cloud"}]);
    }
    else {
      this.set('instanceType',isOptimizedinstanceType);
      this.set('dataDiskCategory',optimizedDiskCategory);
      this.set('systemDiskCategory',optimizedDiskCategory);
    }
  }.observes('aliyunecsConfig.ioOptimized'),
  bootstrap: function() {
    let config = this.get('store').createRecord({
      type                  : 'aliyunecsConfig',
    });
    this.set('instanceType',notOptimizedinstanceType);
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
      if (!validateHostname(name)){
        errors.push(this.get('intl').t('machine.driverAliyunecs.errors.nameNotValidForApp',{appName: this.get('settings.appName')}));
      }
      //name length rules
      if (name.length<2){
        errors.push(this.get('intl').t('machine.driverAliyunecs.errors.nameTooShort'));
      }
      //check '.','-' can not be used as the first letter and the last letter
      if (!/^[a-zA-Z]([\.]?[a-zA-Z0-9\-]+[\.]?)*[a-zA-Z0-9]$/.test(name)){
        errors.push(this.get('intl').t('machine.driverAliyunecs.errors.nameNotValid'));
      }
      //windows hostname can not have more than 15 letter. And we should not use windows image to setup a host, so we don't need to validate name for windows hostname.
      
      //linux hostname can not have more than 128 letter.
      if (name.length>128){
        errors.push(this.get('intl').t('machine.driverAliyunecs.errors.nameTooLong'));
      }
    }
    var accessKey = this.get('aliyunecsConfig.accessKeyId');
    var accessSecret = this.get('aliyunecsConfig.accessKeySecret');
    if (!accessKey){
      errors.push(this.get('intl').t('machine.driverAliyunecs.errors.accessKeyRequired'));
    }
    if (!accessSecret){
      errors.push(this.get('intl').t('machine.driverAliyunecs.errors.accessSecretRequired'));
    }
    var sshPassword = this.get('aliyunecsConfig.sshPassword');
    if (sshPassword && (sshPassword.length<8) || sshPassword.length>30){
      errors.push(this.get('intl').t('machine.driverAliyunecs.errors.sshPasswordLengthNotValid'));
    }
    if (sshPassword&&!/[?+*$^().|<>';:\-=\[\]\{\},&%#@!~`\\a-zA-Z0-9]+/.test(sshPassword)) {
      errors.push(this.get('intl').t('machine.driverAliyunecs.errors.sshPasswordInvalidCharacter'));
    }
    var lower = /[a-z]/.test(sshPassword) ? 1:0;
    var upper = /[A-Z]/.test(sshPassword) ? 1:0;
    var number = /[0-9]/.test(sshPassword) ? 1:0;
    var special = /[?+*$^().|<>';:\-=\[\]\{\},&%#@!~`\\]/.test(sshPassword) ? 1:0;
    if (sshPassword&&(lower + upper + number + special <3)) {
      errors.push(this.get('intl').t('machine.driverAliyunecs.errors.sshPasswordFormatError'));
    }
    this.set('errors', errors);
    return !errors.length;
  },
});
