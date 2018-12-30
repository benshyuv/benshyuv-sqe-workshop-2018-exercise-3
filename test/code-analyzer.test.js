import assert from 'assert';
import {parseCode,handleCondition,init} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    //init();
    testEmpty();
    testIfElse();
    testWhile();
    testSwitch();
    testIf();
    testEndExpression();
    //testHandleCondition();
});

function testHandleCondition(){
    it('is parsing the handleCondition function correctly', () => {
        assert.equal(
            (handleCondition('b < z')),
            'cond1'
        );
    });
}

function testEmpty(){
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('',false)),
            '[]'
        );
    });
}

function testIfElse(){
    it('is parsing a if loop correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' + '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '    }\n' + '    \n' +
                '    return c;\n' +
                '}\n',true)),
            '[' + '"op1=>operation: 1\\na = x + 1\\nb = a + y\\nc = 0\\n|current",' +
            '"cond1=>condition: 2\\nb < z",' +
            '"op2=>operation: 3\\nc = c + 5\\n",' +
            '"cond2=>condition: 4\\nb < z * 2",' +
            '"op3=>operation: 5\\nc = c + x + 5\\n",' +
            '"op4=>operation: 6\\nc = c + z + 5\\n",' +
            '"op5=>operation: 7\\nreturn c|current"' + ']'
        );
    });
}

function testWhile(){
    it('is parsing a while loop correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '   let a = x + 1;\n' +
                '   let b = a + y;\n' +
                '   let c = 0;\n' +
                '   \n' +
                '   while (a < z) {\n' +
                '       c = a + b;\n' +
                '       z = c * 2;\n' +
                '       a++;\n' +
                '   }\n' +
                '   \n' +
                '   return z;\n' +
                '}\n',false)),
            '["op1=>operation: 1\\na = x + 1\\nb = a + y\\nc = 0\\n","op2=>operation: 2\\nNULL","cond1=>condition: 3\\na < z","op3=>operation: 4\\nc = a + b\\nz = c * 2\\na++\\n","op4=>operation: 5\\nreturn z"]'
        );
    });
}

function testSwitch(){
    it('is parsing a switch case correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    switch(x) {\n' +
                '        case y:\n' +
                '            a = 8;\n' +
                '        case z:\n' +
                '            a = 5;\n' +
                '        default:\n' +
                '            a = 0;\n' +
                '    }\n' +
                '}\n')),
            '[]'
        );
    });
}

function testIf(){
    it('is parsing a only if function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '    } \n' +
                '    if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '    } \n' +
                '    if (a < y) {\n' +
                '        c = c + z + 5;\n' +
                '    }\n' +
                '    \n' +
                '    return c;\n' +
                '}\n',true)),
            '["op1=>operation: 1\\na = x + 1\\nb = a + y\\nc = 0\\n|current","cond1=>condition: 2\\nb < z","op2=>operation: 3\\nc = c + 5\\n","cond2=>condition: 4\\nb < z * 2","op3=>operation: 5\\nc = c + x + 5\\n","cond3=>condition: 6\\na < y","op4=>operation: 7\\nc = c + z + 5\\n","op5=>operation: 8\\nreturn c|current"]'
        );
    });
}

function testEndExpression(){
    it('is parsing an expression after if correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '    } \n' +
                '    if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '    } \n' +
                '    if (a < y) {\n' +
                '        c = c + z + 5;\n' +
                '    } else {\n' +
                '        c = c + 1;\n' +
                '    }\n' +
                '    a = c;\n' +
                '    return c;\n' +
                '}\n',true)),
            '["op1=>operation: 1\\na = x + 1\\nb = a + y\\nc = 0\\n|current","cond1=>condition: 2\\nb < z","op2=>operation: 3\\nc = c + 5\\n","cond2=>condition: 4\\nb < z * 2","op3=>operation: 5\\nc = c + x + 5\\n","cond3=>condition: 6\\na < y","op4=>operation: 7\\nc = c + z + 5\\n","op5=>operation: 8\\nc = c + 1\\n","op6=>operation: 9\\na = c\\n","op7=>operation: 10\\nreturn c|current"]'
        );
    });
}