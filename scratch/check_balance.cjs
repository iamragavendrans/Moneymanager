const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\Demo\\moneymanager\\Moneymanager\\src\\app\\components\\TransactionFormModal.tsx', 'utf8');

let openBraces = 0, closeBraces = 0;
let openParens = 0, closeParens = 0;
let openJSX = 0, closeJSX = 0;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '{') openBraces++;
    if (char === '}') closeBraces++;
    if (char === '(') openParens++;
    if (char === ')') closeParens++;
    if (char === '<' && content[i+1] !== ' ' && content[i+1] !== '=') openJSX++;
    if (char === '>' && content[i-1] !== '=') closeJSX++;
}

console.log(`Braces: ${openBraces} / ${closeBraces}`);
console.log(`Parens: ${openParens} / ${closeParens}`);
console.log(`JSX: ${openJSX} / ${closeJSX}`);
