const fs = require('fs');
const path = require('path');

let matchCount = 0;
let updatedFiles = 0;

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Split by tag name to be safe
            // Let's just find className="..." and check if it's near an input/textarea/select
            // Actually, we can use a basic state machine:
            let i = 0;
            let inTargetTag = false;
            let outContent = '';
            
            while (i < content.length) {
                // Check if we are starting a tag
                if (content.substring(i, i+6).toLowerCase() === '<input' || 
                    content.substring(i, i+9).toLowerCase() === '<textarea' || 
                    content.substring(i, i+7).toLowerCase() === '<select') {
                    
                    let endOfTag = i;
                    let braceDepth = 0;
                    let quoteChar = null;
                    
                    while (endOfTag < content.length) {
                        let char = content[endOfTag];
                        
                        if (quoteChar) {
                            if (char === quoteChar && content[endOfTag-1] !== '\\') {
                                quoteChar = null;
                            }
                        } else {
                            if (char === '"' || char === "'") {
                                quoteChar = char;
                            } else if (char === '{') {
                                braceDepth++;
                            } else if (char === '}') {
                                braceDepth--;
                            } else if (char === '>' && braceDepth === 0) {
                                break;
                            }
                        }
                        endOfTag++;
                    }
                    
                    let tagContent = content.substring(i, endOfTag + 1);
                    
                    // Replace in tagContent
                    if (tagContent.includes('text-white')) {
                        tagContent = tagContent.replace(/\btext-white\b/g, 'text-black');
                    } else if (!tagContent.includes('text-black')) {
                        if (tagContent.includes('className="')) {
                            tagContent = tagContent.replace('className="', 'className="text-black ');
                        } else if (tagContent.includes("className='")) {
                            tagContent = tagContent.replace("className='", "className='text-black ");
                        } else {
                            // no className, maybe add it
                            tagContent = tagContent.replace(/<(input|textarea|select)/i, '$& className="text-black"');
                        }
                    }
                    
                    tagContent = tagContent.replace(/\bbg-brand-muted\b/g, 'bg-white');
                    tagContent = tagContent.replace(/\bbg-transparent\b/g, 'bg-white border-gray-300');
                    
                    outContent += tagContent;
                    i = endOfTag + 1;
                    continue;
                }
                
                outContent += content[i];
                i++;
            }

            if (outContent !== originalContent) {
                fs.writeFileSync(fullPath, outContent, 'utf8');
                console.log('Updated: ' + fullPath);
                updatedFiles++;
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
console.log('Done. Updated ' + updatedFiles + ' files.');
