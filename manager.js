javascript:(function() {
    /* --- CONFIGURATION: YOUR TOOLS --- */
    const tools = [
        {
            name: "Highlight Images",
            run: function() { document.querySelectorAll('img').forEach(img => img.style.border = "5px solid red"); }
        },
        {
            name: "Show Page Title",
            run: function() { alert("Title: " + document.title); }
        },
        {
            name: "Edit Page Content",
            run: function() { document.body.contentEditable = 'true'; document.designMode = 'on'; }
        },
        {
            name: "Scroll to Top",
            run: function() { window.scrollTo(0,0); }
        },
        {
            name: "Scroll to Bottom",
            run: function() { window.scrollTo(0, document.body.scrollHeight); }
        }
    ];

    /* --- UI LOGIC --- */
    const id = 'my-cmd-palette';
    if (document.getElementById(id)) { document.getElementById(id).remove(); return; }

    let filteredTools = [...tools];
    let selectedIndex = 0;

    /* Create Overlay */
    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.3); z-index: 2147483647; display: flex; justify-content: center; align-items: flex-start; padding-top: 10vh; font-family: sans-serif;';
    
    /* Create Main Box */
    const box = document.createElement('div');
    box.style.cssText = 'width: 500px; max-width: 90%; background: #1e1e1e; border-radius: 8px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden; display: flex; flex-direction: column; border: 1px solid #333;';
    
    /* Search Input */
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type to search commands...';
    input.style.cssText = 'width: 100%; padding: 15px; font-size: 18px; background: #252526; color: #ddd; border: none; border-bottom: 1px solid #333; outline: none; box-sizing: border-box;';
    
    /* Results List */
    const list = document.createElement('ul');
    list.style.cssText = 'list-style: none; margin: 0; padding: 0; max-height: 300px; overflow-y: auto;';

    box.appendChild(input);
    box.appendChild(list);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    /* Render Function (FIXED: Uses replaceChildren instead of innerHTML) */
    function renderList() {
        // Clear list safely
        list.replaceChildren(); 

        if (filteredTools.length === 0) {
            const empty = document.createElement('div');
            empty.innerText = 'No matching tools';
            empty.style.cssText = 'padding: 15px; color: #666; text-align: center;';
            list.appendChild(empty);
            return;
        }

        filteredTools.forEach((tool, index) => {
            const li = document.createElement('li');
            li.innerText = tool.name;
            
            const isSelected = (index === selectedIndex);
            li.style.cssText = `
                padding: 10px 15px; 
                cursor: pointer; 
                border-bottom: 1px solid #2d2d2d; 
                background: ${isSelected ? '#094771' : 'transparent'}; 
                color: ${isSelected ? '#fff' : '#ccc'}; 
                font-size: 14px;
            `;
            
            li.onmouseover = function() { selectedIndex = index; renderList(); };
            li.onclick = function() { execute(tool); };
            
            list.appendChild(li);
        });

        // Scroll active item into view
        if (list.children[selectedIndex]) {
            list.children[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    function execute(tool) {
        try { tool.run(); } catch(e) { alert("Error: " + e); }
        closeMenu();
    }

    function closeMenu() {
        document.body.removeChild(overlay);
    }

    /* Event Listeners */
    input.focus();
    box.onclick = (e) => e.stopPropagation();
    overlay.onclick = () => closeMenu();

    input.oninput = function(e) {
        const term = e.target.value.toLowerCase();
        const terms = term.split(' ').filter(t => t.length > 0);
        
        filteredTools = tools.filter(tool => {
            const nameLower = tool.name.toLowerCase();
            return terms.every(t => nameLower.includes(t));
        });
        
        selectedIndex = 0;
        renderList();
    };

    input.onkeydown = function(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % filteredTools.length;
            renderList();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + filteredTools.length) % filteredTools.length;
            renderList();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredTools[selectedIndex]) execute(filteredTools[selectedIndex]);
        } else if (e.key === 'Escape') {
            closeMenu();
        }
    };

    renderList();
})();
