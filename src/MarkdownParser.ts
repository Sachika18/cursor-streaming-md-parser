const blogpostMarkdown = `# control

*humans should focus on bigger problems*

## Setup

\`\`\`bash
git clone git@github.com:anysphere/control
\`\`\`

\`\`\`bash
./init.sh
\`\`\`

## Folder structure

**The most important folders are:**

1. \`vscode\`: this is our fork of vscode, as a submodule.
2. \`milvus\`: this is where our Rust server code lives.
3. \`schema\`: this is our Protobuf definitions for communication between the client and the server.

Each of the above folders should contain fairly comprehensive README files; please read them. If something is missing, or not working, please add it to the README!

Some less important folders:

1. \`release\`: this is a collection of scripts and guides for releasing various things.
2. \`infra\`: infrastructure definitions for the on-prem deployment.
3. \`third_party\`: where we keep our vendored third party dependencies.

## Miscellaneous things that may or may not be useful

##### Where to find rust-proto definitions

They are in a file called \`aiserver.v1.rs\`. It might not be clear where that file is. Run \`rg --files --no-ignore bazel-out | rg aiserver.v1.rs\` to find the file.

## Releasing

Within \`vscode/\`:

- Bump the version
- Then:

\`\`\`
git checkout build-todesktop
git merge main
git push origin build-todesktop
\`\`\`

- Wait for 14 minutes for gulp and ~30 minutes for todesktop
- Go to todesktop.com, test the build locally and hit release
`;

let currentContainer: HTMLElement | null = null; 
let currentElement: HTMLElement | null = null;
let mode: 'normal' | 'inline' | 'block' = 'normal';
let backtickBuffer = 0;
// Do not edit this method
function runStream() {
    currentContainer = document.getElementById('markdownContainer')!;
    currentContainer.innerHTML = ''; // Clear previous content
    currentElement = null;
    mode = 'normal';
    backtickBuffer = 0;

    // this randomly split the markdown into tokens between 2 and 20 characters long
    // simulates the behavior of an ml model thats giving you weirdly chunked tokens
    const tokens: string[] = [];
    let remainingMarkdown = blogpostMarkdown;
    while (remainingMarkdown.length > 0) {
        const tokenLength = Math.floor(Math.random() * 18) + 2;
        const token = remainingMarkdown.slice(0, tokenLength);
        tokens.push(token);
        remainingMarkdown = remainingMarkdown.slice(tokenLength);
    }

    const toCancel = setInterval(() => {
        const token = tokens.shift();
        if (token) {
            addToken(token);
        } else {
            clearInterval(toCancel);
        }
    }, 20);
}


/* 
Please edit the addToken method to support at least inline codeblocks and codeblocks. Feel free to add any other methods you need.
This starter code does token streaming with no styling right now. Your job is to write the parsing logic to make the styling work.

Note: don't be afraid of using globals for state. For this challenge, speed is preferred over cleanliness.
 */
function addToken(token: string) {
    if(!currentContainer) return;

    for (let char of token) {
        if (char === '`') {
            backtickBuffer++;
            if (mode === 'normal') {
                if (backtickBuffer === 3) {
                    // start codeblock
                    const pre = document.createElement('pre');
                    currentElement = document.createElement('code');
                    pre.appendChild(currentElement);
                    currentContainer.appendChild(pre);
                    mode = 'block';
                    backtickBuffer = 0;
                }
                // else, wait
            } else if (mode === 'inline') {
                if (backtickBuffer === 1) {
                    // end inline
                    currentElement = document.createElement('span');
                    currentContainer.appendChild(currentElement);
                    mode = 'normal';
                    backtickBuffer = 0;
                }
            } else if (mode === 'block') {
                if (backtickBuffer === 3) {
                    // end block
                    currentElement = document.createElement('span');
                    currentContainer.appendChild(currentElement);
                    mode = 'normal';
                    backtickBuffer = 0;
                }
            }
        } else {
            // non-`
            if (mode === 'normal') {
                if (backtickBuffer === 1) {
                    // start inline code
                    currentElement = document.createElement('code');
                    currentContainer.appendChild(currentElement);
                    mode = 'inline';
                    currentElement.textContent += char;
                    backtickBuffer = 0;
                } else if (backtickBuffer === 2) {
                    // two backticks, treat as text
                    if (!currentElement) {
                        currentElement = document.createElement('span');
                        currentContainer.appendChild(currentElement);
                    }
                    currentElement.textContent += '``' + char;
                    backtickBuffer = 0;
                } else if (backtickBuffer === 0) {
                    // normal text
                    if (!currentElement) {
                        currentElement = document.createElement('span');
                        currentContainer.appendChild(currentElement);
                    }
                    currentElement.textContent += char;
                } else if (backtickBuffer >= 3) {
                    // start codeblock (though unlikely)
                    const pre = document.createElement('pre');
                    currentElement = document.createElement('code');
                    pre.appendChild(currentElement);
                    currentContainer.appendChild(pre);
                    mode = 'block';
                    currentElement.textContent += char;
                    backtickBuffer = 0;
                }
            } else {
                // in inline or block, append char
                currentElement!.textContent += char;
                backtickBuffer = 0; // reset buffer
            }
        }
    }
}