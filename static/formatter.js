function formatMessage(message) {
    original = message;

    // Calculate the number of triple backticks
    const dotCount = (message.match(/```/g) || []).length;

    // If it's an odd number, add a newline and triple backticks to the message
    if (dotCount % 2 !== 0) {
        message += '\n```';
    }

    // Escape HTML special characters, excluding code blocks and inline code
    let inCodeBlock = false;
    let inInlineCode = false;
    let escapedMessage = '';
    for (let i = 0; i < message.length; i++) {
        const char = message[i];
        if (message.slice(i, i + 3) === '```') {
            inCodeBlock = !inCodeBlock;
            escapedMessage += '```';
            i += 2;
            continue;
        }
        if (char === '`' && !inCodeBlock) {
            inInlineCode = !inInlineCode;
            escapedMessage += '`';
            continue;
        }
        if (!inCodeBlock && !inInlineCode) {
            switch (char) {
                case '&':
                    escapedMessage += '&amp;';
                    break;
                case '<':
                    escapedMessage += '&lt;';
                    break;
                case '>':
                    escapedMessage += '&gt;';
                    break;
                case '"':
                    escapedMessage += '&quot;';
                    break;
                case "'":
                    escapedMessage += '&#39;';
                    break;
                default:
                    escapedMessage += char;
            }
        } else {
            escapedMessage += char;
        }
    }
    message = escapedMessage;

    // Mark code block content
    const codeBlockMap = {};
    let codeBlockIndex = 0;
    message = message.replace(/```(\w+)?([\s\S]*?)```/gim, (match, p1, p2) => {
        const key = `__CODE_BLOCK_${codeBlockIndex++}__`;
        codeBlockMap[key] = match;
        return key;
    });

    // Render inline code
    message = message.replace(/`([^`]+)`/gim, (match, p1) => {
        let inlineCodeContent = '';
        for (let i = 0; i < p1.length; i++) {
            const char = p1[i];
            switch (char) {
                case '<':
                    inlineCodeContent += '&lt;';
                    break;
                case '>':
                    inlineCodeContent += '&gt;';
                    break;
                case '#':
                    inlineCodeContent += '&#35;';
                    break;
                default:
                    inlineCodeContent += char;
            }
        }
        return `<code style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 2px 4px;">${inlineCodeContent}</code>`;
    });

    // Restore code block content
    Object.keys(codeBlockMap).forEach(key => {
        message = message.replace(key, codeBlockMap[key]);
    });

    // Render code blocks
    message = message.replace(/```(\w+)?([\s\S]*?)```/gim, (match, p1, p2) => {
        let codeContent = '';

        let indentLevel = 0;
        // Calculate the number of leading spaces for each line
        const lines = p2.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return '';
        const leadingSpaces = lines.map(line => line.match(/^\s*/)[0].length);
        const minLeadingSpaces = Math.min(...leadingSpaces);

        // Remove the same number of leading spaces from each line
        p2 = lines.map(line => line.substring(minLeadingSpaces)).join('\n');
        indentLevel = minLeadingSpaces;
        console.log('Indent=' + indentLevel);

        for (let i = 0; i < p2.length; i++) {
            const char = p2[i];
            switch (char) {
                case '<':
                    codeContent += '&lt;';
                    break;
                case '>':
                    codeContent += '&gt;';
                    break;
                case '#':
                    codeContent += '&#35;';
                    break;
                default:
                    codeContent += char;
            }
        }
        codeContent = codeContent.replace(/\s+$/g, '');
        return `<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px; margin-left: ${indentLevel * 20}px; overflow-x: auto;"><code>${codeContent}</code></pre>`;
    });

    // Render links
    message = message.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>');

    // Render horizontal rules
    message = message.replace(/^---$/gim, '<hr>');

    // Render headers
    message = message.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    message = message.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    message = message.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    message = message.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    message = message.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    message = message.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Render bold text
    message = message.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Render unordered lists
    message = message.replace(/^\s*([-+*])\s+(.*)/gim, (match, p1, p2) => {
        const indentLevel = Math.floor(match.match(/^\s*/)[0].length / 2);
        return `<ul style="margin-left: ${indentLevel * 20}px;"><li>${p2}</li></ul>`;
    });

    // Merge consecutive list items into one list
    message = message.replace(/<\/ul>\s*<ul/gim, '</ul><ul');

    // Remove any number of blank lines after header lines
    message = message.replace(/(<h[1-6]>.*<\/h[1-6]>)\s*\n+/gim, '$1');

    // Remove extra blank lines
    message = message.replace(/\n{2,}/gim, '\n');

    // Remove extra blank lines in unordered list items
    message = message.replace(/<\/ul>\n+/gim, '</ul>');
    message = message.replace(/<\/ul> +/gim, '</ul>');

    // Remove blank lines at the end of code blocks
    message = message.replace(/<\/pre>\n+/gim, '</pre>');
    console.log(message);
    answer = message.trim();
    message = original;
    return answer;
}