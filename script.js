document.addEventListener('DOMContentLoaded', () => {
    // 1. Selector Constants
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const messageDiv = document.getElementById('message');
    const homeScreen = document.getElementById('home-screen');
    const authBox = document.querySelector('.auth-box');
    const userDisplayName = document.getElementById('user-display-name');
    const matchesContainer = document.getElementById('matches-container');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const matchDetailsScreen = document.getElementById('match-details-screen');
    const backToHome = document.getElementById('back-to-home');
    const matchNumberDisplay = document.getElementById('match-number-display');
    const matchTeamsDisplay = document.getElementById('match-teams-display');
    const createTeamBtn = document.getElementById('create-team-btn');
    const viewTeamBtn = document.getElementById('view-team-btn');
    const playerSelectionScreen = document.getElementById('player-selection-screen');
    const teamANameDisp = document.getElementById('team-a-name');
    const teamBNameDisp = document.getElementById('team-b-name');
    const teamACountDisp = document.getElementById('team-a-count');
    const teamBCountDisp = document.getElementById('team-b-count');
    const totalSelectedDisp = document.getElementById('total-selected');
    const playersContainer = document.getElementById('players-container');
    const proceedToCaptainBtn = document.getElementById('proceed-to-captain-btn');
    const captainSelectionScreen = document.getElementById('captain-selection-screen');
    const selectedPlayersList = document.getElementById('selected-players-list');
    const saveTeamBtn = document.getElementById('save-team-btn');
    const liveMatchScreen = document.getElementById('live-match-screen');
    const liveMatchTeams = document.getElementById('live-match-teams');
    const leaderboardList = document.getElementById('leaderboard-list');
    const backFromLive = document.getElementById('back-from-live');
    const liveMatchScorecard = document.getElementById('live-match-scorecard');
    const liveTeamViewScreen = document.getElementById('live-team-view-screen');
    const liveTeamScorecard = document.getElementById('live-team-scorecard');
    const previewUserNameTitle = document.getElementById('preview-user-name-title');
    const previewPlayersListContainer = document.getElementById('preview-players-list-container');
    const backFromLiveTeam = document.getElementById('back-from-live-team');
    const teamViewScreen = document.getElementById('team-view-screen');
    const backFromView = document.getElementById('back-from-view');
    const viewMatchTeams = document.getElementById('view-match-teams');
    const viewPlayersList = document.getElementById('view-players-list');
    const editTeamBtn = document.getElementById('edit-team-btn');
    const globalLeaderboardScreen = document.getElementById('global-leaderboard-screen');
    const globalLeaderboardList = document.getElementById('global-leaderboard-list');
    const backFromGlobalLeaderboard = document.getElementById('back-from-global-leaderboard');
    const userPointsBreakdownScreen = document.getElementById('user-points-breakdown-screen');
    const breakdownUserName = document.getElementById('breakdown-user-name');
    const breakdownList = document.getElementById('breakdown-list');
    const backFromPointsBreakdown = document.getElementById('back-from-points-breakdown');
    const backToMatchDetails = document.getElementById('back-to-match-details');
    const backToPlayerSelection = document.getElementById('back-to-player-selection');
    const playerPointsBreakdownScreen = document.getElementById('player-points-breakdown-screen');
    const playerBreakdownList = document.getElementById('player-breakdown-list');
    const playerBreakdownTotal = document.getElementById('player-breakdown-total');
    const backFromPlayerBreakdown = document.getElementById('back-from-player-breakdown');
    const breakdownPlayerName = document.getElementById('breakdown-player-name');
    
    // New Selectors
    const teamPreviewScreen = document.getElementById('team-preview-screen');
    const previewField = document.getElementById('preview-field');
    const backFromPreview = document.getElementById('back-from-preview');
    const previewTeamBtnCaptain = document.getElementById('preview-team-btn-captain');
    const previewTeamBtnView = document.getElementById('preview-team-btn-view');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const logoutYes = document.getElementById('logout-yes');
    const logoutNo = document.getElementById('logout-no');

    // 2. State Variables
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwCq6U4VfGBWqTv8NmoDACPvrd7nHSzfZWbPg0enQ3TMjbZ6BEnCD6a71idMqBbU1ja/exec'; 
    let currentMatchId = null;
    let selectedPlayers = []; 
    let captainId = null;
    let viceCaptainId = null;

    const SERIES_NAME = "PSL 2026";
    const checkSeriesReset = () => {
        const lastSeries = localStorage.getItem('lastSeries');
        if (lastSeries !== SERIES_NAME) {
            localStorage.removeItem('teams');
            localStorage.setItem('lastSeries', SERIES_NAME);
        }
    };
    checkSeriesReset();

    // 3. Match & Mock Data (Now dynamic)
    let matches = [];
    let playerPoints = {}; // { playerID: points }
    let squads = [];
    let userTeams = [];
    
    // Static roles mapping (if needed for fallback)
    const ROLE_LIMITS = { WK: 1, BAT: 1, AR: 1, BOWL: 1 };

    // 4. Utility Functions
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    const POINTS_SYSTEM = {
        BATTING: { RUN: 1, BOUNDARY_BONUS: 1, SIX_BONUS: 2, THIRTY_RUN_BONUS: 4, HALF_CENTURY_BONUS: 8, CENTURY_BONUS: 16, DUCK: -2 },
        BOWLING: { WICKET: 25, LBW_BOWLED_BONUS: 8, THREE_WICKET_BONUS: 4, FOUR_WICKET_BONUS: 8, FIVE_WICKET_BONUS: 16, MAIDEN_OVER: 12 },
        FIELDING: { CATCH: 8, THREE_CATCH_BONUS: 4, STUMPING: 12, RUN_OUT_DIRECT: 12, RUN_OUT_INDIRECT: 6 },
        OTHERS: { CAPTAIN: 2, VICE_CAPTAIN: 1.5, PLAYING_11: 4 },
        STRIKE_RATE: { ABOVE_170: 6, BETWEEN_150_01_170: 4, BETWEEN_130_150: 2, BETWEEN_60_70: -2, BETWEEN_50_59_99: -4, BELOW_50: -6 },
        ECONOMY_RATE: { BELOW_5: 6, BETWEEN_5_5_99: 4, BETWEEN_6_7: 2, BETWEEN_10_11: -2, BETWEEN_11_01_12: -4, ABOVE_12: -6 }
    };

    const getMatchPoints = (playerId, role = 'BAT', isC = false, isVC = false) => {
        const hash = playerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        let pts = 4; stats = { runs: (hash % 60), wickets: role === 'BOWL' ? (hash % 4) : 0, catches: (hash % 2) };
        pts += stats.runs + (stats.wickets * 25) + (stats.catches * 8);
        if (isC) pts *= 2; else if (isVC) pts *= 1.5;
        return Math.floor(pts);
    };

    const showMsg = (txt, type) => {
        messageDiv.textContent = txt; messageDiv.className = `message ${type}`;
        setTimeout(() => messageDiv.className = 'message d-none', 3000);
    };

    const checkSession = async () => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            authBox.classList.add('d-none'); homeScreen.classList.remove('d-none');
            await loadData(); // Load dynamic matches and points
            renderUpcomingMatches();

            // Periodic updates
            setInterval(() => renderUpcomingMatches(), 1000); // Update timers every second
            setInterval(async () => {
                await loadData();
                renderUpcomingMatches();
            }, 30000); // Fetch sheet data every 30 seconds
        }
    };

    const loadData = async () => {
        try {
            const response = await fetch(SCRIPT_URL);
            const data = await response.json();
            
            if (data.result === 'error') {
                console.error('Server error loading data:', data.message);
                showMsg(`Data Error: ${data.message}`, 'error');
                return;
            }

            let rawMatches = [];
            // Handle both new Object format and old Array format
            if (data.matches && Array.isArray(data.matches)) {
                matches = data.matches;
                playerPoints = data.points || {};
                squads = data.squads || [];
                userTeams = data.userTeams || [];
            }

            // Matches already mapped in Apps Script response
        } catch (err) {
            console.error('Failed to load data:', err);
            showMsg('Updating data...', 'success');
        }
    };



    loginForm.addEventListener('submit', async (e) => { 
        e.preventDefault(); 
        const username = loginForm.username.value;
        const password = loginForm.password.value;

        const btn = loginForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Logging in...';
        btn.disabled = true;

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
                body: JSON.stringify({ action: 'login', username, password })
            });

            const result = await response.json();

            if (result.result === 'success') {
                showMsg('Login successful!', 'success');
                localStorage.setItem('currentUser', JSON.stringify({ username }));
                setTimeout(() => checkSession(), 1000);
            } else {
                showMsg(result.message || 'Invalid username or password', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMsg('Error connecting to server. Please try again.', 'error');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });

    signupForm.addEventListener('submit', async (e) => { 
        e.preventDefault(); 
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm  = document.getElementById('signup-confirm').value;

        if (!username) return showMsg('Username is required.', 'error');
        if (password !== confirm) return showMsg('Passwords do not match!', 'error');
        if (password.length < 4) return showMsg('Password must be at least 4 characters.', 'error');

        const btn = signupForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Creating Account...';
        btn.disabled = true;

        if (SCRIPT_URL === 'PASTE_YOUR_GOOGLE_APP_SCRIPT_URL_HERE') {
            showMsg('Please provide the Google Apps Script URL in script.js', 'error');
            btn.textContent = originalText;
            btn.disabled = false;
            return;
        }

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
                body: JSON.stringify({ action: 'signup', username, password }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            const result = await response.json();

            if (result.result === 'error') {
                showMsg(result.message || 'Signup failed on server.', 'error');
                return;
            }

            showMsg('Account created! You can now login.', 'success');
            signupForm.reset();
            setTimeout(() => {
                signupForm.classList.add('d-none');
                loginForm.classList.remove('d-none');
            }, 1500);

        } catch (error) {
            if (error.name === 'AbortError') {
                showMsg('Request timed out. Check your internet connection or try again.', 'error');
            } else {
                showMsg('Error: ' + error.message, 'error');
            }
            console.error('Signup error:', error);
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });

    showSignup.addEventListener('click', () => { loginForm.classList.add('d-none'); signupForm.classList.remove('d-none'); });
    showLogin.addEventListener('click', () => { signupForm.classList.add('d-none'); loginForm.classList.remove('d-none'); });

    let currentMatchTab = 'upcoming';

    // Add Tab Listeners
    document.querySelectorAll('.match-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.match-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentMatchTab = tab.dataset.status;
            renderUpcomingMatches();
        });
    });

    const renderUpcomingMatches = () => {
        matchesContainer.innerHTML = '';
        
        const filteredMatches = matches.filter(m => m.status === currentMatchTab);
        
        if (filteredMatches.length === 0) {
            matchesContainer.innerHTML = `
                <div style="text-align:center; padding:40px; opacity:0.6; width:100%;">
                    <p>No ${currentMatchTab} matches at the moment.</p>
                </div>
            `;
            return;
        }

        filteredMatches.forEach(m => {
            const card = document.createElement('div');
            card.className = 'match-card';
            
            const matchTime = new Date(m.time);
            const now = new Date();
            const diffSec = Math.max(0, Math.floor((matchTime - now) / 1000));
            
            const isLive = m.status === 'live';
            const isCompleted = m.status === 'completed';
            
            // Format time display
            let timeDisplay = "";
            let countdownDisplay = "";
            if (isLive) {
                timeDisplay = "LIVE NOW";
            } else if (isCompleted) {
                timeDisplay = "Completed";
            } else {
                // Show local time (PKT times stored with +05:00 will show as 7:30 PM for IST)
                const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
                const dateOptions = { month: 'short', day: 'numeric' };
                timeDisplay = matchTime.toLocaleDateString('en-IN', dateOptions) + ', ' + matchTime.toLocaleTimeString('en-IN', timeOptions);

                // Countdown to deadline
                const diffMs = matchTime - now;
                if (diffMs > 0) {
                    const hrs  = Math.floor(diffMs / 3600000);
                    const mins = Math.floor((diffMs % 3600000) / 60000);
                    countdownDisplay = hrs > 0 ? `${hrs}h ${mins}m to deadline` : `${mins}m to deadline`;
                } else {
                    countdownDisplay = "Deadline passed";
                }
            }

            const getInitials = (name) => name.split(' ').map(w => w[0]).join('').substring(0,3).toUpperCase();
            const teamAInitials = getInitials(m.teamA);
            const teamBInitials = getInitials(m.teamB);

            card.innerHTML = `
                <div class="match-card-header">
                    <span class="series-tag">PSL 2026</span>
                    <span class="match-status-tag">${m.matchNo}</span>
                </div>
                <div class="match-card-body">
                    <div class="teams-row">
                        <div class="team-box">
                            <div class="team-initials">${teamAInitials}</div>
                            <div class="team-name-short">${m.teamA}</div>
                        </div>
                        <div class="vs-badge">VS</div>
                        <div class="team-box">
                            <div class="team-initials">${teamBInitials}</div>
                            <div class="team-name-short">${m.teamB}</div>
                        </div>
                    </div>
                </div>
                <div class="match-card-footer">
                    <div class="timer-pill ${isLive ? 'live' : ''}">
                        ${isLive ? '<span class="live-dot">● </span>' : ''} ${timeDisplay}
                    </div>
                    ${countdownDisplay ? `<div class="deadline-countdown">${countdownDisplay}</div>` : ''}
                </div>
            `;
            card.addEventListener('click', () => openMatchDetails(m));
            matchesContainer.appendChild(card);
        });
    };
;

    const openMatchDetails = (m) => {
        currentMatchId = m.id; 
        homeScreen.classList.add('d-none'); 
        matchDetailsScreen.classList.remove('d-none');
        
        const isLive = m.status === 'live';
        const isCompleted = m.status === 'completed';
        const deadlinePassed = isLive || isCompleted;
        
        const getInitials = (name) => name.split(' ').map(w => w[0]).join('').substring(0,3).toUpperCase();
        
        matchDetailsScreen.innerHTML = `
            <div class="match-details-header">
                <button class="back-btn" id="back-to-home-new" style="position: absolute; left: 15px; top: 15px;">←</button>
                <div class="match-info-pill">PSL 2026 - ${m.matchNo}</div>
                
                ${deadlinePassed ? `
                    <div class="live-scorecard">
                        <div class="score-row">
                            <span class="score-team">${getInitials(m.teamA)}</span>
                            <span class="score-val">${m.score || 'Yet to Bat'}</span>
                            <span class="score-team">${getInitials(m.teamB)}</span>
                        </div>
                        <div class="live-tag">${isLive ? 'LIVE' : 'COMPLETED'}</div>
                    </div>
                ` : `
                    <div class="stadium-vs">
                        <div class="stadium-team">
                            <div class="stadium-initials">${getInitials(m.teamA)}</div>
                            <div class="stadium-team-name">${m.teamA}</div>
                        </div>
                        <div class="stadium-vs-circle">VS</div>
                        <div class="stadium-team">
                            <div class="stadium-initials">${getInitials(m.teamB)}</div>
                            <div class="stadium-team-name">${m.teamB}</div>
                        </div>
                    </div>
                `}
            </div>

            <div class="details-actions">
                ${deadlinePassed ? `
                    <button class="premium-btn primary" id="view-leaderboard-btn">
                        <span>View Leaderboard</span>
                    </button>
                    <button class="premium-btn secondary" id="view-team-btn-new">
                        <span>My Team</span>
                    </button>
                ` : `
                    <button class="premium-btn primary" id="create-team-btn-new">
                        <span>Create Team</span>
                    </button>
                    <button class="premium-btn secondary" id="view-team-btn-new">
                        <span>View/Edit Team</span>
                    </button>
                `}
            </div>
            
            <div id="leaderboard-container" class="d-none">
                <!-- Leaderboard content injected here -->
            </div>
        `;

        document.getElementById('back-to-home-new').addEventListener('click', () => {
            matchDetailsScreen.classList.add('d-none');
            homeScreen.classList.remove('d-none');
        });

        if (deadlinePassed) {
            document.getElementById('view-leaderboard-btn').addEventListener('click', () => renderLiveLeaderboard(m));
        } else {
            document.getElementById('create-team-btn-new').addEventListener('click', () => openPlayerSelection(m));
        }

        const viewBtn = document.getElementById('view-team-btn-new');
        viewBtn.addEventListener('click', () => {
            const team = JSON.parse(localStorage.getItem('teams') || '{}')[currentMatchId];
            if (team) {
                matchDetailsScreen.classList.add('d-none');
                openFieldPreview(team.players, team.captain, team.viceCaptain, !deadlinePassed);
            } else {
                showMsg('No team created for this match!', 'error');
            }
        });

        // Update button states
        const team = JSON.parse(localStorage.getItem('teams') || '{}')[currentMatchId];
        if (team) {
            createBtn.disabled = true;
            viewBtn.disabled = false;
        } else {
            createBtn.disabled = false;
            viewBtn.disabled = true;
        }
    };

    const updateTeamButtons = () => {
        const team = JSON.parse(localStorage.getItem('teams') || '{}')[currentMatchId];
        if (team) {
            createTeamBtn.disabled = true;
            createTeamBtn.style.opacity = '0.5';
            viewTeamBtn.disabled = false;
            viewTeamBtn.style.opacity = '1';
        } else {
            createTeamBtn.disabled = false;
            createTeamBtn.style.opacity = '1';
            viewTeamBtn.disabled = true;
            viewTeamBtn.style.opacity = '0.5';
        }
    };

    const openPlayerSelection = (match, existing = null) => {
        matchDetailsScreen.classList.add('d-none'); teamViewScreen.classList.add('d-none'); playerSelectionScreen.classList.remove('d-none');
        selectedPlayers = existing ? [...existing.players] : []; captainId = existing ? existing.captain : null; viceCaptainId = existing ? existing.viceCaptain : null;
        
        // Reset Tabs
        activeRoleTab = 'WK';
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const wkTab = document.querySelector('[data-role="WK"]');
        if (wkTab) wkTab.classList.add('active');
        
        setupTabListeners(match);
        renderPlayers(match);
    };

    const updateSelectionStats = (match) => {
        const tA = match.teamA; const tB = match.teamB;
        teamANameDisp.textContent = tA; teamBNameDisp.textContent = tB;
        teamACountDisp.textContent = selectedPlayers.filter(p => p.team === tA).length;
        teamBCountDisp.textContent = selectedPlayers.filter(p => p.team === tB).length;
        totalSelectedDisp.textContent = selectedPlayers.length;
        
        if (selectedPlayers.length === 11) proceedToCaptainBtn.classList.remove('d-none');
        else proceedToCaptainBtn.classList.add('d-none');
    };

    let activeRoleTab = 'WK';

    const setupTabListeners = (match) => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeRoleTab = btn.dataset.role;
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderPlayers(match);
            });
        });
    };

    const renderPlayers = (match) => {
        playersContainer.innerHTML = '';
        const all = squads.filter(p => p.team === match.teamA || p.team === match.teamB);
        updateSelectionStats(match);

        const rolePlayers = all.filter(p => p.role === activeRoleTab);
        if (rolePlayers.length === 0) {
            playersContainer.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.5;">No players found for this role.</div>';
            return;
        }

        const list = document.createElement('div');
        list.className = 'players-list';
        rolePlayers.forEach(p => {
            const isS = selectedPlayers.some(sp => sp.id === p.id);
            const item = document.createElement('div');
            item.className = `player-item ${isS ? 'selected' : ''}`;
            item.innerHTML = `
                <div class="player-info">
                    <div>${p.name} (${p.team.substring(0,3).toUpperCase()})</div>
                    <div class="player-role">${p.role}</div>
                </div>
                <div class="player-points">${playerPoints[p.id] || 0} pts</div>
            `;
            item.addEventListener('click', () => {
                const idx = selectedPlayers.findIndex(sp => sp.id === p.id);
                if (idx > -1) { selectedPlayers.splice(idx, 1); }
                else {
                    if (selectedPlayers.length >= 11) return showMsg('Max 11!', 'error');
                    if (selectedPlayers.filter(sp => sp.role === p.role).length >= 8) return showMsg(`Max 8 ${p.role}s!`, 'error');
                    selectedPlayers.push(p);
                }
                renderPlayers(match);
            });
            list.appendChild(item);
        });
        playersContainer.appendChild(list);
    };

    proceedToCaptainBtn.addEventListener('click', () => {
        if (selectedPlayers.length !== 11) return showMsg('Select exactly 11!', 'error');
        const c = { WK: 0, BAT: 0, AR: 0, BOWL: 0 }; selectedPlayers.forEach(p => c[p.role]++);
        if (c.WK < 1 || c.BAT < 1 || c.AR < 1 || c.BOWL < 1) return showMsg('Requirement: At least 1 from each role!', 'error');
        
        // Min 1 player from each team logic
        const match = matches.find(m => m.id === currentMatchId);
        const tACount = selectedPlayers.filter(p => p.team === match.teamA).length;
        const tBCount = selectedPlayers.filter(p => p.team === match.teamB).length;
        if (tACount < 1 || tBCount < 1) return showMsg(`Select at least 1 player from each team!`, 'error');

        playerSelectionScreen.classList.add('d-none'); captainSelectionScreen.classList.remove('d-none'); renderCaptainSelection();
    });

    const renderCategorizedList = (players, container, isCaptainView = false, teamData = null) => {
        container.innerHTML = '';
        const roles = ['WK', 'BAT', 'AR', 'BOWL'];
        
        roles.forEach(roleId => {
            const rolePlayers = players.filter(p => p.role === roleId);
            if (rolePlayers.length > 0) {
                const header = document.createElement('div');
                header.className = 'section-header';
                header.textContent = `--- ${roleId} ---`;
                header.style.textAlign = 'center';
                header.style.padding = '10px';
                header.style.background = 'rgba(255,255,255,0.05)';
                header.style.fontSize = '0.75rem';
                header.style.letterSpacing = '1px';
                header.style.marginTop = '10px';
                container.appendChild(header);

                rolePlayers.forEach(p => {
                    const item = document.createElement('div');
                    item.className = 'player-item';
                    
                    if (isCaptainView) {
                        item.innerHTML = `<div class="player-info"><div>${p.name} (${p.team.substring(0,3).toUpperCase()})</div></div>
                            <div class="captain-controls"><button class="cvc-btn" id="c-${p.id}">C</button><button class="cvc-btn" id="vc-${p.id}">VC</button></div>`;
                        item.querySelector(`#c-${p.id}`).addEventListener('click', () => { if (viceCaptainId === p.id) viceCaptainId = null; captainId = p.id; updateCVCUI(); });
                        item.querySelector(`#vc-${p.id}`).addEventListener('click', () => { if (captainId === p.id) captainId = null; viceCaptainId = p.id; updateCVCUI(); });
                    } else {
                        // View Team mode
                        const isC = p.id === teamData.captain;
                        const isVC = p.id === teamData.viceCaptain;
                        item.innerHTML = `<div class="player-info"><div>${p.name} (${p.team.substring(0,3).toUpperCase()})</div><div class="player-role">${p.role}</div></div>
                            <div class="captain-controls">${isC ? '<span class="cvc-btn active-c">C</span>' : ''}${isVC ? '<span class="cvc-btn active-vc">VC</span>' : ''}</div>`;
                    }
                    container.appendChild(item);
                });
            }
        });
    };

    const renderLiveLeaderboard = (match) => {
        const lbContainer = document.getElementById('leaderboard-container');
        lbContainer.classList.remove('d-none');
        lbContainer.innerHTML = '<div class="loader-small"></div>';

        const matchTeams = userTeams.filter(ut => ut.matchId.toString() === match.id.toString());
        
        if (matchTeams.length === 0) {
            lbContainer.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.5;">No users joined this match yet.</div>';
            return;
        }

        const calculatedTeams = matchTeams.map(ut => {
            let total = 0;
            const fullPlayers = ut.teamData.map(pid => {
                const p = squads.find(s => s.id === pid) || { id: pid, name: 'Unknown', points: 0, role: 'BAT' };
                let pts = playerPoints[pid] || 0;
                if (pid === ut.captainId) pts *= 2;
                else if (pid === ut.viceCaptainId) pts *= 1.5;
                total += pts;
                return p;
            });
            return { ...ut, fullPlayers, totalPoints: Math.floor(total) };
        });

        // Sort by points descending
        calculatedTeams.sort((a,b) => b.totalPoints - a.totalPoints);

        lbContainer.innerHTML = `
            <div class="leaderboard-header">Leaderboard (${matchTeams.length} joined)</div>
            <div class="leaderboard-list">
                ${calculatedTeams.map((team, index) => `
                    <div class="leaderboard-item" data-idx="${index}">
                        <div class="rank">#${index + 1}</div>
                        <div class="user-info">
                            <span class="username">${team.username}</span>
                            <span class="user-tag">${team.username === JSON.parse(localStorage.getItem('currentUser') || '{}').username ? 'YOU' : ''}</span>
                        </div>
                        <div class="user-pts">${team.totalPoints} pts</div>
                    </div>
                `).join('')}
            </div>
        `;

        // Click listeners for viewing teammate
        lbContainer.querySelectorAll('.leaderboard-item').forEach(item => {
            item.addEventListener('click', () => {
                const team = calculatedTeams[item.dataset.idx];
                openFieldPreview(team.fullPlayers, team.captainId, team.viceCaptainId, false);
            });
        });
    };

    const renderFieldPreview = (players, cId, vcId) => {
        const previewField = document.getElementById('preview-field');
        if (!previewField) return;
        
        const getTeamClass = (n = "") => {
            const low = n.toLowerCase();
            if (low.includes('lahore')) return 'team-lq';
            if (low.includes('karachi')) return 'team-kk';
            if (low.includes('islamabad')) return 'team-iu';
            if (low.includes('peshawar')) return 'team-pz';
            if (low.includes('quetta')) return 'team-qg';
            if (low.includes('multan')) return 'team-ms';
            if (low.includes('hyderabad')) return 'team-hk';
            if (low.includes('rawalpindi')) return 'team-rp';
            return '';
        };

        const rows = {
            WK: previewField.querySelector('.field-row[data-role="WK"]'),
            BAT: previewField.querySelector('.field-row[data-role="BAT"]'),
            AR: previewField.querySelector('.field-row[data-role="AR"]'),
            BOWL: previewField.querySelector('.field-row[data-role="BOWL"]')
        };
        Object.values(rows).forEach(r => { if(r) r.innerHTML = ''; });

        players.forEach(p => {
            const isC = p.id === cId; const isVC = p.id === vcId;
            const lastName = p.name.split(' ').pop();
            const teamInit = (p.team || '').split(' ').map(w => w[0]).join('').substring(0,3).toUpperCase();
            const tClass = getTeamClass(p.team);
            
            const badge = document.createElement('div');
            badge.className = `player-badge ${isC ? 'captain' : ''} ${isVC ? 'vice-captain' : ''} ${tClass}`;
            badge.innerHTML = `
                ${isC ? '<div class="c-vc-tag">C</div>' : ''}
                ${isVC ? '<div class="c-vc-tag">VC</div>' : ''}
                <span class="badge-name">${lastName}</span>
                <div class="badge-details">
                    <span class="badge-team">${teamInit}</span>
                    <span class="badge-role">${p.role}</span>
                </div>
                <div class="badge-pts">${playerPoints[p.id] || 0} pts</div>
            `;
            if (rows[p.role]) rows[p.role].appendChild(badge);
        });
    };

    const openFieldPreview = (players, cId, vcId, editable = true) => {
        renderFieldPreview(players, cId, vcId);
        
        // Handle Edit Button visibility based on deadline/permission
        if (editable) editTeamBtn.classList.remove('d-none');
        else editTeamBtn.classList.add('d-none');

        teamPreviewScreen.classList.remove('d-none');
    };

    backFromPreview.addEventListener('click', () => teamPreviewScreen.classList.add('d-none'));

    previewTeamBtnCaptain.addEventListener('click', () => openFieldPreview(selectedPlayers, captainId, viceCaptainId));

    previewTeamBtnView.addEventListener('click', () => {
        const team = JSON.parse(localStorage.getItem('teams') || '{}')[currentMatchId];
        if (team) {
            const match = matches.find(m => m.id === currentMatchId);
            const deadlinePassed = match && (match.status === 'live' || match.status === 'completed');
            openFieldPreview(team.players, team.captain, team.viceCaptain, !deadlinePassed);
        }
    });

    const renderCaptainSelection = () => {
        renderCategorizedList(selectedPlayers, selectedPlayersList, true);
        updateCVCUI();
    };
    const updateCVCUI = () => {
        document.querySelectorAll('.cvc-btn').forEach(b => b.classList.remove('active-c', 'active-vc'));
        if (captainId) {
            const cBtn = document.getElementById(`c-${captainId}`);
            if (cBtn) cBtn.classList.add('active-c');
        }
        if (viceCaptainId) {
            const vcBtn = document.getElementById(`vc-${viceCaptainId}`);
            if (vcBtn) vcBtn.classList.add('active-vc');
        }
        if (captainId && viceCaptainId) saveTeamBtn.classList.remove('d-none');
        else saveTeamBtn.classList.add('d-none');
    };

    saveTeamBtn.addEventListener('click', async () => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return showMsg('Please login first!', 'error');

        // Check if deadline passed
        const match = matches.find(m => m.id === currentMatchId);
        if (match && (match.status === 'live' || match.status === 'completed')) {
            return showMsg('Action blocked: Match has already started!', 'error');
        }

        const originalText = saveTeamBtn.textContent;
        saveTeamBtn.textContent = 'Saving...';
        saveTeamBtn.disabled = true;

        const teamData = {
            action: 'saveTeam',
            username: user.username,
            matchId: currentMatchId,
            matchName: matchTeamsDisplay.textContent, 
            teamData: selectedPlayers.map(p => p.id), // Just IDs for efficiency
            captainId: captainId,
            viceCaptainId: viceCaptainId
        };

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(teamData)
            });
            const result = await response.json();

            if (result.result === 'success') {
                // Update local storage too for immediate UI updates
                const t = JSON.parse(localStorage.getItem('teams') || '{}');
                t[currentMatchId] = { players: selectedPlayers, captain: captainId, viceCaptain: viceCaptainId };
                localStorage.setItem('teams', JSON.stringify(t));

                showMsg('Team saved to Cloud!', 'success');
                captainSelectionScreen.classList.add('d-none');
                matchDetailsScreen.classList.remove('d-none');
                updateTeamButtons();
            } else {
                showMsg(result.message || 'Failed to save team', 'error');
            }
        } catch (error) {
            console.error('Save team error:', error);
            showMsg('Error saving team. Check your connection.', 'error');
        } finally {
            saveTeamBtn.textContent = originalText;
            saveTeamBtn.disabled = false;
        }
    });

    backToPlayerSelection.addEventListener('click', () => { 
        captainSelectionScreen.classList.add('d-none'); 
        playerSelectionScreen.classList.remove('d-none'); 
    });

    // ... Match Action Listeners ...
    backToHome.addEventListener('click', () => { 
        matchDetailsScreen.classList.add('d-none'); 
        homeScreen.classList.remove('d-none'); 
    });

    backToMatchDetails.addEventListener('click', () => {
        playerSelectionScreen.classList.add('d-none');
        matchDetailsScreen.classList.remove('d-none');
    });
    
    backFromView.addEventListener('click', () => { 
        teamViewScreen.classList.add('d-none'); 
        matchDetailsScreen.classList.remove('d-none'); 
    });

    createTeamBtn.addEventListener('click', () => openPlayerSelection(matches.find(m => m.id === currentMatchId)));

    viewTeamBtn.addEventListener('click', () => {
        const team = JSON.parse(localStorage.getItem('teams') || '{}')[currentMatchId];
        matchDetailsScreen.classList.add('d-none');
        teamViewScreen.classList.remove('d-none');
        viewMatchTeams.textContent = matchTeamsDisplay.textContent;
        renderCategorizedList(team.players, viewPlayersList, false, team);
    });

    editTeamBtn.addEventListener('click', () => {
        const team = JSON.parse(localStorage.getItem('teams') || '{}')[currentMatchId];
        openPlayerSelection(matches.find(m => m.id === currentMatchId), team);
    });

    checkSession();

    logoutBtn.addEventListener('click', () => {
        logoutModal.classList.remove('d-none');
    });

    logoutNo.addEventListener('click', () => {
        logoutModal.classList.add('d-none');
    });

    logoutYes.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        logoutModal.classList.add('d-none');
        homeScreen.classList.add('d-none');
        
        // Reset forms to clear pre-filled data
        loginForm.reset();
        signupForm.reset();
        
        // Always show login form on logout
        signupForm.classList.add('d-none');
        loginForm.classList.remove('d-none');
        authBox.classList.remove('d-none');
        
        showMsg('Logged out successfully!', 'success');
    });
});
