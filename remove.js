const fs = require('fs');
const path = 'C:/Users/lenovo/Downloads/ALL PROJECTS/hack in hills - manali/src/components/Tracks.tsx';
let content = fs.readFileSync(path, 'utf8');

const startStr = '{/* Far Left Global Navigation Path */}';
const startIdx = content.indexOf(startStr);
if (startIdx !== -1) {
    // Find the end by looking for the next JSX comment or similar, or just parsing.
    // The block is roughly from startIdx until the waypointMap starts
    const endStr = '{/* Center Floating Waypoint Map ?" desktop/tablet */}';
    let endIdx = content.indexOf(endStr, startIdx);
    if (endIdx !== -1) {
        // Find the line break before endStr to safely remove
        const lastLineBreak = content.lastIndexOf('\n', endIdx) + 1;
        content = content.substring(0, startIdx) + content.substring(lastLineBreak);
        fs.writeFileSync(path, content);
        console.log('Removed successfully.');
    } else {
        // maybe the comment is slightly different
        const endStr2 = '{/* Center Floating Waypoint Map';
        let endIdx2 = content.indexOf(endStr2, startIdx);
        if (endIdx2 !== -1) {
             const lastLineBreak = content.lastIndexOf('\n', endIdx2) + 1;
             content = content.substring(0, startIdx) + content.substring(lastLineBreak);
             fs.writeFileSync(path, content);
             console.log('Removed successfully.');
        } else {
             console.log('End not found');
        }
    }
} else {
    console.log('Start not found');
}
