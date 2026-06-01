/* ═══════════════════════════════════════════════════════════════
   ParcVision — Premium Dashboard Engine v5
   Pro animations, hover glow, shimmer effects, dynamic Chart.js
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    let charts = {};
    let DATA = null;

    /* ── Chart.js Global Plugin: Hover Glow ─────────────────── */
    const hoverGlowPlugin = {
        id: 'hoverGlow',
        beforeDraw(chart) {
            const active = chart.getActiveElements();
            if (active.length > 0) {
                const ctx = chart.ctx;
                const el = active[0].element;
                ctx.save();
                ctx.shadowColor = 'rgba(66, 133, 244, 0.45)';
                ctx.shadowBlur = 18;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.restore();
            }
        }
    };

    /* ── Chart.js Global Plugin: Canvas Shimmer on Load ──────── */
    const shimmerPlugin = {
        id: 'shimmer',
        afterDraw(chart) {
            if (chart._shimmerDone) return;
            const progress = chart.getDatasetMeta(0)?.controller?._cachedMeta?._parsed?.length > 0 ? 1 : 0;
            if (progress >= 1) chart._shimmerDone = true;
        }
    };

    // Register plugins globally
    Chart.register(hoverGlowPlugin, shimmerPlugin);

    /* ── Demo Data Fallback ──────────────────────────────────── */
    const DEMO = {
        totalVehicules: 24, totalConducteurs: 18, totalMissions: 47, totalCost: 38450, totalInterventions: 31,
        fleetHealthScore: 83, entreprise: { nom: 'Parc Auto', secteur: 'Transport' },
        avgCostPerVehicule: 1602, utilizationRate: 75, maintenanceAlertsCount: 4,
        vehiculeStatuts: { DISPONIBLE: 14, EN_MISSION: 6, EN_MAINTENANCE: 3, HORS_SERVICE: 1 },
        missionStatuts: { PLANIFIEE: 8, EN_COURS: 12, TERMINEE: 24, ANNULEE: 3 },
        conducteurStatuts: { DISPONIBLE: 8, EN_MISSION: 6, EN_CONGE: 2, SUSPENDU: 1, MALADE: 1 },
        interventionTypes: { Vidange: 14, Réparation: 11, Dépannage: 6 },
        vehiculeTypes: { CAMION: 8, FOURGON: 10, VOITURE: 6 },
        monthlyData: [
            { month: 'Jan', interventions: 4, missions: 6, cost: 5200 },
            { month: 'Fév', interventions: 6, missions: 8, cost: 7100 },
            { month: 'Mar', interventions: 3, missions: 5, cost: 4300 },
            { month: 'Avr', interventions: 7, missions: 10, cost: 8900 },
            { month: 'Mai', interventions: 5, missions: 9, cost: 6400 },
            { month: 'Juin', interventions: 6, missions: 9, cost: 6550 }
        ],
        recentInterventions: [
            { type: 'Vidange', vehicule: 'Renault Kangoo (A-12-345)', date: '2026-05-15', cost: 850, description: 'Vidange complète huile moteur 5W40' },
            { type: 'Réparation', vehicule: 'Peugeot Partner (B-67-890)', date: '2026-05-13', cost: 2300, description: 'Remplacement embrayage et volant moteur' },
            { type: 'Dépannage', vehicule: 'Citroën Jumpy (C-11-222)', date: '2026-05-12', cost: 450, description: 'Remorquage suite panne batterie' },
            { type: 'Vidange', vehicule: 'Ford Transit (D-33-444)', date: '2026-05-10', cost: 920, description: 'Vidange + filtres air et huile' },
            { type: 'Réparation', vehicule: 'Mercedes Sprinter (E-55-666)', date: '2026-05-08', cost: 3100, description: 'Révision freins avant et arrière' }
        ]
    };

    function isEmpty(d) { return (!d.totalVehicules && !d.totalConducteurs && !d.totalMissions && !d.totalInterventions); }
    const isDark = () => document.body.classList.contains('dark');

    // Core color palette matching our CSS theme
    const pal = () => ({
        grid: isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
        txt: isDark() ? '#9ca3af' : '#6b7280',
        tBg: isDark() ? '#1f2937' : '#ffffff',
        tTitle: isDark() ? '#f3f4f6' : '#111827',
        tBody: isDark() ? '#d1d5db' : '#4b5563',
        tBord: isDark() ? '#374151' : '#e5e7eb'
    });

    // Elegant number counter animation
    function animateNum(el, target, dur = 1500, suffix = '') {
        if (!el) return;
        const t0 = performance.now();
        (function step(now) {
            const p = Math.min((now - t0) / dur, 1);
            // easeOutExpo
            const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
            const v = target * e;
            el.textContent = Math.round(v).toLocaleString('fr-FR') + suffix;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = Math.round(target).toLocaleString('fr-FR') + suffix;
        })(t0);
    }

    // Universal Tooltip Configuration — Premium glassmorphism style
    function ttCfg() {
        const p = pal();
        return {
            backgroundColor: isDark() ? 'rgba(31,41,55,0.95)' : 'rgba(255,255,255,0.96)',
            titleColor: p.tTitle,
            bodyColor: p.tBody,
            borderColor: isDark() ? 'rgba(99,102,241,0.3)' : 'rgba(66,133,244,0.25)',
            borderWidth: 1,
            cornerRadius: 14,
            padding: 16,
            boxPadding: 8,
            usePointStyle: true,
            displayColors: true,
            titleFont: { family: 'Outfit', size: 14, weight: '700' },
            bodyFont: { family: 'Inter', size: 13, weight: '500' },
            animation: { duration: 200, easing: 'easeOutQuart' },
            callbacks: {
                label: ctx => ` ${ctx.dataset.label || ''}: ${ctx.parsed.y ?? ctx.parsed ?? 0}`
            }
        };
    }

    // Pro animation presets
    const proAnim = {
        breathe: {
            duration: 1800,
            easing: 'easeOutElastic',
            delay: (ctx) => (ctx.dataIndex !== undefined ? ctx.dataIndex * 120 : 0),
        },
        cascade: {
            duration: 1400,
            easing: 'easeOutQuart',
            delay: (ctx) => (ctx.dataIndex !== undefined ? ctx.dataIndex * 80 + (ctx.datasetIndex || 0) * 200 : 0),
        },
        elastic: {
            duration: 2000,
            easing: 'easeOutElastic',
        },
        smooth: {
            duration: 1600,
            easing: 'easeOutQuart',
        }
    };

    /* ── Data Fetching ────────────────────────────────────────── */
    async function load() {
        try {
            const r = await fetch('/api/dashboard/stats');
            if (!r.ok) throw new Error(r.status);
            let data = await r.json();
            if (isEmpty(data)) { data = DEMO; showBanner(); }
            DATA = data;
            render(DATA);
        } catch (e) {
            console.warn('Backend unavailable, using Demo Data:', e.message);
            DATA = DEMO;
            showBanner();
            render(DATA);
        }
    }

    function showBanner() {
        const b = document.getElementById('demoBanner');
        if (b) { b.style.display = 'flex'; b.classList.add('fade-up'); }
    }

    /* ── Core Render Engine ─────────────────────────────────── */
    function render(d) {
        // 1. Render KPIs with smooth animations
        animateNum(document.getElementById('kpiVehicules'), d.totalVehicules || 0);
        document.getElementById('kpiUtilization').textContent = d.utilizationRate || 0;

        // Dual KPIs Logic
        // Card 1: Utilization & Availability
        const avail = d.vehiculeStatuts && d.totalVehicules ? Math.round((d.vehiculeStatuts.DISPONIBLE || 0) / d.totalVehicules * 100) : 0;
        const elAvail = document.getElementById('kpiAvailability');
        if (elAvail) animateNum(elAvail, avail, 1000);

        // Card 2: Missions
        const activeMis = d.missionStatuts ? (d.missionStatuts.EN_COURS || 0) : 0;
        const elActiveMis = document.getElementById('kpiActiveMissions');
        if (elActiveMis) animateNum(elActiveMis, activeMis, 1000);

        const totalMis = document.getElementById('kpiTotalMissions');
        if (totalMis) animateNum(totalMis, d.totalMissions || 0, 1000);

        // Card 3: Costs
        const monthCost = d.monthlyData && d.monthlyData.length > 0 ? d.monthlyData[d.monthlyData.length - 1].cost : 0;
        const elMonthCost = document.getElementById('kpiMonthCost');
        if (elMonthCost) animateNum(elMonthCost, monthCost, 1200);

        // Card 4: Simulated Distance & Fuel
        const activeVehicles = (d.vehiculeStatuts?.EN_MISSION || 0) + (d.vehiculeStatuts?.DISPONIBLE || 0);
        // Simulate 1200km per active vehicle this month, and 12L/100km avg fuel
        const simulatedDistance = activeVehicles * 1200;
        const simulatedFuel = Math.round(simulatedDistance * 0.12);

        const elDist = document.getElementById('kpiDistance');
        if (elDist) animateNum(elDist, simulatedDistance, 1500);

        const elFuel = document.getElementById('kpiFuel');
        if (elFuel) animateNum(elFuel, simulatedFuel, 1500);

        // Update Trend styling dynamically
        const setTrend = (id, val, goodIfLow = false) => {
            const el = document.getElementById(id); if (!el) return;
            if (val !== undefined && val !== null && val > 0) {
                if (goodIfLow) {
                    el.innerHTML = `<i class="bi bi-exclamation-triangle"></i>Action requise`;
                    el.className = 'kpi-trend down';
                } else {
                    el.innerHTML = `<i class="bi bi-graph-up"></i>Actif`;
                    el.className = 'kpi-trend up';
                }
            } else {
                el.innerHTML = `<i class="bi bi-check-circle"></i>Optimal`;
                el.className = 'kpi-trend neutral';
            }
        };
        setTrend('trendV', d.totalVehicules);
        setTrend('trendU', d.utilizationRate);
        setTrend('trendA', d.maintenanceAlertsCount, true); // Alerts are bad if high
        setTrend('trendAvg', d.avgCostPerVehicule);

        const n = document.getElementById('entName');
        if (n) n.textContent = d.entreprise?.nom ? `${d.entreprise.nom} - Dashboard` : 'Dashboard';

        // 2. Render Charts
        buildMixedChart(d.monthlyData || DEMO.monthlyData);
        buildArea(d.monthlyData || DEMO.monthlyData);

        // Google Style colors: Blue, Green, Yellow, Red
        const c_blue = '#4285F4', c_green = '#34A853', c_yellow = '#FBBC05', c_red = '#EA4335';

        buildDonut('vehDonut', d.vehiculeStatuts || DEMO.vehiculeStatuts, ['Disponible', 'En mission', 'Maintenance', 'Hors service'], [c_green, c_blue, c_yellow, c_red]);
        buildDonut('misDonut', d.missionStatuts || DEMO.missionStatuts, ['Planifiée', 'En cours', 'Terminée', 'Annulée'], [c_blue, c_yellow, c_green, c_red]);

        buildPolarChart(d.vehiculeTypes || DEMO.vehiculeTypes);

        buildStackedBar(d.monthlyData || DEMO.monthlyData);
        buildFleetHealth(d);
        buildCondBarChart(d.conducteurStatuts || DEMO.conducteurStatuts);

        // 3. Render Table
        buildTable(d.recentInterventions || DEMO.recentInterventions);
    }

    /* ── Chart Initializers ─────────────────────────────────── */

    // 1. Mixed Chart (Bar + Line) — with cascade animation
    function buildMixedChart(data) {
        const ctx = document.getElementById('mixedChart'); if (!ctx) return;
        if (charts.mixed) charts.mixed.destroy();
        const p = pal();

        charts.mixed = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.month),
                datasets: [
                    {
                        type: 'line',
                        label: 'Interventions',
                        data: data.map(d => d.interventions),
                        borderColor: '#f59e0b',
                        backgroundColor: '#f59e0b',
                        borderWidth: 3,
                        pointRadius: 6,
                        pointHoverRadius: 10,
                        pointBackgroundColor: isDark() ? '#1f2937' : '#ffffff',
                        pointBorderColor: '#f59e0b',
                        pointBorderWidth: 2,
                        pointHoverBorderWidth: 3,
                        pointHoverBackgroundColor: '#f59e0b',
                        tension: 0.4
                    },
                    {
                        type: 'bar',
                        label: 'Missions',
                        data: data.map(d => d.missions),
                        backgroundColor: isDark() ? 'rgba(99,102,241,0.7)' : 'rgba(99,102,241,0.9)',
                        hoverBackgroundColor: isDark() ? 'rgba(99,102,241,1)' : 'rgba(79,70,229,1)',
                        borderRadius: 10,
                        barPercentage: 0.5
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10, font: { family: 'Inter', size: 12 }, color: p.txt, padding: 20 } },
                    tooltip: ttCfg()
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: p.txt }, border: { display: false } },
                    y: { beginAtZero: true, grid: { color: p.grid, drawBorder: false }, ticks: { font: { family: 'Inter', size: 12 }, color: p.txt }, border: { display: false } }
                },
                animation: proAnim.cascade,
                hover: { animationDuration: 300 }
            }
        });
    }

    // 2. Polar Area Chart — with breathe animation & glow hover
    function buildPolarChart(dataObj) {
        const ctx = document.getElementById('polarChart'); if (!ctx) return;
        if (charts.polar) charts.polar.destroy();

        const labels = Object.keys(dataObj);
        const vals = Object.values(dataObj);
        const colors = [
            'rgba(66, 133, 244, 0.85)',   // Blue  — CAMION
            'rgba(234, 67, 53, 0.85)',    // Red   — FOURGON
            'rgba(251, 188, 5, 0.85)'     // Yellow — VOITURE
        ];
        const hoverColors = [
            'rgba(66, 133, 244, 1)',
            'rgba(234, 67, 53, 1)',
            'rgba(251, 188, 5, 1)'
        ];

        charts.polar = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: labels,
                datasets: [{
                    data: vals,
                    backgroundColor: colors,
                    hoverBackgroundColor: hoverColors,
                    borderColor: isDark() ? '#1f2937' : '#ffffff',
                    borderWidth: 2,
                    hoverBorderWidth: 3,
                    hoverBorderColor: isDark() ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
                    hoverOffset: 12
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true, boxWidth: 10,
                            font: { family: 'Inter', size: 12, weight: '500' },
                            color: pal().txt,
                            padding: 16,
                            generateLabels: (chart) => {
                                const data = chart.data;
                                return data.labels.map((label, i) => ({
                                    text: `${label} (${data.datasets[0].data[i]})`,
                                    fillStyle: colors[i],
                                    strokeStyle: colors[i],
                                    lineWidth: 0,
                                    pointStyle: 'rectRounded',
                                    index: i
                                }));
                            }
                        }
                    },
                    tooltip: {
                        ...ttCfg(),
                        callbacks: {
                            label: ctx => ` ${ctx.label}: ${ctx.parsed.r} véhicules`
                        }
                    }
                },
                scales: {
                    r: {
                        ticks: { display: false },
                        grid: { color: pal().grid, circular: true, lineWidth: 1 },
                        pointLabels: { display: false }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    ...proAnim.breathe
                },
                hover: { animationDuration: 350 }
            }
        });
    }

    // 3. Doughnut Charts — with elastic spin & hover offset
    function buildDonut(id, dataObj, labels, colors) {
        const ctx = document.getElementById(id); if (!ctx) return;
        if (charts[id]) charts[id].destroy();
        const vals = Object.values(dataObj);
        const tot = vals.reduce((a, b) => a + b, 0);

        const hoverColors = colors.map(c => c.replace(/[\d.]+\)$/, '1)'));

        charts[id] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: vals,
                    backgroundColor: colors,
                    hoverBackgroundColor: hoverColors,
                    borderColor: isDark() ? '#1f2937' : '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 12,
                    hoverBorderWidth: 4,
                    hoverBorderColor: isDark() ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '78%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        ...ttCfg(),
                        callbacks: {
                            label: ctx => ` ${ctx.label}: ${ctx.parsed} (${tot ? Math.round(ctx.parsed / tot * 100) : 0}%)`
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1600,
                    easing: 'easeOutElastic'
                },
                hover: { animationDuration: 350 }
            }
        });

        const ctr = document.getElementById(id + 'Tot'); if (ctr) animateNum(ctr, tot, 1000);
        const leg = document.getElementById(id + 'Leg');
        if (leg) leg.innerHTML = labels.map((l, i) => `
            <div class="d-leg">
                <span class="d-dot" style="background:${colors[i]}"></span>
                <span class="d-leg-label">${l}</span>
                <span class="d-val">${vals[i]}<span class="d-pct">${tot ? Math.round(vals[i] / tot * 100) : 0}%</span></span>
            </div>
        `).join('');
    }

    // 4. Stacked Bar — cascade animation & hover brightness
    function buildStackedBar(data) {
        const ctx = document.getElementById('stackedBar'); if (!ctx) return;
        if (charts.stacked) charts.stacked.destroy();
        const p = pal();
        charts.stacked = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.month),
                datasets: [
                    {
                        label: 'Vidange',
                        data: data.map(d => Math.round(d.cost * 0.35)),
                        backgroundColor: 'rgba(66, 133, 244, 0.85)',
                        hoverBackgroundColor: '#4285F4',
                        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 6, bottomRight: 6 },
                        stack: 'cost'
                    },
                    {
                        label: 'Réparation',
                        data: data.map(d => Math.round(d.cost * 0.45)),
                        backgroundColor: 'rgba(251, 188, 5, 0.85)',
                        hoverBackgroundColor: '#FBBC05',
                        stack: 'cost'
                    },
                    {
                        label: 'Dépannage',
                        data: data.map(d => Math.round(d.cost * 0.20)),
                        backgroundColor: 'rgba(234, 67, 53, 0.85)',
                        hoverBackgroundColor: '#EA4335',
                        borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
                        stack: 'cost'
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10, font: { family: 'Inter', size: 11, weight: '500' }, color: p.txt, padding: 18 } },
                    tooltip: {
                        ...ttCfg(),
                        callbacks: {
                            label: ctx => ` ${ctx.dataset.label}: ${Number(ctx.parsed.y).toLocaleString('fr-FR')} MAD`
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: p.txt }, border: { display: false }, stacked: true },
                    y: { beginAtZero: true, stacked: true, grid: { color: p.grid, drawBorder: false }, ticks: { font: { family: 'Inter', size: 11 }, color: p.txt, callback: v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v }, border: { display: false } }
                },
                animation: proAnim.cascade,
                hover: { animationDuration: 300 }
            }
        });
    }

    // 5. Fleet Health — Smooth gauge with glow + animated metrics
    function buildFleetHealth(d) {
        const ctx = document.getElementById('gaugeChart'); if (!ctx) return;
        if (charts.gauge) charts.gauge.destroy();

        const score = d.fleetHealthScore || 83;
        animateNum(document.getElementById('fleetScoreVal'), score, 1800);

        // Gauge color based on score — with gradient
        const scoreColor = score >= 80 ? '#34A853' : score >= 60 ? '#FBBC05' : '#EA4335';
        const scoreColorFaded = score >= 80 ? 'rgba(52,168,83,0.15)' : score >= 60 ? 'rgba(251,188,5,0.15)' : 'rgba(234,67,53,0.15)';

        charts.gauge = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [score, 100 - score],
                    backgroundColor: [scoreColor, isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'],
                    hoverBackgroundColor: [scoreColor, 'transparent'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: -90
                }]
            },
            options: {
                responsive: false, cutout: '76%',
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                animation: { animateRotate: true, duration: 2200, easing: 'easeOutElastic' }
            }
        });

        // Build the metrics list with staggered animations
        const veh = d.vehiculeStatuts || DEMO.vehiculeStatuts;
        const mis = d.missionStatuts || DEMO.missionStatuts;
        const totalV = Object.values(veh).reduce((a, b) => a + b, 0);
        const totalM = Object.values(mis).reduce((a, b) => a + b, 0);
        const disponiblePct = totalV ? Math.round((veh.DISPONIBLE || 0) / totalV * 100) : 0;
        const termineePct = totalM ? Math.round((mis.TERMINEE || 0) / totalM * 100) : 0;

        const metrics = [
            { icon: 'bi-truck-front', color: '#4285F4', bg: 'rgba(66,133,244,0.1)', label: 'Véhicules disponibles', val: `${disponiblePct}%` },
            { icon: 'bi-check2-circle', color: '#34A853', bg: 'rgba(52,168,83,0.1)', label: 'Missions terminées', val: `${termineePct}%` },
            { icon: 'bi-exclamation-triangle', color: '#FBBC05', bg: 'rgba(251,188,5,0.1)', label: 'Alertes actives', val: d.maintenanceAlertsCount || 0 },
            { icon: 'bi-currency-exchange', color: '#EA4335', bg: 'rgba(234,67,53,0.1)', label: 'Coût total maint.', val: `${Number(d.totalCost || 0).toLocaleString('fr-FR')} MAD` }
        ];

        const el = document.getElementById('fleetMetrics');
        if (el) el.innerHTML = metrics.map((m, i) => `
            <div class="fh-metric-row fade-up" style="animation-delay:${0.15 + i * 0.1}s">
                <div class="fh-metric-icon" style="background:${m.bg};color:${m.color}">
                    <i class="bi ${m.icon}"></i>
                </div>
                <span class="fh-metric-name">${m.label}</span>
                <span class="fh-metric-val" style="color:${m.color}">${m.val}</span>
            </div>
        `).join('');
    }

    // (buildCriticalAlerts removed — replaced by Fleet Composition polar chart)

    // 6. Area Chart (Financials) — smooth gradient with crosshair hover
    function buildArea(data) {
        const ctx = document.getElementById('areaChart'); if (!ctx) return;
        if (charts.area) charts.area.destroy();
        const p = pal();

        // Rich gradient fill
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, isDark() ? 'rgba(16, 185, 129, 0.45)' : 'rgba(16, 185, 129, 0.25)');
        gradient.addColorStop(0.6, isDark() ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        charts.area = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: 'Coût',
                    data: data.map(d => d.cost),
                    borderColor: '#10b981',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 10,
                    pointBackgroundColor: isDark() ? '#1f2937' : '#ffffff',
                    pointBorderColor: '#10b981',
                    pointBorderWidth: 2,
                    pointHoverBorderWidth: 3,
                    pointHoverBackgroundColor: '#10b981',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        ...ttCfg(),
                        callbacks: { label: c => ` Dépense: ${Number(c.parsed.y).toLocaleString('fr-FR')} MAD` }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: p.txt }, border: { display: false } },
                    y: { beginAtZero: true, grid: { color: p.grid, drawBorder: false }, ticks: { font: { family: 'Inter', size: 12 }, color: p.txt, callback: v => v >= 1000 ? (v / 1000) + 'k' : v }, border: { display: false } }
                },
                interaction: { intersect: false, mode: 'index' },
                animation: proAnim.smooth,
                hover: { animationDuration: 300 }
            }
        });
    }

    // 7. Conducteur Status (Horizontal Bar)
    function buildCondBarChart(dataObj) {
        const ctx = document.getElementById('condBarChart'); if (!ctx) return;
        if (charts.condBar) charts.condBar.destroy();

        const labels = Object.keys(dataObj);
        const vals = Object.values(dataObj);
        const p = pal();

        const colors = labels.map(l => {
            if (l === 'DISPONIBLE') return 'rgba(52, 168, 83, 0.8)';
            if (l === 'EN_MISSION') return 'rgba(66, 133, 244, 0.8)';
            if (l === 'EN_CONGE') return 'rgba(251, 188, 5, 0.8)';
            return 'rgba(234, 67, 53, 0.8)';
        });

        charts.condBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Conducteurs',
                    data: vals,
                    backgroundColor: colors,
                    borderRadius: 6,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: ttCfg()
                },
                scales: {
                    x: { beginAtZero: true, grid: { color: p.grid, drawBorder: false }, ticks: { font: { family: 'Inter', size: 11 }, color: p.txt }, border: { display: false } },
                    y: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 10, weight: '600' }, color: p.txt }, border: { display: false } }
                },
                animation: proAnim.cascade,
                hover: { animationDuration: 300 }
            }
        });
    }

    // 8. Data Table
    function buildTable(items) {
        const tb = document.getElementById('recentTbody'); if (!tb) return;
        if (!items || !items.length) {
            tb.innerHTML = `<tr><td colspan="5"><div class="empty-r"><i class="bi bi-inbox"></i><span>Aucune intervention récente</span></div></td></tr>`;
            return;
        }
        tb.innerHTML = items.map((it, i) => {
            // Mapping CSS classes based on intervention type
            let cls = 'vidange';
            if (it.type === 'Réparation') cls = 'reparation';
            if (it.type === 'Dépannage') cls = 'depannage';

            return `<tr class="scale-in" style="animation-delay:${i * 0.08}s">
                <td><span class="tp ${cls}">${it.type}</span></td>
                <td><strong>${it.vehicule}</strong></td>
                <td>${it.date}</td>
                <td class="cost-c">${Number(it.cost).toLocaleString('fr-FR')} MAD</td>
                <td title="${it.description || ''}">${(it.description || '—').substring(0, 40)}${(it.description || '').length > 40 ? '…' : ''}</td>
            </tr>`;
        }).join('');
    }

    // Listen for dark mode toggles to re-render charts for correct colors
    new MutationObserver(() => {
        if (DATA) render(DATA);
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Init on load
    document.addEventListener('DOMContentLoaded', () => {
        const el = document.getElementById('dashDate');
        if (el) el.textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        load();
    });
})();
