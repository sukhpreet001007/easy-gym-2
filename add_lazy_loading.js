const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// We want to skip the first ~350 lines (Hero section)
const heroCutoff = 350;

const newline = content.includes('\r\n') ? '\r\n' : '\n';
const lines = content.split(newline);

const newLines = lines.map((line, index) => {
    const lineNum = index + 1;

    if (lineNum < heroCutoff) {
        return line;
    }

    if (line.includes('<img ') && !line.includes('loading="lazy"')) {
        return line.replace('<img ', '<img loading="lazy" ');
    }

    return line;
});

fs.writeFileSync(filePath, newLines.join(newline), 'utf8');
console.log('Processed ' + newLines.length + ' lines.');
