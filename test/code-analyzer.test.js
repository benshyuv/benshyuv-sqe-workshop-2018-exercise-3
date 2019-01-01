import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    testEmpty();
    testIfIf();
    testEndLet();
    testLetExp();
    testExpression();
    testIfElse();
    testWhile();
    testSwitch();
    testIf();
    testEndExpression();
    testOneDeclaration();
});

function testEmpty(){
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('',false)),
            '[]'
        );
    });
}

function testIfIf(){
    it('is parsing a nested if correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        if (b < y){\n' +
                '            c = c + 5;\n' +
                '    } \n' +
                '        }\n' +
                '    \n' +
                '    return c;\n' +
                '}\n',true)),
            '["op1=>operation: 1\\na = x + 1\\nb = a + y\\nc = 0\\n|current","cond1=>condition: 2\\nb < z","cond2=>condition: 3\\nb < y","op2=>operation: 4\\nc = c + 5\\n","op3=>operation: 5\\n return c|current"]'
        );
    });
}

function testEndLet(){
    it('is parsing a let statement after while correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '   let a = x + 1;\n' +
                '   \n' +
                '   while (a < z) {\n' +
                '       a++;\n' +
                '   }\n' +
                '   let c = 0;\n' +
                '   return z;\n' +
                '}\n',false)),
            '["op1=>operation: 1\\na = x + 1\\n","op2=>operation: 2\\nNULL","cond1=>condition: 3\\na < z","op3=>operation: 4\\na++\\n","op4=>operation: 5\\nc = 0\\n","op5=>operation: 6\\n return z"]'
        );
    });
}

function testLetExp(){
    it('is parsing a let statement and expression correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    x = x + y;\n' +
                '}\n',true)),
            '["op1=>operation: 1\\na = x + 1\\n|current","op2=>operation: 2\\nx = x + y\\n|current"]'
        );
    });
}

function testExpression(){
    it('is parsing an expression after while correctly', () => {
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
                '   x++;\n' +
                '   return z;\n' +
                '}\n',true)),
            '["op1=>operation: 1\\na = x + 1\\nb = a + y\\nc = 0\\n|current","op2=>operation: 2\\nNULL|current","cond1=>condition: 3\\na < z","op3=>operation: 4\\nc = a + b\\nz = c * 2\\na++\\n","op4=>operation: 5\\nx++\\n|current","op5=>operation: 6\\n return z|current"]'
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
            '["op1=>operation: 1\\na = x + 1\\nb = a + y\\nc = 0\\n|current","cond1=>condition: 2\\nb < z","op2=>operation: 3\\nc = c + 5\\n","cond2=>condition: 4\\nb < z * 2","op3=>operation: 5\\nc = c + x + 5\\n","op4=>operation: 6\\nc = c + z + 5\\n|current","op5=>operation: 7\\n return c|current"]'
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
            '["op1=>operation: 1\\na = x + 1\\nb = a + y\\nc = 0\\n","op2=>operation: 2\\nNULL","cond1=>condition: 3\\na < z","op3=>operation: 4\\nc = a + b\\nz = c * 2\\na++\\n","op4=>operation: 5\\n return z"]'
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
            '["op1=>operation: 1\\na = x + 1\\nb = a + y\\nc = 0\\n|current","cond1=>condition: 2\\nb < z","op2=>operation: 3\\nc = c + 5\\n","cond2=>condition: 4\\nb < z * 2","op3=>operation: 5\\nc = c + x + 5\\n","cond3=>condition: 6\\na < y","op4=>operation: 7\\nc = c + z + 5\\n","op5=>operation: 8\\n return c|current"]'
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
            '["op1=>operation: 1\\na = x + 1\\nb = a + y\\nc = 0\\n|current","cond1=>condition: 2\\nb < z","op2=>operation: 3\\nc = c + 5\\n","cond2=>condition: 4\\nb < z * 2","op3=>operation: 5\\nc = c + x + 5\\n","cond3=>condition: 6\\na < y","op4=>operation: 7\\nc = c + z + 5\\n","op5=>operation: 8\\nc = c + 1\\n|current","op6=>operation: 9\\na = c\\n|current","op7=>operation: 10\\n return c|current"]'
        );
    });
}

function testOneDeclaration(){
    it('is parsing a single declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '   let a = x + 1;\n' +
                '}\n',false)),
            '["op1=>operation: 1\\na = x + 1\\n"]'
        );
    });
}