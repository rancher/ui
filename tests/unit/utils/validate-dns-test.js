import { module, test } from 'qunit';
import {validateHostname} from "ui/utils/validate-dns";

module('Unit | Utils | validate-dns');

//test case
let hostnames = [
    {str:"aA0",result:true},
    {str:"a",result:true},
    //chec for dot
    {str:".aA0",result:false},
    {str:"aA0.",result:true},
    {str:"a.A0",result:true},
    {str:"a..A0",result:false},
    //check for dash
    {str:"a-A0",result:true},
    {str:"-aA0",result:false},
    {str:"aA0-",result:false},
    {str:"a--A0",result:false},
    //check for specifical character
    {str:"aA0/",result:false},
    {str:"a/A0",result:false},
    {str:"/aA0",result:false},
    //check for length
    {str:"",result:false},
    {str:"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678900",result:true},
    {str:"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789000",result:false},
    {str:"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678900.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678900.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",result:true},
    {str:"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678900.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678900.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678900.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",result:false},
];

hostnames.forEach(function(element) {
    var input = element.str;
    var result = validateHostname(input);
    test("validating "+input,function(assert){assert.strictEqual(result,element.result,'validate correctly');});
}, this);