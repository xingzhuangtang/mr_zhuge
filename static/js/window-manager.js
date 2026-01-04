/**
 * Window Manager for UI Panels
 * Handles Dragging, Resizing, Closing, and Restoring of windows.
 */
class WindowManager {
    constructor() {
        this.windows = [];
        this.dockContainer = null;
        this.zIndexCounter = 100;
        this.initDock();
    }

    initDock() {
        this.dockContainer = document.createElement('div');
        this.dockContainer.className = 'dock-container';
        document.body.appendChild(this.dockContainer);

        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .dock-container {
                position: absolute;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 10px;
                z-index: 1000;
                background: rgba(0,0,0,0.5);
                padding: 5px 15px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
                transition: opacity 0.3s;
            }
            .dock-container:empty {
                display: none;
            }
            .dock-item {
                width: 40px;
                height: 40px;
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border: 1px solid rgba(255,255,255,0.2);
                transition: all 0.2s;
                font-size: 20px;
            }
            .dock-item:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.1);
            }
            
            /* Window Controls */
            .window-controls {
                position: absolute;
                top: 5px;
                right: 5px;
                display: flex;
                gap: 5px;
                z-index: 10;
            }
            .win-btn {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                cursor: pointer;
                border: none;
            }
            .win-close { background: #ff5f56; }
            .win-min { background: #ffbd2e; }
            .win-max { background: #27c93f; }
            
            .ui-window {
                /* Base styles for windows */
                position: absolute;
                pointer-events: auto; /* Fix: Capture clicks, don't pass to map */
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transition: opacity 0.2s, transform 0.2s;
            }
            
            .resize-handle {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 20px;
                height: 20px;
                cursor: nwse-resize;
                background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.8) 50%);
                z-index: 100;
            }
        `;
        document.head.appendChild(style);
    }

    register(elementId, title, icon = '📦') {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Add window class
        element.classList.add('ui-window');

        // Add Controls
        const controls = document.createElement('div');
        controls.className = 'window-controls';
        controls.innerHTML = `
            <button class="win-btn win-min" title="Minimize"></button>
            <button class="win-btn win-close" title="Close"></button>
        `;
        // Insert controls at top
        element.insertBefore(controls, element.firstChild);

        // Add Resize Handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        element.appendChild(resizeHandle);

        // Bind Events
        controls.querySelector('.win-min').onclick = () => this.minimize(elementId);
        controls.querySelector('.win-close').onclick = () => this.close(elementId);

        // Make Draggable
        this.makeDraggable(element);

        // Make Resizable
        this.makeResizable(element, resizeHandle);

        // Bring to front on click
        element.addEventListener('mousedown', () => {
            this.bringToFront(element);
        });

        this.windows.push({
            id: elementId,
            element: element,
            title: title,
            icon: icon
        });
    }

    minimize(id) {
        const win = this.windows.find(w => w.id === id);
        if (!win) return;

        win.element.style.display = 'none'; // Hide
        this.addToDock(win);
    }

    close(id) {
        const win = this.windows.find(w => w.id === id);
        if (!win) return;

        win.element.style.display = 'none';

        // If it's the video player, stop the video
        if (id === 'win-video-player') {
            const video = win.element.querySelector('video');
            if (video) video.pause();
        }
    }

    restore(id) {
        const win = this.windows.find(w => w.id === id);
        if (!win) return;

        win.element.style.display = 'flex'; // Show (assuming flex layout)
        // Remove from dock
        const dockItem = this.dockContainer.querySelector(`[data-id="${id}"]`);
        if (dockItem) dockItem.remove();

        this.bringToFront(win.element);
    }

    addToDock(win) {
        // Check if already in dock
        if (this.dockContainer.querySelector(`[data-id="${win.id}"]`)) return;

        const item = document.createElement('div');
        item.className = 'dock-item';
        item.dataset.id = win.id;
        item.innerHTML = win.icon;
        item.title = win.title;
        item.onclick = () => this.restore(win.id);

        this.dockContainer.appendChild(item);
    }

    bringToFront(element) {
        this.zIndexCounter++;
        element.style.zIndex = this.zIndexCounter;
    }

    makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        let isDragging = false;

        // Find or create a drag handle area
        let dragHandle = element.querySelector('.panel-header, .toolbar-title');

        // If no specific drag handle found, create one
        if (!dragHandle) {
            dragHandle = document.createElement('div');
            dragHandle.className = 'window-drag-handle';
            dragHandle.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 30px;
                cursor: move;
                z-index: 1;
            `;
            element.insertBefore(dragHandle, element.firstChild);
        } else {
            dragHandle.style.cursor = 'move';
        }

        dragHandle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            // Don't drag if clicking window controls
            if (e.target.classList.contains('win-btn')) return;
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;

            e = e || window.event;
            e.preventDefault();
            e.stopPropagation();

            isDragging = true;
            pos3 = e.clientX;
            pos4 = e.clientY;

            element.style.opacity = '0.9';
            element.style.cursor = 'move';

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            if (!isDragging) return;

            e = e || window.event;
            e.preventDefault();

            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            // Calculate new position
            let newTop = element.offsetTop - pos2;
            let newLeft = element.offsetLeft - pos1;

            // Constrain to viewport
            const maxLeft = window.innerWidth - 100; // Keep at least 100px visible
            const maxTop = window.innerHeight - 50;

            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));

            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
            element.style.right = 'auto'; // Remove right constraint
            element.style.bottom = 'auto'; // Remove bottom constraint
        }

        function closeDragElement() {
            isDragging = false;
            element.style.opacity = '1';
            element.style.cursor = '';
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    makeResizable(element, handle) {
        let isResizing = false;

        handle.onmousedown = initResize;

        function initResize(e) {
            e.preventDefault();
            e.stopPropagation();
            isResizing = true;

            // Make handle more visible during resize
            handle.style.background = 'linear-gradient(135deg, transparent 50%, rgba(74, 144, 226, 1) 50%)';
            document.body.style.cursor = 'nwse-resize';

            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResize);
        }

        function resize(e) {
            if (!isResizing) return;

            // Calculate new dimensions relative to the element's position
            // We use clientX/Y directly for smoother tracking
            let newWidth = e.clientX - element.getBoundingClientRect().left;
            let newHeight = e.clientY - element.getBoundingClientRect().top;

            // Minimum constraints
            const minWidth = 300;
            const minHeight = 200;

            newWidth = Math.max(minWidth, newWidth);
            newHeight = Math.max(minHeight, newHeight);

            element.style.width = newWidth + 'px';
            element.style.height = newHeight + 'px';
        }

        function stopResize() {
            isResizing = false;
            handle.style.background = 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.8) 50%)';
            document.body.style.cursor = '';

            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResize);
        }
    }
}

window.WindowManager = WindowManager;
