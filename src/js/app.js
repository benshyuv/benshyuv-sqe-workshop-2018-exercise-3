import $ from 'jquery';
import {parseCode,input_vector,var_map,order} from './code-analyzer';

let input = false;
let variablesMap = {};
let result = [];

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let variablesValue = $('#variablesArea').val();
        variablesMap = variablesValue.split(',');
        if (variablesMap.length>1) input = true;
        let parsedCode = parseCode(codeToParse,input);
        result = parsedCode;
        parseValues();
        parseFunc();
        let resultStr = makeString();
        const flowchart = require('flowchart.js');
        var diagram = flowchart.parse(resultStr);
        diagram.drawSVG('diagram',
            {'flowstate' : {
                'past' : { 'fill' : 'white', 'font-size' : 12},
                'current' : {'fill' : 'green', 'font-color' : 'black', 'font-weight' : 'bold', 'element-color' : 'black'},
                'future' : { 'fill' : 'white'},
                'request' : { 'fill' : 'white'},
            }});  }); });

function parseValues(){
    var j = 0;
    for (var i in input_vector) {
        if (j < variablesMap.length) {
            let name = i;
            let value = variablesMap[j];
            j++;
            input_vector[name] = value;
        }
    }
}

function parseFunc(){
    let i = 0;
    while (i<result.length){
        if (result[i].includes('cond')){
            if (result[i].includes('|current'))
                result[i] = result[i].substring(0,result[i].indexOf('|'));
            let ind = result[i].indexOf(':');
            let replaceTest = replaceVar(result[i].substring(ind+1,result[i].length),false);
            replaceTest = replaceVar(replaceTest,true);
            if (input) {
                i = colorCond(replaceTest,i);
            }
        }
        i++;
    }
}

function colorCond(replaceTest,i){
    result[i] += '|current';
    if (eval(replaceTest)) {
        i++;
        result[i] += '|current';
        if (result[i+1].includes('|current'))
            result[i+1] = result[i+1].substring(0,result[i+1].indexOf('|'));
    }
    else {
        if (result[i+2].includes('|current'))
            result[i] = result[i].substring(0,result[i].indexOf('|'));
        else
            result[i + 2] += '|current';
    }
    return i;
}

function makeString(){
    let resultStr = '';
    for (var i in result){
        resultStr += result[i] + '\n';
    }
    resultStr += '\n';
    for (var j in order){
        resultStr += order[j] + '\n';
    }
    return resultStr;
}

function replaceVar(value, isInput) {
    let original_value = value;
    let array = value.split(/[\s,]+/);
    for (var i in array) {
        value = replaceTheVar(value, array, i, isInput);
    }
    var ans = value.replace(original_value, value);
    return ans;
}

function replaceTheVar(value, array, i, isInput){
    let map = {};
    if (isInput)
        map = input_vector;
    else
        map = var_map;
    if (array[i] in map) {
        let loc = array[i];
        let newLoc = map[loc];
        if (input) {
            var res = value.replace(loc, newLoc);
            value = res;
        }
    }
    return value;
}
