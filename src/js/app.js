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
            if (input) {
                let replaceTest = replaceVar(result[i].substring(ind + 1, result[i].length), false);
                replaceTest = replaceVar(replaceTest, true);
                colorCond(replaceTest, i);
            }
        }
        i++;
    }
}

function colorCond(replaceTest,i) {
    result[i] += '|current';
    let nameT = result[i].substring(0, result[i].indexOf('=')) + '(yes,right)';
    let nameF = result[i].substring(0, result[i].indexOf('=')) + '(no)';
    let orderLine = findLine(nameT);
    let orderLineNo = findLine(nameF);
    if (eval(replaceTest)) {
        addColor(orderLine,nameT);
        removeColor(orderLineNo,nameF);
    }
    else {
        if (orderLineNo != undefined) {
            addColor(orderLineNo, nameF);
            removeColor(orderLine, nameT);
        }
    }
}

function findLine(name){
    let orderLine;
    for (var j = 0; j < order.length; j++) {
        if (order[j].includes(name)) {
            orderLine = order[j];
            break;
        }
    }
    return orderLine;
}

function addColor(orderLine,name){
    orderLine = orderLine.substring(orderLine.indexOf(name[name.length-1]) + 3, orderLine.length);
    while (orderLine.length > 0) {
        let toPaint = toPaintInit(orderLine);
        if (toPaint.includes('('))
            toPaint = toPaint.substring(0, toPaint.indexOf('('));
        let j = findPlace(toPaint);
        if (result[j].includes('|current'))
            result[j] = result[j].substring(0, result[j].indexOf('|'));
        result[j] += '|current';
        let idx = orderLine.indexOf('>');
        if (idx != -1)
            orderLine = orderLine.substring(idx + 1, orderLine.length);
        else
            orderLine = '';
    }
}

function toPaintInit(orderLine){
    let ind =  orderLine.indexOf('-');
    let toPaint;
    if (ind != -1)
        toPaint = orderLine.substring(0, orderLine.indexOf('-'));
    else
        toPaint = orderLine;
    return toPaint;
}

function removeColor(orderLineNo,name){
    orderLineNo = orderLineNo.substring(orderLineNo.indexOf(name[name.length-1]) + 3, orderLineNo.length);
    while (orderLineNo.length > 0) {
        let toRemoveColor = toPaintInit(orderLineNo);
        if (toRemoveColor.includes('('))
            toRemoveColor = toRemoveColor.substring(0, toRemoveColor.indexOf('('));
        let j = findPlace(toRemoveColor);
        paint(j);
        let idx = orderLineNo.indexOf('>');
        if (idx != -1)
            orderLineNo = orderLineNo.substring(idx + 1, orderLineNo.length);
        else
            orderLineNo = '';
    }
}

function paint(j){
    if (result[j].includes('|current')) {
        if (!result[j].includes('return'))
            result[j] = result[j].substring(0, result[j].indexOf('|'));
    }
}

function findPlace(toFind){
    for (var j=0; j<result.length; j++){
        let name = result[j].substring(0,result[j].indexOf('='));
        if (name == toFind)
            return j;
    }
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
