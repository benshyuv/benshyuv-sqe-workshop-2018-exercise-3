import * as esprima from 'esprima';

let data_array = [];
let input = false;

const parseCode = (codeToParse,inputA) => {
    let json =  esprima.parseScript(codeToParse);
    data_array = codeToParse.split('\n');
    deleteSpaces();
    input = inputA;
    iterateBlock(json);
    return result;
};

export {parseCode,input_vector,var_map,order,handleCondition,init};
let var_map = {};//the map of the locals variables
let line_number = 0;
let result = [];//the result map
let input_vector = {};//the map of the global variables
let order = [];//array of nodes order
let op = 1;//the op num
let cond = 1;//the cond num
let or = 0;//the order cell num
let res = 0;//the result cell num
let num = 1;//the num of the node
let isIf = false;
let arr = [];//arr of some lines
let typeToHandlerMapping = {'Program': iterateProgram,
    'FunctionDeclaration': iterateFunction,
    'VariableDeclaration': iterateVariable,
    'IfStatement': ifStatement,
    'WhileStatement': whileStatement,
    'BlockStatement': BlockStatement,
    'ExpressionStatement': ExpressionStatement,
    'ReturnStatement': ReturnStatement};

function iterateBlock(json){
    let func = typeToHandlerMapping[json.type];
    func ? func.call(undefined, json) : '';
}

function init(){
    var_map = {};
    line_number = -1;
    result = [];
    input_vector = {};
    order = [];
    op = 1;
    cond = 1;
    or = 0;
    res = 0;
    num = 1;
    isIf = false;
    arr = [];
}

function iterateProgram(json) {
    init();
    for (var i in json.body) {
        nextLine(data_array);
        iterateBlock(json.body[i]);
    }
}

function iterateFunction(json){
    for (var i in json.params) {
        input_vector[json.params[i].name] = '';
    }
    iterateBlock(json.body);
}

function BlockStatement(json) {
    let i = 0;
    while (i<json.body.length) {
        if (json.body[i].type == 'VariableDeclaration') {
            nextLine();
            i = createArr(json, false, i);
            iterateVariable(arr);
        }
        if (json.body[i].type == 'ExpressionStatement') {
            i = createArr(json, true, i);
            ExpressionStatement(arr);
        }
        if (i<json.body.length) {
            iterateBlock(json.body[i]);
            nextLine(data_array);
            i++;
        }
    }
}

function createArr(json,isExpression,i) {
    arr = [];
    let type;
    if (!isExpression)
        type = 'VariableDeclaration';
    else
        type = 'ExpressionStatement';
    while (i < json.body.length && json.body[i].type == type) {
        arr[i] = data_array[line_number];
        i++;
        nextLine();
    }
    return i;
}

function iterateVariable(arr){
    let array = [];
    for (var i in arr) {
        var value;
        var ind = arr[i].indexOf('t');
        value = arr[i].substring(ind + 2, arr[i].length-1);
        array[i] = value;
    } enterToMap(array);
    let toKey = 'op' + op;
    op++;
    let toEnter = toKey + '=>operation: ' + num + '\n';
    num++;
    for (var j in array)
        toEnter += array[j] + '\n';
    if (input)
        toEnter += '|current';
    result[res] = toEnter;
    res++;
    order[or] = toKey;
}

function enterToMap(array){
    let name; let value;
    for (var j in array) {
        let ind = array[j].indexOf('=');
        if (ind != -1) {
            name = array[j].substring(0, ind - 1);
            value = array[j].substring(ind + 1, array[j].length);
        }
        else {
            let idx = array[j].indexOf('+');
            name = array[j].substring(0, idx);
            value = var_map[name] + ' + 1';
        }
        value = replaceVar(value);
        var_map[name] = value;
    }
}

function ifStatement(json){
    let indS = data_array[line_number].indexOf('(');
    let indE = data_array[line_number].indexOf(')');
    let toKey = handleCondition(data_array[line_number].substring(indS+1,indE));
    nextLine();
    order[or] += '->' + toKey + '(yes,right)';

    isIf = true;
    iterateBlock(json.consequent);
    if (json.alternate)
        alternate(json,toKey);
}

function handleCondition(test) {
    let toKey = 'cond' + cond;
    cond++;
    let toEnter = toKey + '=>condition: ' + num + '\n' + test;
    num++;
    result[res] = toEnter;
    res++;
    return toKey;
}

function alternate(json,toKey){
    or++;
    if (json.alternate.type == 'IfStatement') {
        order[or] = toKey + '(no)';
        ifStatement(json.alternate);
    }
    else{
        order[or] = toKey + '(no)';
        nextLine();
        iterateBlock(json.alternate);
    }
}

function whileStatement(json) {
    let toKey = 'op' + op;
    op++;
    let toEnter = toKey + '=>operation: ' + num + '\n' + 'NULL';
    num++;
    result[res] = toEnter;
    res++;
    order[or] += '->' + toKey;
    let indS = data_array[line_number].indexOf('(');
    let indE = data_array[line_number].indexOf(')');
    let keyCond = handleCondition(data_array[line_number].substring(indS+1,indE));
    nextLine();
    order[or] += '->' + keyCond + '(yes,right)';

    iterateBlock(json.body);
    order[or] += '->' + toKey;

    or++;
    order[or] = keyCond + '(no)';
}

function ExpressionStatement(arr) {
    let array = [];
    for (var i in arr) {
        var value;
        var ind = arr[i].indexOf(';');
        value = arr[i].substring(0,ind);
        array[i] = value;
    }
    enterToMap(array);
    let toKey = 'op' + op;
    op++;
    let toEnter = toKey + '=>operation: ' + num + '\n';
    num++;
    for (var j in array){
        toEnter += array[j] + '\n';
    }
    result[res] = toEnter;
    res++;
    order[or] += '->' + toKey;
}

function ReturnStatement() {
    let ind = data_array[line_number].indexOf(';');
    let line = data_array[line_number].substring(0,ind);
    let toKey = 'op' + op;
    op++;
    let toEnter = toKey + '=>operation: ' + num + '\n' + line;
    num++;
    if (input)
        toEnter += '|current';
    result[res] = toEnter;
    res++;
    if (isIf) {
        for (var i in order)
            order[i] += '->' + toKey;
    }
    else
        order[or] += '->' + toKey;
}

function replaceVar(value) {
    let original_value = value;
    let array = value.split(/[\s,]+/);
    for (var i in array) {
        value = replaceTheVar(value, array, i);
    }
    var ans = value.replace(original_value, value);
    return ans;
}

function replaceTheVar(value, array, i){
    if (array[i] in var_map) {
        let loc = array[i];
        let newLoc = var_map[loc];
        if (input) {
            var res = value.replace(loc, newLoc);
            value = res;
        }
    }
    return value;
}

function nextLine(){
    line_number++;
    if (!data_array[line_number].replace(/\s/g, '').length)
        line_number++;
}

function deleteSpaces(){
    for (var i in data_array) {
        let line = data_array[i];
        var j = 0;
        while (line[j] == ' ') {
            line = line.substring(1, line.length);
        }
        data_array[i] = line;
    }
}