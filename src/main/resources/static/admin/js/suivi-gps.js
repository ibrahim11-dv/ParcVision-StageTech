// ==========================================
// Modal & Helper functions
// ==========================================

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

let missionIdToDelete = null;

function openDeleteModal(id) {
    missionIdToDelete = id;
    const mission = allMissions.find(m => m.id === id);
    const textEl = document.getElementById('deleteConfirmText');
    if (textEl && mission) {
        textEl.textContent = `Voulez-vous vraiment supprimer la mission ${mission.reference} ? Cette action est irréversible.`;
    }
    openModal('confirmDeleteModal');
}

async function submitDeleteMission() {
    if (!missionIdToDelete) return;
    try {
        const response = await fetch(`/api/missions/${missionIdToDelete}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            closeModal('confirmDeleteModal');
            fetchMissions();
            if (window.loadSidebarStats) window.loadSidebarStats();
            showSuccess('Mission supprimée', 'La mission a été supprimée avec succès.');
        } else {
            const error = await response.text();
            showNotification("Erreur de suppression", "Erreur lors de la suppression: " + error, "error");
        }
    } catch (error) {
        console.error('Error deleting mission:', error);
        showNotification("Erreur", "Une erreur est survenue lors de la suppression.", "error");
    } finally {
        missionIdToDelete = null;
    }
}

// Click outside modal to close
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
});

// ==========================================
// City Presets for Moroccan Corridors
// ==========================================
window.applyCityPreset = function(presetKey, targetType) {
    const presets = {
        casa_port: { label: "Port de Casablanca, Boulevard des Almohades, Casablanca", lat: 33.6015, lng: -7.6080 },
        casa_zenata: { label: "Plateforme Logistique Zenata, Casablanca", lat: 33.6335, lng: -7.4890 },
        rabat_tech: { label: "Campus Technopolis, Sala Al Jadida, Rabat", lat: 33.9922, lng: -6.7214 },
        marrakech_sidi: { label: "Zone Industrielle Sidi Ghanem, Marrakech", lat: 31.6610, lng: -8.0410 },
        tanger_med: { label: "Terminal Roulier Tanger Med, Ksar El Majaz, Tanger", lat: 35.8872, lng: -5.5036 },
        fes_ain: { label: "Parc Industriel Ain Chkef, Route de Sefrou, Fès", lat: 34.0150, lng: -5.0230 },
        agadir_anza: { label: "Zone Franche Portuaire Anza, Agadir", lat: 30.4430, lng: -9.6410 }
    };
    const p = presets[presetKey];
    if (!p) return;
    if (targetType === 'depart') {
        const addr = document.getElementById('adress_depart');
        const lat = document.getElementById('add-lat-start');
        const lng = document.getElementById('add-lng-start');
        if (addr) addr.value = p.label;
        if (lat) lat.value = p.lat;
        if (lng) lng.value = p.lng;
    } else {
        const addr = document.getElementById('adress_fin');
        const lat = document.getElementById('add-lat-end');
        const lng = document.getElementById('add-lng-end');
        if (addr) addr.value = p.label;
        if (lat) lat.value = p.lat;
        if (lng) lng.value = p.lng;
    }
};

// ==========================================
// Mission Management & Map Logic
// ==========================================
let map;
let missionLayers = []; // Stores all map layers related to missions
let vehicleMarkers = {}; // Stores car markers by mission ID for interactive targeting
let vehiclePopups = {};  // Stores popups by mission ID
let allMissions = [];
let missionTrajectories = {}; // Stores all waypoints by mission ID for simulation
let missionIdToConfirm = null;

let currentPage = 0;
let pageSize = 10; 
let searchQuery = '';
let currentStatusFilter = 'ALL';

// Simulation state
let isSimulationRunning = false;
let simulationInterval = null;
let simulationStep = 0;

async function fetchMissions() {
    try {
        let url = `/api/missions?page=${currentPage}&size=${pageSize}&search=${encodeURIComponent(searchQuery)}`;
        if (currentStatusFilter !== 'ALL') {
            url += `&status=${currentStatusFilter}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch missions');
        const data = await response.json();
        
        allMissions = data.content;
        
        // Update top KPI cards
        updateMapKpis(allMissions, data.totalElements);

        renderMissions(allMissions);
        renderPagination(data);
    } catch (error) {
        console.error('Error fetching missions:', error);
    }
}

function updateMapKpis(missions, totalCount) {
    const activeVehiclesEl = document.getElementById('kpiActiveVehicles');
    const activeMissionsEl = document.getElementById('kpiActiveMissions');
    const totalCargoEl = document.getElementById('kpiTotalCargo');

    const inTransit = missions.filter(m => m.statut === 'EN_COURS').length;
    const totalCargoWeight = missions.reduce((sum, m) => sum + (m.colisPoids || 0), 0);

    if (activeVehiclesEl) activeVehiclesEl.textContent = `${inTransit} actif${inTransit > 1 ? 's' : ''}`;
    if (activeMissionsEl) activeMissionsEl.textContent = `${totalCount || missions.length} mission${(totalCount || missions.length) > 1 ? 's' : ''}`;
    if (totalCargoEl) totalCargoEl.textContent = `${Math.round(totalCargoWeight).toLocaleString()} kg`;
}

document.getElementById('statusFilter')?.addEventListener('change', function(e) {
    currentStatusFilter = e.target.value;
    currentPage = 0;
    fetchMissions();
});

function renderMissions(missions) {
    const tableBody = document.getElementById('missionsTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    // Clear previous layers & markers
    missionLayers.forEach(layer => map && map.removeLayer(layer));
    missionLayers = [];
    vehicleMarkers = {};
    vehiclePopups = {};

    if (missions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Aucune mission trouvée pour ce filtre.</td></tr>';
        return;
    }

    missions.forEach(mission => {
        const row = document.createElement('tr');
        row.id = `mission-row-${mission.id}`;
        row.style.cursor = 'pointer';
        row.title = "Cliquez pour localiser sur la carte";
        row.onclick = () => focusMissionOnMap(mission.id);

        const isDelivered = mission.statut === 'TERMINEE';

        row.innerHTML = `
            <td style="padding-left: 18px;"><span class="fw-bold text-primary">${mission.reference}</span></td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="profile-av" style="width: 28px; height: 28px; border-radius: 8px; font-size: 0.65rem;">
                        ${mission.conducteurNomComplet ? mission.conducteurNomComplet.split(' ').map(n => n[0]).join('') : '??'}
                    </div>
                    <div>
                        <div class="fw-semibold text-dark">${mission.conducteurNomComplet || 'Inconnu'}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="text-dark"><i class="bi bi-truck me-1 text-muted"></i> ${mission.vehiculeMarqueModele || 'Véhicule'}</div>
                <small class="text-muted">${mission.vehiculeImmatriculation || '--'}</small>
            </td>
            <td>
                <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-2">
                    ${mission.colisType || 'STANDARD'} (${mission.colisPoids ? mission.colisPoids.toFixed(0) : '0'} kg)
                </span>
                <small class="d-block text-muted text-truncate" style="max-width:180px;">${mission.colisDescription || ''}</small>
            </td>
            <td>
                <small class="d-block text-muted text-truncate" style="max-width:210px;"><i class="bi bi-record-circle text-success me-1"></i> ${mission.adresseDepart || '--'}</small>
                <small class="d-block text-muted text-truncate" style="max-width:210px;"><i class="bi bi-geo-alt text-danger me-1"></i> ${mission.adresseArrivee || '--'}</small>
            </td>
            <td>${getStatusBadge(mission.statut)}</td>
            <td class="text-end" style="padding-right: 18px;">
                <div class="d-flex justify-content-end gap-1">
                    <button class="btn-icon" title="Centrer sur la carte" onclick="event.stopPropagation(); focusMissionOnMap(${mission.id})">
                        <i class="bi bi-crosshair text-primary"></i>
                    </button>
                    ${!isDelivered ? `
                        <button class="btn-icon" title="Confirmer Livraison" onclick="event.stopPropagation(); confirmDelivery(${mission.id})"><i class="bi bi-check-circle text-success"></i></button>
                    ` : `
                        <button class="btn-icon" disabled><i class="bi bi-check-circle-fill text-muted"></i></button>
                    `}
                    <button class="btn-icon" title="Modifier" data-bs-toggle="modal" data-bs-target="#editMissionModal" onclick="event.stopPropagation(); prepareEdit(${mission.id})"><i class="bi bi-pencil-square text-primary"></i></button>
                    <button class="btn-icon" title="Supprimer" style="color: #dc3545 !important;" onclick="event.stopPropagation(); openDeleteModal(${mission.id})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);

        // Draw trajectory on map
        drawMissionTrajectory(mission);
    });

    // Auto-fit all missions
    setTimeout(() => {
        fitAllMissions();
    }, 400);
}

async function drawMissionTrajectory(mission) {
    if (!map) return;
    try {
        const response = await fetch(`/api/missions/${mission.id}/points`);
        let allPoints = [];
        if (response.ok) {
            allPoints = await response.json();
            allPoints.sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp));
        }

        missionTrajectories[mission.id] = allPoints;

        const startPoint = allPoints.find(p => p.typePoint === 'DEPART');
        const endPoint = allPoints.find(p => p.typePoint === 'ARRIVEE');
        const enCoursPoints = allPoints.filter(p => p.typePoint === 'EN_COURS');

        let currentPos;
        let speed = 0;
        if (mission.statut === 'TERMINEE' && endPoint) {
            currentPos = { lat: endPoint.laltitude, lng: endPoint.longitude, speed: 0 };
        } else if (enCoursPoints.length > 0) {
            const latest = enCoursPoints[enCoursPoints.length - 1];
            currentPos = { lat: latest.laltitude, lng: latest.longitude, speed: latest.vitesse || 75 };
            speed = latest.vitesse || 75;
        } else if (startPoint) {
            currentPos = { lat: startPoint.laltitude, lng: startPoint.longitude, speed: 0 };
        } else if (mission.latitudeDepart && mission.longitudeDepart) {
            currentPos = { lat: mission.latitudeDepart, lng: mission.longitudeDepart, speed: 0 };
        }

        // 1. Draw Traveled Path (Solid glowing line)
        const traveledPoints = allPoints.filter(p => p.typePoint === 'DEPART' || p.typePoint === 'EN_COURS');
        if (mission.statut === 'TERMINEE' && endPoint) {
            traveledPoints.push(endPoint);
        }

        if (traveledPoints.length > 1) {
            const historyLatLngs = traveledPoints.map(p => [p.laltitude, p.longitude]);
            
            // Outer glow line
            const glowPolyline = L.polyline(historyLatLngs, {
                color: '#3b82f6',
                weight: 8,
                opacity: 0.25,
                lineJoin: 'round'
            }).addTo(map);
            missionLayers.push(glowPolyline);

            // Core solid line
            const corePolyline = L.polyline(historyLatLngs, {
                color: '#1d4ed8',
                weight: 4,
                opacity: 0.9,
                lineJoin: 'round'
            }).addTo(map);
            missionLayers.push(corePolyline);
        }

        // 2. Draw Remaining Path (Dashed accent line)
        if (mission.statut !== 'TERMINEE' && endPoint && currentPos) {
            const remainingLatLngs = [
                [currentPos.lat, currentPos.lng],
                [endPoint.laltitude, endPoint.longitude]
            ];
            const remainingPolyline = L.polyline(remainingLatLngs, {
                color: '#f59e0b',
                weight: 3,
                opacity: 0.7,
                dashArray: '8, 8',
                lineJoin: 'round'
            }).addTo(map);
            missionLayers.push(remainingPolyline);
        }

        // 3. Start Marker (A - Green)
        const startLat = startPoint ? startPoint.laltitude : mission.latitudeDepart;
        const startLng = startPoint ? startPoint.longitude : mission.longitudeDepart;
        if (startLat && startLng) {
            const startMarker = L.marker([startLat, startLng], {
                icon: L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="width:26px;height:26px;background:#10b981;border-radius:50%;border:3px solid white;box-shadow:0 3px 10px rgba(16,185,129,0.5);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:800;font-family:'Outfit',sans-serif;">A</div>`,
                    iconSize: [26, 26],
                    iconAnchor: [13, 13]
                })
            }).addTo(map).bindPopup(`
                <div class="pv-map-popup">
                    <div class="pv-map-popup-header">
                        <span class="pv-map-popup-ref">${mission.reference}</span>
                        <span class="badge bg-success">Départ</span>
                    </div>
                    <div class="pv-map-popup-item"><i class="bi bi-geo-alt-fill text-success"></i> ${mission.adresseDepart || 'Lieu de départ'}</div>
                    <div class="pv-map-popup-item"><i class="bi bi-calendar3"></i> ${mission.dateDebut ? new Date(mission.dateDebut).toLocaleDateString() : '--'}</div>
                </div>
            `);
            missionLayers.push(startMarker);
        }

        // 4. Destination Marker (B - Red)
        const endLat = endPoint ? endPoint.laltitude : mission.latitudeDestination;
        const endLng = endPoint ? endPoint.longitude : mission.longitudeDestination;
        if (endLat && endLng) {
            const destMarker = L.marker([endLat, endLng], {
                icon: L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="width:26px;height:26px;background:#ef4444;border-radius:50%;border:3px solid white;box-shadow:0 3px 10px rgba(239,68,68,0.5);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:800;font-family:'Outfit',sans-serif;">B</div>`,
                    iconSize: [26, 26],
                    iconAnchor: [13, 13]
                })
            }).addTo(map).bindPopup(`
                <div class="pv-map-popup">
                    <div class="pv-map-popup-header">
                        <span class="pv-map-popup-ref">${mission.reference}</span>
                        <span class="badge bg-danger">Arrivée</span>
                    </div>
                    <div class="pv-map-popup-item"><i class="bi bi-flag-fill text-danger"></i> ${mission.adresseArrivee || 'Destination'}</div>
                    <div class="pv-map-popup-item"><i class="bi bi-clock"></i> Fin estimée : ${mission.dateFinEstimee ? new Date(mission.dateFinEstimee).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}</div>
                </div>
            `);
            missionLayers.push(destMarker);
        }

        // 5. Current Vehicle Marker (Car Icon with Pulse Ring)
        if (currentPos && mission.statut !== 'ANNULEE') {
            const isFinished = mission.statut === 'TERMINEE';
            const iconBg = isFinished ? '#10b981' : '#3b82f6';
            const pulseColor = isFinished ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)';

            const carMarker = L.marker([currentPos.lat, currentPos.lng], {
                icon: L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="car-tracker-marker" style="background:${iconBg};">
                                <i class="bi ${isFinished ? 'bi-check-lg' : 'bi-truck'}"></i>
                                ${!isFinished ? `<div class="pulse-ring" style="background:${pulseColor};"></div>` : ''}
                           </div>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                }),
                zIndexOffset: 1000 
            }).addTo(map);

            const popupHtml = buildMissionPopupHtml(mission, currentPos.lat, currentPos.lng, speed);
            carMarker.bindPopup(popupHtml);

            missionLayers.push(carMarker);
            vehicleMarkers[mission.id] = carMarker;
        }

    } catch (error) {
        console.error('Error drawing trajectory:', error);
    }
}

function buildMissionPopupHtml(mission, lat, lng, speed) {
    const isEnRoute = mission.statut === 'EN_COURS';
    const progressPercent = isEnRoute ? 68 : (mission.statut === 'TERMINEE' ? 100 : 0);

    return `
        <div class="pv-map-popup">
            <div class="pv-map-popup-header">
                <div>
                    <span class="pv-map-popup-ref">${mission.reference}</span>
                    <span class="d-block small text-muted">${mission.vehiculeMarqueModele || 'Véhicule'}</span>
                </div>
                <span class="pv-map-popup-speed">${isEnRoute ? (speed || 80) + ' km/h' : (mission.statut === 'TERMINEE' ? 'Livré' : 'À l\'arrêt')}</span>
            </div>
            <div class="pv-map-popup-item">
                <i class="bi bi-person-badge text-primary"></i>
                <strong>${mission.conducteurNomComplet || 'Conducteur'}</strong>
            </div>
            <div class="pv-map-popup-item">
                <i class="bi bi-truck text-muted"></i>
                <span>${mission.vehiculeImmatriculation || '--'}</span>
            </div>
            <div class="pv-map-popup-item">
                <i class="bi bi-box-seam text-warning"></i>
                <span>${mission.colisDescription || 'Marchandise'} (${mission.colisPoids ? mission.colisPoids.toFixed(0) : 0} kg)</span>
            </div>
            <div class="pv-map-popup-item">
                <i class="bi bi-geo-alt text-success"></i>
                <small class="text-truncate" style="max-width:200px;">${mission.adresseDepart || '--'}</small>
            </div>
            <div class="pv-map-popup-item">
                <i class="bi bi-flag text-danger"></i>
                <small class="text-truncate" style="max-width:200px;">${mission.adresseArrivee || '--'}</small>
            </div>
            <div class="pv-map-progress">
                <div class="pv-map-progress-bar" style="width: ${progressPercent}%;"></div>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2" style="font-size:0.75rem; color:var(--gray-400);">
                <span>Progression : ${progressPercent}%</span>
                <span>GPS : ${lat ? lat.toFixed(4) : '--'}, ${lng ? lng.toFixed(4) : '--'}</span>
            </div>
        </div>
    `;
}

window.focusMissionOnMap = function(missionId) {
    const mission = allMissions.find(m => m.id === missionId);
    if (!mission || !map) return;

    // Highlight row in table
    document.querySelectorAll('#missionsTableBody tr').forEach(tr => tr.classList.remove('active-mission-row'));
    const targetRow = document.getElementById(`mission-row-${missionId}`);
    if (targetRow) targetRow.classList.add('active-mission-row');

    const marker = vehicleMarkers[missionId];
    if (marker) {
        const latLng = marker.getLatLng();
        map.flyTo(latLng, 12, { animate: true, duration: 1.2 });
        setTimeout(() => {
            marker.openPopup();
        }, 800);
    } else if (mission.latitudeDepart && mission.longitudeDepart) {
        map.flyTo([mission.latitudeDepart, mission.longitudeDepart], 12, { animate: true, duration: 1.2 });
    }
};

window.fitAllMissions = function() {
    if (!map) return;
    const markersAndLines = missionLayers.filter(l => (l instanceof L.Marker) || (l instanceof L.Polyline));
    if (markersAndLines.length > 0) {
        const group = new L.featureGroup(markersAndLines);
        const bounds = group.getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds.pad(0.15), { animate: true, duration: 1 });
            return;
        }
    }
    // Default Moroccan bounding view
    map.setView([33.5, -7.0], 6.5);
};

// ==========================================
// LIVE GPS SIMULATION ENGINE
// ==========================================
window.toggleSimulation = function() {
    isSimulationRunning = !isSimulationRunning;
    const btn = document.getElementById('simToggleBtn');
    const icon = document.getElementById('simIcon');
    const label = document.getElementById('simBtnLabel');
    const statusText = document.getElementById('mapStatusText');

    if (isSimulationRunning) {
        if (btn) {
            btn.classList.replace('btn-primary', 'btn-warning');
        }
        if (icon) icon.className = 'bi bi-pause-fill me-1';
        if (label) label.textContent = 'Pause Simulation';
        if (statusText) statusText.innerHTML = '<span class="text-success fw-bold"><i class="bi bi-broadcast me-1"></i> Simulation active (Véhicules en route)</span>';

        startLiveSimulation();
        if (window.showToast) window.showToast('Simulation GPS en direct démarrée ! Les camions avancent sur les autoroutes.', 'info');
    } else {
        if (btn) {
            btn.classList.replace('btn-warning', 'btn-primary');
        }
        if (icon) icon.className = 'bi bi-play-fill me-1';
        if (label) label.textContent = 'Simuler en direct';
        if (statusText) statusText.textContent = 'Mise à jour en temps réel';

        stopLiveSimulation();
        if (window.showToast) window.showToast('Simulation en pause', 'info');
    }
};

function startLiveSimulation() {
    if (simulationInterval) clearInterval(simulationInterval);

    simulationInterval = setInterval(() => {
        simulationStep++;

        allMissions.filter(m => m.statut === 'EN_COURS').forEach(mission => {
            const marker = vehicleMarkers[mission.id];
            const points = missionTrajectories[mission.id];
            if (!marker || !points || points.length < 2) return;

            // Generate smooth moving interpolation along waypoints
            const totalPoints = points.length;
            const cycleIndex = (simulationStep + mission.id) % (totalPoints * 10);
            const fromIdx = Math.floor(cycleIndex / 10) % (totalPoints - 1);
            const toIdx = (fromIdx + 1) % totalPoints;
            const fraction = (cycleIndex % 10) / 10;

            const p1 = points[fromIdx];
            const p2 = points[toIdx];

            const currentLat = p1.laltitude + (p2.laltitude - p1.laltitude) * fraction;
            const currentLng = p1.longitude + (p2.longitude - p1.longitude) * fraction;

            // Realistic fluctuating speed (75 to 98 km/h)
            const speedFluctuation = Math.round(80 + Math.sin(simulationStep + mission.id) * 12);

            marker.setLatLng([currentLat, currentLng]);

            // If popup is open, update its content live
            if (marker.isPopupOpen()) {
                marker.setPopupContent(buildMissionPopupHtml(mission, currentLat, currentLng, speedFluctuation));
            }
        });
    }, 1200);
}

function stopLiveSimulation() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
}

// ==========================================
// Pagination & Table search
// ==========================================
function renderPagination(data) {
    const container = document.getElementById('pagination-container');
    const summary = document.getElementById('pagination-info');
    if (!container || !summary) return;

    container.innerHTML = '';
    const totalPages = data.totalPages;
    const totalElements = data.totalElements;
    const start = data.totalElements === 0 ? 0 : data.number * data.size + 1;
    const end = Math.min(start + data.size - 1, totalElements);

    summary.textContent = totalElements > 0 
        ? `Affichage de ${start} à ${end} sur ${totalElements} missions`
        : 'Aucune mission à afficher';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = `btn-icon ${data.first ? 'disabled' : ''}`;
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.disabled = data.first;
    prevBtn.onclick = () => {
        currentPage = data.number - 1;
        fetchMissions();
    };
    container.appendChild(prevBtn);

    for (let i = 0; i < totalPages; i++) {
        if (i === 0 || i === totalPages - 1 || (i >= data.number - 1 && i <= data.number + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn-icon ${i === data.number ? 'active' : ''}`;
            pageBtn.style.width = '32px';
            pageBtn.textContent = i + 1;
            pageBtn.onclick = () => {
                currentPage = i;
                fetchMissions();
            };
            container.appendChild(pageBtn);
        } else if (i === 1 || i === totalPages - 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.alignSelf = 'center';
            dots.style.color = 'var(--text-muted)';
            container.appendChild(dots);
        }
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = `btn-icon ${data.last ? 'disabled' : ''}`;
    nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextBtn.disabled = data.last;
    nextBtn.onclick = () => {
        currentPage = data.number + 1;
        fetchMissions();
    };
    container.appendChild(nextBtn);
}

// Search with debounce
let searchTimeout;
document.getElementById('missionSearchInput')?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        searchQuery = e.target.value;
        currentPage = 0;
        fetchMissions();
    }, 400);
});

function getStatusBadge(statut) {
    const configs = {
        'PLANIFIEE': { class: 'prio-faible', text: 'Planifiée' },
        'EN_COURS': { class: 'prio-normale', text: 'En route', pulse: true },
        'TERMINEE': { class: 'prio-faible', text: 'Livré' },
        'ANNULEE': { class: 'prio-haute', text: 'Annulée' }
    };
    const config = configs[statut] || { class: 'prio-normale', text: statut };
    return `<span class="prio-badge ${config.class}">
                ${config.pulse ? '<span class="pulse-dot"></span> ' : ''}${config.text}
            </span>`;
}

async function populateDropdowns() {
    try {
        const [driversRes, vehiclesRes] = await Promise.all([
            fetch('/api/missions/conducteurs'),
            fetch('/api/missions/vehicules')
        ]);

        if (driversRes.ok) {
            const drivers = await driversRes.json();
            const addSelect = document.getElementById('add_conducteur');
            const editSelect = document.getElementById('edit_conducteur');

            drivers.forEach(d => {
                if (addSelect) addSelect.add(new Option(d.nom, d.id));
                if (editSelect) editSelect.add(new Option(d.nom, d.id));
            });
        }

        if (vehiclesRes.ok) {
            const vehicles = await vehiclesRes.json();
            const addSelect = document.getElementById('add_vehicule');
            const editSelect = document.getElementById('edit_vehicule');

            vehicles.forEach(v => {
                if (addSelect) addSelect.add(new Option(v.label, v.id));
                if (editSelect) editSelect.add(new Option(v.label, v.id));
            });
        }
    } catch (error) {
        console.error('Error populating dropdowns:', error);
    }
}

async function confirmDelivery(missionId) {
    missionIdToConfirm = missionId;
    const modal = new bootstrap.Modal(document.getElementById('confirmDeliveryModal'));
    modal.show();
}

document.getElementById('confirmDeliveryAction')?.addEventListener('click', async () => {
    if (!missionIdToConfirm) return;
    
    try {
        const response = await fetch(`/api/missions/${missionIdToConfirm}/status?status=TERMINEE`, { method: 'PATCH' });
        if (response.ok) {
            const modalEl = document.getElementById('confirmDeliveryModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
            
            fetchMissions();
            if (window.loadSidebarStats) window.loadSidebarStats();
            missionIdToConfirm = null;
            showSuccess('Mission Livrée', 'La mission a été marquée comme livrée avec succès.');
        } else {
            showNotification('Erreur', 'Erreur lors de la mise à jour du statut.', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Erreur', 'Une erreur est survenue lors de la mise à jour.', 'error');
    }
});

// Map Click Picker Logic
let isSelectingMap = false;
let mapSelectionTarget = { latId: '', lngId: '', modalId: '' };
let currentModalInstance = null;

window.startMapSelection = function (latId, lngId, modalId) {
    isSelectingMap = true;
    mapSelectionTarget = { latId, lngId, modalId };
    const modalEl = document.getElementById(modalId);
    currentModalInstance = bootstrap.Modal.getInstance(modalEl);
    if (currentModalInstance) currentModalInstance.hide();

    const banner = document.getElementById('mapSelectionBanner');
    if (banner) banner.style.setProperty('display', 'flex', 'important');
    const mapEl = document.getElementById('map');
    if (mapEl) {
        mapEl.style.cursor = 'crosshair';
        mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

window.cancelMapSelection = function () {
    isSelectingMap = false;
    const banner = document.getElementById('mapSelectionBanner');
    if (banner) banner.style.setProperty('display', 'none', 'important');
    const mapEl = document.getElementById('map');
    if (mapEl) mapEl.style.cursor = '';
    if (currentModalInstance) currentModalInstance.show();
};

function showNotification(title, message, type = 'success') {
    if (window.showToast) {
        window.showToast(`${title}: ${message}`, type);
        return;
    }
    const titleEl = document.getElementById('successTitle');
    const msgEl = document.getElementById('successMessage');
    const iconEl = document.getElementById('successIcon');
    
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
}

function showSuccess(title, message) {
    showNotification(title, message, 'success');
}

function toggleTrackerFields(prefix) {
    const sw = document.getElementById(`${prefix}_is_gps_enabled`);
    const isEnabled = sw ? sw.checked : false;
    const fieldsDiv = document.getElementById(`${prefix}_tracker_fields`);
    if (fieldsDiv) {
        fieldsDiv.style.opacity = isEnabled ? '1' : '0.5';
        fieldsDiv.style.pointerEvents = isEnabled ? 'auto' : 'none';
    }
}

// ==========================================
// Map Initialization
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', submitDeleteMission);
    }

    // GPS Toggle Listeners
    const addGpsSwitch = document.getElementById('add_is_gps_enabled');
    if (addGpsSwitch) {
        addGpsSwitch.addEventListener('change', () => toggleTrackerFields('add'));
        toggleTrackerFields('add');
    }
    
    const editGpsSwitch = document.getElementById('edit_is_gps_enabled');
    if (editGpsSwitch) {
        editGpsSwitch.addEventListener('change', () => toggleTrackerFields('edit'));
        toggleTrackerFields('edit');
    }

    // Initialize Leaflet Map centered on Morocco
    map = L.map('map', {
        zoomControl: true,
        attributionControl: true
    }).setView([33.5, -7.0], 6.5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Parc Vision Telematics'
    }).addTo(map);

    fetchMissions();
    populateDropdowns();

    document.getElementById('saveMissionEdit')?.addEventListener('click', saveEditMission);

    map.on('click', function (e) {
        if (isSelectingMap) {
            const lat = e.latlng.lat.toFixed(6);
            const lng = e.latlng.lng.toFixed(6);
            if (mapSelectionTarget.latId) document.getElementById(mapSelectionTarget.latId).value = lat;
            if (mapSelectionTarget.lngId) document.getElementById(mapSelectionTarget.lngId).value = lng;

            isSelectingMap = false;
            document.getElementById('mapSelectionBanner').style.setProperty('display', 'none', 'important');
            document.getElementById('map').style.cursor = '';
            if (currentModalInstance) currentModalInstance.show();
        }
    });
});

let currentEditingId = null;

window.prepareEdit = function (id) {
    const mission = allMissions.find(m => m.id === id);
    if (!mission) return;

    currentEditingId = id;
    document.getElementById('edit_mission_id').value = id;
    const modal = document.getElementById('editMissionModal');
    const refEl = document.getElementById('edit_mission_ref');
    if (refEl) refEl.textContent = mission.reference;
    else if (modal.querySelector('.modal-title span')) modal.querySelector('.modal-title span').textContent = mission.reference;

    // Status
    document.getElementById('editStatutSelect').value = mission.statut;

    // Conducteur & Vehicule
    document.getElementById('edit_conducteur').value = mission.conducteurId;
    document.getElementById('edit_vehicule').value = mission.vehiculeId;

    // Trajet
    document.getElementById('edit_adresse_depart').value = mission.adresseDepart || '';
    document.getElementById('edit-lat-start').value = mission.latitudeDepart || '';
    document.getElementById('edit-lng-start').value = mission.longitudeDepart || '';

    document.getElementById('edit_adresse_destination').value = mission.adresseArrivee || '';
    document.getElementById('edit-lat-end').value = mission.latitudeDestination || '';
    document.getElementById('edit-lng-end').value = mission.longitudeDestination || '';

    if (mission.dateDebut) {
        document.getElementById('edit_date_depart').value = mission.dateDebut.substring(0, 16);
    }
    if (mission.dateFinEstimee) {
        document.getElementById('edit_date_fin_estimee').value = mission.dateFinEstimee.substring(0, 16);
    }

    // Colis
    document.getElementById('edit_colis_description').value = mission.colisDescription || '';
    document.getElementById('edit_colis_code_suivi').value = mission.colisCodeSuivi || '';
    document.getElementById('edit_colis_type').value = mission.colisType || 'STANDARD';
    document.getElementById('edit_colis_poids').value = mission.colisPoids || '';
    document.getElementById('edit_colis_volume').value = mission.colisVolume || '';

    // Instructions
    document.getElementById('edit_instructions').value = mission.instructionsSpeciales || '';

    // GPS Tracker info
    document.getElementById('edit_is_gps_enabled').checked = mission.gpsEnabled || false;
    document.getElementById('edit_tracker_id').value = mission.trackerId || '';
    document.getElementById('edit_tracker_imei').value = mission.trackerImei || '';
    document.getElementById('edit_tracker_sim').value = mission.trackerSimNumber || '';

    toggleTrackerFields('edit');
};

async function saveEditMission() {
    if (!currentEditingId) return;

    const missionData = {
        id: currentEditingId,
        conducteurId: document.getElementById('edit_conducteur').value,
        vehiculeId: document.getElementById('edit_vehicule').value,
        adressDepart: document.getElementById('edit_adresse_depart').value,
        latitudeDepart: parseFloat(document.getElementById('edit-lat-start').value),
        longitudeDepart: parseFloat(document.getElementById('edit-lng-start').value),
        adressDestination: document.getElementById('edit_adresse_destination').value,
        latitudeDestination: parseFloat(document.getElementById('edit-lat-end').value),
        longitudeDestination: parseFloat(document.getElementById('edit-lng-end').value),
        dateDepart: document.getElementById('edit_date_depart').value,
        dateArrivee: document.getElementById('edit_date_fin_estimee').value,
        description: document.getElementById('edit_colis_description').value,
        poids: parseFloat(document.getElementById('edit_colis_poids').value),
        Volume: parseFloat(document.getElementById('edit_colis_volume').value),
        typeColis: document.getElementById('edit_colis_type').value,
        InstructionSpeciales: document.getElementById('edit_instructions').value,
        isGpsEnabled: document.getElementById('edit_is_gps_enabled').checked,
        trackerId: document.getElementById('edit_tracker_id').value,
        trackerImei: document.getElementById('edit_tracker_imei').value,
        trackerSimNumber: document.getElementById('edit_tracker_sim').value
    };

    try {
        const updateRes = await fetch(`/api/missions/${currentEditingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(missionData)
        });

        if (!updateRes.ok) throw new Error('Failed to update mission details');

        const newStatus = document.getElementById('editStatutSelect').value;
        const currentMission = allMissions.find(m => m.id === currentEditingId);

        if (newStatus !== currentMission.statut) {
            await fetch(`/api/missions/${currentEditingId}/status?status=${newStatus}`, { method: 'PATCH' });
        }

        const modalEl = document.getElementById('editMissionModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        fetchMissions();
        if (window.loadSidebarStats) window.loadSidebarStats();
        showSuccess('Mission mise à jour', 'La mission a été mise à jour avec succès !');

    } catch (error) {
        console.error('Error:', error);
        showNotification('Erreur', 'Une erreur est survenue lors de la modification.', 'error');
    }
}
