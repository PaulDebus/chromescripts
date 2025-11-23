javascript:(function() {
    /* 1. TOOLS CONFIGURATION */
    const tools = [
        {
            name: "1. Highlight Images",
            run: function() {
                document.querySelectorAll('img').forEach(img => img.style.border = "5px solid red");
            }
        },
        {
            name: "2. Show Page Title",
            run: function() {
                alert("Page Title: " + document.title);
            }
        },
        {
            name: "3. Edit Page Text",
            run: function() {
                document.body.contentEditable = 'true';
                document.designMode = 'on';
            }
        }
    ];

    /* 2. REMOVE EXISTING MENU IF OPEN */
    const existingMenu = document.getElementById('my-master-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    /* 3. CREATE UI */
    const menu = document.createElement('div');
    menu.id = 'my-master-menu';
    /* Using very high z-index to ensure it sits on top */
    menu.style.cssText = 'position: fixed; top: 20%; left: 50%; transform: translate(-50%, 0); background: #222; color: white; padding: 20px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 2147483647; font-family: sans-serif; min-width: 300px; text-align: center; font-size: 16px; line-height: 1.5;';

    const title = document.createElement('h3');
    title.innerText = "Work Tools";
    title.style.cssText = "margin: 0 0 15px 0; color: #fff; border-bottom: 1px solid #555; padding-bottom: 10px;";
    menu.appendChild(title);

    /* 4. GENERATE BUTTONS */
    tools.forEach((tool, index) => {
        const btn = document.createElement('button');
        btn.innerText = tool.name;
        btn.style.cssText = 'display: block; width: 100%; padding: 12px; margin-bottom: 8px; background: #444; color: white; border: 1px solid #555; border-radius: 4px; cursor: pointer; font-size: 14px; text-align: left; transition: background 0.2s;';
        
        btn.onmouseover = function() { this.style.background = "#666"; };
        btn.onmouseout = function() { this.style.background = "#444"; };

        btn.onclick = function() {
            try { tool.run(); } catch(e) { alert("Tool Error: " + e.message); }
            cleanup(); 
        };
        menu.appendChild(btn);
    });

    document.body.appendChild(menu);

    /* 5. CLEANUP & EVENTS */
    function cleanup() {
        if(menu) menu.remove();
        document.removeEventListener('keydown', handleKeys);
        document.removeEventListener('click', closeOutside);
    }

    function closeOutside(e) {
        if (!menu.contains(e.target)) cleanup();
    }

    function handleKeys(e) {
        if(e.key === "Escape") cleanup();
        const num = parseInt(e.key);
        if (!isNaN(num) && num > 0 && num <= tools.length) {
            tools[num - 1].run();
            cleanup();
        }
    }

    /* Delay listeners to prevent immediate closing upon click */
    setTimeout(function() {
        document.addEventListener('click', closeOutside);
        document.addEventListener('keydown', handleKeys);
    }, 200);

})();
