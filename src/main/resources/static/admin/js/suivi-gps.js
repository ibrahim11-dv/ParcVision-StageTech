// Profile popup
document.getElementById('profileRow').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('profilePopup').classList.toggle('show');
});
document.addEventListener('click', () => {
    document.getElementById('profilePopup').classList.remove('show');
});

// Theme toggle functionality
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark');
        updateThemeUI(true);
    } else {
        document.body.classList.remove('dark');
        updateThemeUI(false);
    }
}

function updateThemeUI(isDark) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (isDark) {
        themeIcon.className = 'bi bi-sun';
        themeText.textContent = 'Mode clair';
    } else {
        themeIcon.className = 'bi bi-moon-stars';
        themeText.textContent = 'Mode sombre';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
}

document.getElementById('themeToggleBtn').addEventListener('click', (e) => {
    e.preventDefault();
    toggleTheme();
    document.getElementById('profilePopup').classList.remove('show');
});

initTheme();

// Mobile sidebar functions
window.openMobile = function() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').style.display = 'block';
};
window.closeMobile = function() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
};

// ==========================================
// Map Initialization and Logic (Leaflet.js)
// ==========================================
let map;
let markers = [];

document.addEventListener("DOMContentLoaded", function() {
    // Initialize map centered on Morocco
    map = L.map('map').setView([33.5, -7.5], 6);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Custom Icon for Live Vehicles
    const truckIcon = L.icon({
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzFhMmE2YyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIj48cGF0aCBkPSJNMTkgN2gtM2YtMS0xLjUtMkg4bS0xIDEuNS0ySDF2OWgxYzAgMS42NiAxLjM0IDMgMyAzczMtMS4zNCAzLTNoMThjMCAxLjY2IDEuMzQgMyAzIDNzMy0xLjM0IDMtM2gxdjZsLTItMnoiLz48L3N2Zz4=', // Custom truck icon placeholder base64 can be placed, or we use default
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    const activeMissions = [
        {
            id: "#MSN-001",
            driver: "Jean Dupont",
            vehicle: "Renault Master",
            plate: "12345 | A | 1",
            lat: 33.5731, 
            lng: -7.5898,
            destination: "Rabat",
            status: "En route",
            speed: "65 km/h"
        },
        {
            id: "#MSN-002",
            driver: "Karim Alaoui",
            vehicle: "Peugeot Partner",
            plate: "67890 | B | 6",
            lat: 34.0208, 
            lng: -6.8416,
            destination: "Kenitra",
            status: "Livré",
            speed: "0 km/h"
        }
    ];

    // Add markers to map
    activeMissions.forEach(mission => {
        let color = mission.status === "Livré" ? "#10b981" : "#f59e0b";
        
        // Use HTML element for marker to create a pulse effect for moving vehicles
        let htmlIcon = `<div style="position:relative; width:20px; height:20px;">
                            <div style="width:16px;height:16px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);position:absolute;z-index:2;"></div>
                            ${mission.status === "En route" ? `<div style="width:16px;height:16px;background:${color};border-radius:50%;position:absolute;animation:pulse 1.5s infinite;z-index:1;"></div>` : ''}
                        </div>`;

        let divIcon = L.divIcon({
            className: 'custom-div-icon',
            html: htmlIcon,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const marker = L.marker([mission.lat, mission.lng], {icon: divIcon}).addTo(map);
        
        const popupContent = `
            <div class="custom-popup-title">${mission.id}</div>
            <div class="custom-popup-body">
                <strong>Conducteur:</strong> ${mission.driver}<br>
                <strong>Véhicule:</strong> ${mission.vehicle} (${mission.plate})<br>
                <strong>Destination:</strong> ${mission.destination}<br>
                <strong>Vitesse:</strong> ${mission.speed}
            </div>
        `;
        
        marker.bindPopup(popupContent);
        markers.push(marker);
    });

    // Fit bounds to show all markers
    if(markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.5));
    }
});

// Function to focus map on a specific mission from table click
window.focusMap = function(coords) {
    if(map) {
        map.setView(coords, 14, {
            animate: true,
            duration: 1
        });
        
        // Find and open the popup for the marker at these coordinates
        markers.forEach(marker => {
            const markerCoords = marker.getLatLng();
            if (markerCoords.lat === coords[0] && markerCoords.lng === coords[1]) {
                marker.openPopup();
            }
        });
    }
};

// ==========================================
// Map Selection Logic for Modals
// ==========================================
let isSelectingMap = false;
let mapSelectionTarget = { latId: '', lngId: '', modalId: '' };
let currentModalInstance = null;

window.startMapSelection = function(latId, lngId, modalId) {
    isSelectingMap = true;
    mapSelectionTarget = { latId, lngId, modalId };
    
    // Hide the modal using Bootstrap API
    const modalEl = document.getElementById(modalId);
    currentModalInstance = bootstrap.Modal.getInstance(modalEl);
    if(currentModalInstance) {
        currentModalInstance.hide();
    }
    
    // Show banner and change map cursor
    document.getElementById('mapSelectionBanner').style.setProperty('display', 'flex', 'important');
    document.getElementById('map').style.cursor = 'crosshair';
    
    // Scroll to map
    document.getElementById('map').scrollIntoView({behavior: 'smooth', block: 'center'});
};

window.cancelMapSelection = function() {
    isSelectingMap = false;
    document.getElementById('mapSelectionBanner').style.setProperty('display', 'none', 'important');
    document.getElementById('map').style.cursor = '';
    
    // Re-show modal
    if(currentModalInstance) {
        currentModalInstance.show();
    }
};

// Listen to map clicks globally
document.addEventListener("DOMContentLoaded", function() {
    // Wait slightly to ensure map is initialized
    setTimeout(() => {
        if(map) {
            map.on('click', function(e) {
                if(isSelectingMap) {
                    // We captured a click during selection mode
                    const lat = e.latlng.lat.toFixed(6);
                    const lng = e.latlng.lng.toFixed(6);
                    
                    // Fill inputs
                    document.getElementById(mapSelectionTarget.latId).value = lat;
                    document.getElementById(mapSelectionTarget.lngId).value = lng;
                    
                    // End selection mode
                    isSelectingMap = false;
                    document.getElementById('mapSelectionBanner').style.setProperty('display', 'none', 'important');
                    document.getElementById('map').style.cursor = '';
                    
                    // Add a temporary marker to show selected point
                    const tempMarker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'custom-div-icon',
                            html: '<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>',
                            iconSize: [16, 16],
                            iconAnchor: [8, 8]
                        })
                    }).addTo(map);
                    
                    // Remove temporary marker after 3 seconds
                    setTimeout(() => map.removeLayer(tempMarker), 3000);
                    
                    // Re-show modal
                    if(currentModalInstance) {
                        currentModalInstance.show();
                    }
                }
            });
        }
    }, 1000);
});
