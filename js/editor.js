// Configure and initialize the Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});

require(['vs/editor/editor.main'], function() {
    window.editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: 'function calculateTotal(cart) {\n\t// Try running this perfectly fine code...\n\tlet total = 0;\n\tfor(let i = 0; i < cart.length; i++) {\n\t\ttotal += cart[i].price;\n\t}\n\treturn total;\n}\n\nconsole.log(calculateTotal([{price: 10}, {price: 20}]));',
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true
    });
});