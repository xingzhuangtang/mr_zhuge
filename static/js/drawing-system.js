/**
 * Drawing System for Map Annotation and Playback
 * Allows users to draw on the map, records the path, and plays it back as an animation.
 */
class DrawingSystem {
    constructor(map, viewer) {
        this.map = map;
        this.viewer = viewer;
        this.isDrawing = false;
        this.isEraser = false; // Eraser mode
        this.isRecording = false;
        this.isPlaying = false;
        this.currentPath = [];
        this.recordedPaths = []; // Array of { path: [], timestamp: start, polyline: obj }
        this.currentPolyline = null;

        // Configuration
        this.strokeColor = '#ff0000'; // Default Red
        this.strokeWeight = 5;
        this.strokeOpacity = 1.0; // Solid line by default

        this.init();
    }

    init() {
        this.bindEvents();
        console.log("Drawing System Initialized");
    }

    // --- Style Setters ---
    setColor(color) {
        this.strokeColor = color;
        this.isEraser = false; // Switch back to draw
        this.map.setDefaultCursor('crosshair');
    }

    setWidth(width) {
        this.strokeWeight = parseInt(width);
    }

    setOpacity(opacity) {
        this.strokeOpacity = parseFloat(opacity);
    }

    toggleEraser() {
        this.isEraser = !this.isEraser;
        if (this.isEraser) {
            this.isDrawing = false; // Stop drawing
            this.map.setDefaultCursor('url(https://img.icons8.com/ios-filled/50/000000/eraser.png) 10 10, pointer'); // Custom cursor if possible, or just pointer
            // Or just use a simple cursor
            this.map.setDefaultCursor('cell');
            console.log("Eraser Mode Enabled");
        } else {
            this.map.setDefaultCursor('default');
            console.log("Eraser Mode Disabled");
        }
    }

    bindEvents() {
        // We bind to the map container for mouse events
        const mapContainer = document.getElementById('map');

        mapContainer.addEventListener('mousedown', (e) => {
            if (this.isEraser) {
                this.eraseAt(e);
                return;
            }
            if (!this.isDrawing) return;
            this.startStroke(e);
        });

        mapContainer.addEventListener('mousemove', (e) => {
            if (this.isEraser && e.buttons === 1) { // Drag to erase
                this.eraseAt(e);
                return;
            }
            if (!this.isDrawing || !this.isRecording) return;
            this.recordPoint(e);
        });

        mapContainer.addEventListener('mouseup', () => {
            if (this.isEraser) return;
            if (!this.isDrawing) return;
            this.endStroke();
        });

        // Touch support
        mapContainer.addEventListener('touchstart', (e) => {
            if (!this.isDrawing) return;
            this.startStroke(e.touches[0]);
        });

        mapContainer.addEventListener('touchmove', (e) => {
            if (!this.isDrawing || !this.isRecording) return;
            this.recordPoint(e.touches[0]);
        });

        mapContainer.addEventListener('touchend', () => {
            if (!this.isDrawing) return;
            this.endStroke();
        });
    }

    enableDrawing() {
        this.isDrawing = true;
        this.isEraser = false;
        this.map.setStatus({
            dragEnable: false,
            zoomEnable: false
        });
        this.map.setDefaultCursor('crosshair');
        console.log("Drawing Enabled");
    }

    disableDrawing() {
        this.isDrawing = false;
        this.isEraser = false;
        this.isRecording = false;
        this.map.setStatus({
            dragEnable: true,
            zoomEnable: true
        });
        this.map.setDefaultCursor('default');
        console.log("Drawing Disabled");
    }

    startStroke(e) {
        this.isRecording = true;
        this.currentPath = [];

        // Create a new polyline for this stroke
        this.currentPolyline = new AMap.Polyline({
            path: [],
            strokeColor: this.strokeColor,
            strokeWeight: this.strokeWeight,
            strokeOpacity: this.strokeOpacity,
            lineJoin: 'round', // Smooth joints
            lineCap: 'round',  // Smooth ends
            zIndex: 200,
            bubble: true // Allow events to bubble if needed
        });
        this.map.add(this.currentPolyline);

        this.recordPoint(e);
    }

    recordPoint(e) {
        const container = document.getElementById('map');
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const lngLat = this.map.containerToLngLat(new AMap.Pixel(x, y));

        const point = {
            lng: lngLat.getLng(),
            lat: lngLat.getLat(),
            time: Date.now()
        };

        this.currentPath.push(point);

        // Update visual line
        const path = this.currentPolyline.getPath();
        path.push(lngLat);
        this.currentPolyline.setPath(path);
    }

    endStroke() {
        this.isRecording = false;
        if (this.currentPath.length > 0) {
            this.recordedPaths.push({
                points: [...this.currentPath],
                color: this.strokeColor,
                weight: this.strokeWeight,
                opacity: this.strokeOpacity,
                polyline: this.currentPolyline // Store reference for eraser
            });
        }
        this.currentPolyline = null;
    }

    eraseAt(e) {
        // Simple eraser: Find polyline closest to click and remove it
        // For better UX, we could use AMap's getOverlays and check distance

        const container = document.getElementById('map');
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const clickLngLat = this.map.containerToLngLat(new AMap.Pixel(x, y));

        // Iterate through recorded paths and check distance
        // This is a naive implementation, checking distance to every point
        // Optimization: Use bounding box first

        const threshold = 50; // meters (approx, depends on zoom)
        // Better: Screen pixel distance. 
        // Let's use AMap.GeometryUtil.distanceToLine? No, that's for point to line.

        // Let's just iterate our recorded paths
        for (let i = this.recordedPaths.length - 1; i >= 0; i--) {
            const item = this.recordedPaths[i];
            if (!item.polyline) continue;

            // Check if click is near this polyline
            const isNear = AMap.GeometryUtil.isPointOnLine(clickLngLat, item.polyline.getPath(), 20); // 20 meters tolerance?
            // Note: isPointOnLine tolerance is in meters. At zoom 4, 20m is nothing.
            // We need dynamic tolerance based on zoom.
            const resolution = this.map.getResolution(clickLngLat, this.map.getZoom());
            const tolerance = resolution * 10; // 10 pixels

            if (AMap.GeometryUtil.isPointOnLine(clickLngLat, item.polyline.getPath(), tolerance)) {
                // Remove it
                this.map.remove(item.polyline);
                this.recordedPaths.splice(i, 1);
                console.log("Erased stroke");
                return; // Delete one at a time
            }
        }
    }

    clear() {
        this.recordedPaths = [];
        const overlays = this.map.getAllOverlays('polyline');
        this.map.remove(overlays);
        console.log("Drawings Cleared");
    }

    async play() {
        if (this.isPlaying || this.recordedPaths.length === 0) return;

        this.isPlaying = true;
        this.disableDrawing(); // Ensure we aren't drawing while playing

        // Clear current static lines to prepare for animation
        const overlays = this.map.getAllOverlays('polyline');
        this.map.remove(overlays);

        console.log("Starting Playback...");

        const startTime = Date.now();

        if (this.recordedPaths.length === 0) {
            this.isPlaying = false;
            return;
        }

        const globalStartTime = this.recordedPaths[0].points[0].time;

        // Create polylines for animation
        const activePolylines = this.recordedPaths.map(pathData => {
            const poly = new AMap.Polyline({
                path: [],
                strokeColor: pathData.color,
                strokeWeight: pathData.weight,
                strokeOpacity: pathData.opacity || 1.0,
                lineJoin: 'round',
                lineCap: 'round',
                zIndex: 200
            });
            this.map.add(poly);
            return {
                poly: poly,
                data: pathData,
                currentIndex: 0
            };
        });

        // Animation Loop
        const animate = () => {
            if (!this.isPlaying) return;

            const now = Date.now();
            const timeElapsed = now - startTime;
            const currentSimulatedTime = globalStartTime + timeElapsed;

            let allFinished = true;

            activePolylines.forEach(item => {
                const points = item.data.points;

                // Add points that should be visible by now
                while (item.currentIndex < points.length) {
                    const point = points[item.currentIndex];
                    if (point.time <= currentSimulatedTime) {
                        const path = item.poly.getPath();
                        path.push(new AMap.LngLat(point.lng, point.lat));
                        item.poly.setPath(path);
                        item.currentIndex++;
                    } else {
                        break; // Next point is in the future
                    }
                }

                if (item.currentIndex < points.length) {
                    allFinished = false;
                }
            });

            if (!allFinished) {
                requestAnimationFrame(animate);
            } else {
                this.isPlaying = false;
                console.log("Playback Finished");
            }
        };

        requestAnimationFrame(animate);
    }
}

// Export for global use
window.DrawingSystem = DrawingSystem;
