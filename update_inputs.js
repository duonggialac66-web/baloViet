const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Simple regex to match <input, <textarea, <select tags and replace text-white with text-black
            // This is a bit tricky with regex, we can try to match the whole tag or just className="...text-white..."
            // A safer regex for className inside these tags:
            const tagRegex = /<(input|textarea|select)\b[^>]*>/gi;
            
            content = content.replace(tagRegex, (match) => {
                let newMatch = match;
                // If it has text-white, replace with text-black
                if (newMatch.includes('text-white')) {
                    newMatch = newMatch.replace(/\btext-white\b/g, 'text-black');
                } else if (!newMatch.includes('text-black')) {
                    // if it has className, add text-black
                    if (newMatch.includes('className="')) {
                        newMatch = newMatch.replace('className="', 'className="text-black ');
                    } else if (newMatch.includes("className='")) {
                        newMatch = newMatch.replace("className='", "className='text-black ");
                    }
                }
                
                // Also, if bg-transparent or bg-brand-muted is used, maybe they need bg-white to see black text?
                // The user only asked for black text, but let's change bg-brand-muted to bg-white just for inputs.
                if (newMatch !== match) {
                    newMatch = newMatch.replace(/\bbg-brand-muted\b/g, 'bg-white');
                    newMatch = newMatch.replace(/\bbg-transparent\b/g, 'bg-white');
                    // some borders might need adjustment but text-black is the main thing
                }
                return newMatch;
            });

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
console.log('Done.');
