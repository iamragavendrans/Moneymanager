
import fs from 'fs';

const content = fs.readFileSync('c:\\Users\\Demo\\moneymanager\\Moneymanager\\src\\app\\components\\AccountManagementModal.tsx', 'utf8');
const lines = content.split('\n');

let balance = 0;
let jsxBalance = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const openBraces = (line.match(/\{/g) || []).length;
  const closeBraces = (line.match(/\}/g) || []).length;
  balance += openBraces - closeBraces;
  
  if (line.trim().startsWith('//') || line.trim().startsWith('{/*')) continue;

  const openTags = (line.match(/<[a-zA-Z]/g) || []).length;
  const closeTags = (line.match(/<\/[a-zA-Z]/g) || []).length;
  const openFragments = (line.match(/<>/g) || []).length;
  const closeFragments = (line.match(/<\/>/g) || []).length;
  const selfClosing = (line.match(/\/>/g) || []).length;
  
  jsxBalance += openTags + openFragments - closeTags - closeFragments - selfClosing;
}
console.log(`Final balance: ${balance}, jsxBalance: ${jsxBalance}`);
