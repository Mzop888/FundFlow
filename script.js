
        // --- MOCK DATABASE & STATE ---
        let db = {
            users: [
                { id: 1, name: 'Admin solo', email: 'solo@gmail.com', initials: 'AU', profilePicture: null }
            ],
            members: [
                { id: 1, name: 'Anzal', email: 'anzal@gmail.com', initials: 'JD', password: 'anzal', profilePicture: null },
                { id: 2, name: 'Jamel', email: 'jamel@gmail.com', initials: 'SS', password: 'jamel', profilePicture: null },
                { id: 3, name: 'Adhil', email: 'adhil@gmail.com', initials: 'MJ', password: 'adhil', profilePicture: null },
                { id: 4, name: 'Aslam', email: 'aslam@gmail.com', initials: 'EW', password: 'aslam', profilePicture: null },
            ],
            collections: [
                {
                    id: 1,
                    name: 'Goa Trip Fund',
                    amountPerMember: 5000,
                    goalAmount: 25000,
                    createdAt: '2025-07-15',
                    paymentDeadline: '2025-08-15T23:59',
                    goalCompletionDate: '2025-08-30T23:59',
                    frequency: 'one-time',
                    payments: [
                        { memberId: 1, status: 'paid', amount: 5000, method: 'online', paymentDate: '2025-07-28T10:30' },
                        { memberId: 2, status: 'paid', amount: 5000, method: 'offline', paymentDate: '2025-07-29T14:00' },
                        { memberId: 3, status: 'pending', amount: 5000, method: null, paymentDate: null },
                        { memberId: 4, status: 'pending', amount: 5000, method: null, paymentDate: null },
                    ]
                },
                {
                    id: 2,
                    name: 'Monthly Lunch',
                    amountPerMember: 1200,
                    goalAmount: null,
                    createdAt: '2025-08-01',
                    paymentDeadline: null,
                    goalCompletionDate: null,
                    frequency: 'one-time',
                    payments: [
                        { memberId: 1, status: 'paid', amount: 1200, method: 'online', paymentDate: null },
                        { memberId: 2, status: 'pending', amount: 1200, method: null, paymentDate: null },
                        { memberId: 3, status: 'pending', amount: 1200, method: null, paymentDate: null },
                        { memberId: 4, status: 'paid', amount: 1200, method: 'offline', paymentDate: null },
                    ]
                },
                {
                    id: 3,
                    name: 'Movie Fund',
                    amountPerMember: 10,
                    goalAmount: 1000,
                    createdAt: '2025-08-01',
                    paymentDeadline: null,
                    goalCompletionDate: null,
                    frequency: 'daily',
                    payments: [
                        { memberId: 1, status: 'paid', amount: 10, method: 'online', paymentDate: '2025-08-01T10:00' },
                        { memberId: 2, status: 'paid', amount: 10, method: 'offline', paymentDate: '2025-08-01T10:00' },
                        { memberId: 3, status: 'paid', amount: 10, method: 'offline', paymentDate: '2025-08-01T10:00' },
                        { memberId: 4, status: 'paid', amount: 10, method: 'offline', paymentDate: '2025-08-01T10:00' },
                    ]
                }
            ]
        };

        const appState = {
            currentUser: null,
            currentUserRole: null,
            activeScreen: 'dashboard',
            currentCollectionId: null,
        };
        
        // --- APP INITIALIZATION ---
        window.onload = () => {
            setupLoginListeners();
            if (sessionStorage.getItem('isLoggedIn')) {
                appState.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
                appState.currentUserRole = sessionStorage.getItem('userRole');
                showApp();
            } else {
                showLogin();
            }
        };

        // --- AUTHENTICATION ---
        function login(role, user = null) {
            showLoader();
            setTimeout(() => { // Simulate network delay
                if (role === 'admin') {
                    appState.currentUser = db.users[0];
                } else {
                    appState.currentUser = user;
                }
                appState.currentUserRole = role;
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('currentUser', JSON.stringify(appState.currentUser));
                sessionStorage.setItem('userRole', appState.currentUserRole);
                showApp();
                hideLoader();
            }, 500);
        }

        function logout() {
            appState.currentUser = null;
            appState.currentUserRole = null;
            sessionStorage.clear();
            showLogin();
        }

        function showLogin() {
            mainApp.classList.remove('active');
            loginScreen.style.display = 'flex';
            anime({ targets: loginScreen, opacity: [0, 1], duration: 500, easing: 'easeInOutQuad' });
            anime({ targets: '.logo, .tagline, .login-form', translateY: [30, 0], opacity: [0, 1], delay: anime.stagger(100, {start: 200}), easing: 'easeOutExpo' });
        }

        function showApp() {
            loginScreen.style.display = 'none';
            mainApp.classList.add('active');
            mainApp.className = 'main-app active'; // Reset classes
            mainApp.classList.add(appState.currentUserRole === 'admin' ? 'admin-view' : 'user-view');
            
            updateAvatarDisplay(document.getElementById('userAvatar'), appState.currentUser);
            setupAppEventListeners();
            renderAll();
            anime({ targets: mainApp, opacity: [0, 1], duration: 500, easing: 'easeInOutQuad' });
        }

        // --- NAVIGATION ---
        function showScreen(screenId) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.button').forEach(b => b.classList.remove('active'));
            
            const screen = document.getElementById(screenId);
            const button = document.querySelector(`.button[onclick*="'${screenId}'"]`);

            if (screen) screen.classList.add('active');
            if (button) button.classList.add('active');
            
            appState.activeScreen = screenId;
            
            anime({ targets: `#${screenId}`, translateY: [20, 0], opacity: [0, 1], duration: 400, easing: 'easeOutQuad' });
            if(screenId === 'dashboard') renderDashboard();
            if(screenId === 'profile') renderProfile();
        }
        
        // --- RENDERING ---
        function renderAll() {
            renderDashboard();
            renderCollections();
            renderMembers();
            renderProfile();
        }

        function renderDashboard() {
            const dashboardContent = document.getElementById('dashboardContent');
            const latestCollection = db.collections.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

            if (!latestCollection) {
                dashboardContent.innerHTML = `<div class="card"><p>No collections yet. Create one to get started!</p></div>`;
                return;
            }

            const collectedAmount = latestCollection.payments.reduce((sum, p) => p.status === 'paid' ? sum + p.amount : sum, 0);
            const totalGoal = latestCollection.goalAmount || (latestCollection.amountPerMember * latestCollection.payments.length);
            
            const progress = totalGoal > 0 ? Math.round((collectedAmount / totalGoal) * 100) : 0;
            const radius = 60;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (progress / 100) * circumference;

            const today = new Date().toISOString().split('T')[0];
            const todaysPayments = [];
            db.collections.forEach(c => {
                c.payments.forEach(p => {
                    if (p.paymentDate && p.paymentDate.startsWith(today)) {
                        const member = db.members.find(m => m.id === p.memberId);
                        if(member) todaysPayments.push({ ...p, memberName: member.name });
                    }
                });
            });

            dashboardContent.innerHTML = `
                <div class="card">
                    <h3 class="section-title" style="text-align: center; margin-bottom: 1rem;">${latestCollection.name} Goal</h3>
                    <div class="goal-chart-container">
                        <svg class="goal-chart-svg" viewBox="0 0 140 140">
                            <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="var(--glass-border)" stroke-width="12"></circle>
                            <circle id="progress-circle" cx="70" cy="70" r="${radius}" fill="transparent" stroke="url(#progressGradient)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"></circle>
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="${progress > 80 ? 'var(--secondary)' : 'var(--primary)'}" />
                                    <stop offset="100%" stop-color="${progress < 20 ? 'var(--danger)' : 'var(--secondary)'}" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div class="goal-chart-text">
                            <div class="goal-chart-percent">${progress}%</div>
                            <div class="goal-chart-label">Completed</div>
                        </div>
                    </div>
                     <p style="color: var(--text-muted); text-align: center; margin-top: 1rem;">
                        ₹${collectedAmount.toLocaleString('en-IN')} / ₹${totalGoal.toLocaleString('en-IN')}
                    </p>
                </div>

                <div class="card" id="todays-collection-card">
                    <h3 class="section-title">
                        Today's Collection
                        <button class="action-btn" onclick="shareTodaysCollection()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        </button>
                    </h3>
                    <div id="todaysCollectionList">
                        ${todaysPayments.length > 0 ? `
                            <table class="today-collection-table">
                                <thead>
                                    <tr><th>Member</th><th>Amount</th><th>Time</th></tr>
                                </thead>
                                <tbody>
                                ${todaysPayments.map(p => `
                                    <tr>
                                        <td>${p.memberName}</td>
                                        <td>₹${p.amount}</td>
                                        <td>${new Date(p.paymentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                    </tr>
                                `).join('')}
                                </tbody>
                            </table>
                        ` : `<p style="color: var(--text-muted); text-align: center;">No payments recorded today.</p>`}
                    </div>
                </div>
            `;
            
            anime({
                targets: '#progress-circle',
                strokeDashoffset: [circumference, offset],
                duration: 1200,
                easing: 'easeInOutSine'
            });
        }

        function renderCollections() {
            const listEl = document.getElementById('collectionsList');
            if (db.collections.length === 0) {
                listEl.innerHTML = `<p style="color: var(--text-muted)">No collections yet. Create one from the dashboard!</p>`;
                return;
            }
            
            listEl.innerHTML = db.collections.map(collection => {
                const paidCount = collection.payments.filter(p => p.status === 'paid').length;
                const totalCount = collection.payments.length;
                const progress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
                const timeLeft = getTimeLeft(collection.paymentDeadline);
                const isAdmin = appState.currentUserRole === 'admin';

                return `
                    <div class="card">
                        <div class="member-card">
                            <div class="member-info" ${isAdmin ? `onclick="viewCollection(${collection.id})"` : ''}>
                                <div class="member-avatar" style="border-radius: 12px;">💰</div>
                                <div class="member-details">
                                    <h4>${collection.name}</h4>
                                    <p>${paidCount}/${totalCount} Paid - ₹${collection.amountPerMember}/person</p>
                                    <div style="background: var(--glass); height: 5px; border-radius: 5px; overflow: hidden; margin-top: 8px;">
                                        <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary));"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-actions admin-only" style="display: ${isAdmin ? 'flex' : 'none'}">
                                <button class="action-btn" onclick="openEditCollectionModal(${collection.id})">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button class="action-btn delete-btn" onclick="openConfirmationModal('collection', ${collection.id}, '${collection.name}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderMembers() {
            const listEl = document.getElementById('membersList');
            listEl.innerHTML = db.members.map(member => {
                let totalDue = 0;
                db.collections.forEach(c => {
                    const payment = c.payments.find(p => p.memberId === member.id && p.status === 'pending');
                    if (payment) {
                        totalDue += payment.amount;
                    }
                });
                const isAdmin = appState.currentUserRole === 'admin';

                return `
                    <div class="card">
                        <div class="member-card">
                            <div class="member-info">
                                <div class="member-avatar">${member.initials}</div>
                                <div class="member-details">
                                    <h4>${member.name}</h4>
                                    <p>${member.email}</p>
                                </div>
                                <span class="status-badge ${totalDue > 0 ? 'status-pending' : 'status-paid'}">
                                    ${totalDue > 0 ? `Due: ₹${totalDue.toLocaleString('en-IN')}` : 'All Paid'}
                                </span>
                            </div>
                             <div class="card-actions admin-only" style="display: ${isAdmin ? 'flex' : 'none'}">
                                <button class="action-btn" onclick="openEditMemberModal(${member.id})">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button class="action-btn delete-btn" onclick="openConfirmationModal('member', ${member.id}, '${member.name}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderProfile() {
            const profileCard = document.getElementById('profile-card');
            if (!appState.currentUser) return;
            
            const avatarContainer = document.createElement('div');
            avatarContainer.className = 'member-avatar';
            avatarContainer.style.width = '60px';
            avatarContainer.style.height = '60px';
            avatarContainer.style.fontSize = '1.5rem';
            updateAvatarDisplay(avatarContainer, appState.currentUser);

            profileCard.innerHTML = `
                <div class="member-info">
                    ${avatarContainer.outerHTML}
                    <div class="member-details">
                        <h4>${appState.currentUser.name}</h4>
                        <p>${appState.currentUser.email}</p>
                    </div>
                </div>
                <button class="btn" style="margin-top: 1.5rem;" onclick="openEditProfileModal()">Edit Profile</button>
            `;
        }

        function viewCollection(collectionId) {
            appState.currentCollectionId = collectionId;
            const collection = db.collections.find(c => c.id === collectionId);
            if (!collection) return;

            const contentEl = document.getElementById('collectionDetailContent');
            const collectedAmount = collection.payments.reduce((sum, p) => p.status === 'paid' ? sum + p.amount : sum, 0);
            const totalGoal = collection.goalAmount || (collection.amountPerMember * collection.payments.length);
            const paymentTimeLeft = getTimeLeft(collection.paymentDeadline);
            const goalTimeLeft = getTimeLeft(collection.goalCompletionDate);

            contentEl.innerHTML = `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                         <div>
                            <h2 style="font-size: 2rem; font-weight: 800;">₹${collection.amountPerMember.toLocaleString('en-IN')}</h2>
                            <h3 class="section-title" style="margin-bottom: 0.5rem;">${collection.name}</h3>
                         </div>
                         <div>
                            <p style="text-align: right; font-size: 0.9rem; color: var(--text-muted)">Payment</p>
                            <span class="status-badge ${paymentTimeLeft.overdue ? 'status-overdue' : ''}">${paymentTimeLeft.text}</span>
                         </div>
                    </div>
                    <p style="color: var(--text-muted); text-align: left; margin-top: 0.5rem;">
                        Collected ₹${collectedAmount.toLocaleString('en-IN')} of ₹${totalGoal.toLocaleString('en-IN')}
                    </p>
                     <p style="color: var(--text-muted); text-align: left; margin-top: 0.5rem;">
                        Goal Date: ${goalTimeLeft.text}
                    </p>
                </div>
                <div class="admin-only" style="display: ${appState.currentUserRole === 'admin' ? 'block' : 'none'}">
                    <button class="btn" onclick="generateReminder(${collection.id})">✨ Generate Reminder</button>
                </div>
                <h3 class="section-title" style="margin-top: 1.5rem;">Payments</h3>
                <div class="member-list">
                    ${collection.payments.map(p => {
                        const member = db.members.find(m => m.id === p.memberId);
                        if (!member) return '';
                        const clickableClass = appState.currentUserRole === 'admin' ? `onclick="openPaymentModal(${collection.id}, ${member.id})"` : '';
                        return `
                        <div class="card member-card" ${clickableClass}>
                            <div class="member-info">
                                <div class="member-avatar">${member.initials}</div>
                                <div class="member-details">
                                    <h4>${member.name}</h4>
                                    <p>Due: ₹${p.amount}</p>
                                </div>
                            </div>
                            <span class="status-badge status-${p.status}">${p.method ? `${p.status} (${p.method})` : p.status}</span>
                        </div>
                        `
                    }).join('')}
                </div>
            `;
            showScreen('collectionDetail');
        }

        // --- MODALS & FORMS ---
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.add('active');
            anime({ targets: modal, opacity: [0, 1], duration: 300, easing: 'easeInOutQuad' });
            anime({ targets: `#${modalId} .modal-content`, translateY: [100, 0], scale: [0.95, 1], opacity: [0, 1], duration: 400, easing: 'easeOutExpo' });
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            anime({
                targets: modal,
                opacity: 0,
                duration: 300,
                easing: 'easeInOutQuad',
                complete: () => {
                    modal.classList.remove('active');
                    modal.querySelector('form')?.reset();
                }
            });
        }

        function openNewCollectionModal() {
            document.getElementById('collectionForm').reset();
            document.getElementById('collectionId').value = '';
            document.getElementById('collectionModalTitle').innerText = 'Create New Collection';
            document.getElementById('collectionFormSubmit').innerText = 'Create Collection';
            openModal('collectionModal');
        }

        function openEditCollectionModal(id) {
            const collection = db.collections.find(c => c.id === id);
            if (!collection) return;

            document.getElementById('collectionId').value = collection.id;
            document.getElementById('collectionName').value = collection.name;
            document.getElementById('collectionAmount').value = collection.amountPerMember;
            document.getElementById('collectionFrequency').value = collection.frequency;
            document.getElementById('paymentDeadline').value = collection.paymentDeadline || '';
            document.getElementById('goalCompletionDate').value = collection.goalCompletionDate || '';
            document.getElementById('goalAmount').value = collection.goalAmount || '';
            
            document.getElementById('collectionModalTitle').innerText = 'Edit Collection';
            document.getElementById('collectionFormSubmit').innerText = 'Save Changes';
            openModal('collectionModal');
        }

        function openNewMemberModal() {
            document.getElementById('memberForm').reset();
            document.getElementById('memberId').value = '';
            document.getElementById('memberModalTitle').innerText = 'Add New Member';
            document.getElementById('memberFormSubmit').innerText = 'Add Member';
            openModal('memberModal');
        }

        function openEditMemberModal(id) {
            const member = db.members.find(m => m.id === id);
            if (!member) return;

            document.getElementById('memberId').value = member.id;
            document.getElementById('memberName').value = member.name;
            document.getElementById('memberEmail').value = member.email;

            document.getElementById('memberModalTitle').innerText = 'Edit Member';
            document.getElementById('memberFormSubmit').innerText = 'Save Changes';
            openModal('memberModal');
        }

        function openEditProfileModal() {
            document.getElementById('profileName').value = appState.currentUser.name;
            document.getElementById('profileEmail').value = appState.currentUser.email;
            updateAvatarDisplay(document.getElementById('profilePicturePreview'), appState.currentUser);
            openModal('profileModal');
        }

        // --- EVENT LISTENERS ---
        function setupLoginListeners() {
            document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const id = document.getElementById('adminId').value;
                const pass = document.getElementById('adminPassword').value;
                if (id === 'solo' && pass === 'mzop478') {
                    login('admin');
                } else {
                    showToast('Invalid admin credentials.');
                    anime({
                        targets: '#adminLoginForm',
                        translateX: [-10, 10, -10, 10, 0],
                        duration: 500,
                        easing: 'easeInOutSine'
                    });
                }
            });
            
             document.getElementById('userLoginForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('userId').value;
                const pass = document.getElementById('userPassword').value;
                const user = db.members.find(m => m.email === email && m.password === pass);

                if (user) {
                    login('user', user);
                } else {
                    showToast('Invalid user credentials.');
                     anime({
                        targets: '#userLoginForm',
                        translateX: [-10, 10, -10, 10, 0],
                        duration: 500,
                        easing: 'easeInOutSine'
                    });
                }
            });
        }
        
        function setupAppEventListeners() {
            document.getElementById('collectionForm').addEventListener('submit', handleCollectionFormSubmit);
            document.getElementById('memberForm').addEventListener('submit', handleMemberFormSubmit);
            document.getElementById('profileForm').addEventListener('submit', handleProfileFormSubmit);
            
            const formElements = ['collectionAmount', 'collectionFrequency', 'goalCompletionDate'];
            formElements.forEach(id => {
                document.getElementById(id).addEventListener('input', calculateGoalAmount);
            });
            
            document.getElementById('goalCompletionDate').addEventListener('input', (e) => {
                const paymentDeadlineInput = document.getElementById('paymentDeadline');
                if (!paymentDeadlineInput.value) {
                    paymentDeadlineInput.value = e.target.value;
                }
            });
            
            document.getElementById('profilePictureInput').addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const preview = document.getElementById('profilePicturePreview');
                        preview.innerHTML = `<img src="${event.target.result}" alt="Profile Preview">`;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        function calculateGoalAmount() {
            const perMember = parseFloat(document.getElementById('collectionAmount').value) || 0;
            const frequency = document.getElementById('collectionFrequency').value;
            const deadline = document.getElementById('goalCompletionDate').value;
            const goalAmountInput = document.getElementById('goalAmount');
            const memberCount = db.members.length;

            if (perMember <= 0) {
                goalAmountInput.value = '';
                return;
            }

            let occurrences = 1;
            if (frequency !== 'one-time' && deadline) {
                const now = new Date();
                const end = new Date(deadline);
                const diffTime = end - now;

                if (diffTime > 0) {
                    const diffDays = diffTime / (1000 * 60 * 60 * 24);
                    if (frequency === 'daily') {
                        occurrences = Math.ceil(diffDays);
                    } else if (frequency === 'weekly') {
                        occurrences = Math.ceil(diffDays / 7);
                    } else if (frequency === 'monthly') {
                        occurrences = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth()) + 1;
                    }
                }
            }
            
            const totalGoal = perMember * memberCount * occurrences;
            goalAmountInput.value = totalGoal.toFixed(0);
        }
        
        function handleCollectionFormSubmit(e) {
            e.preventDefault();
            const id = document.getElementById('collectionId').value;
            if (id) {
                // Update existing collection
                const collection = db.collections.find(c => c.id === parseInt(id));
                collection.name = document.getElementById('collectionName').value;
                collection.amountPerMember = parseFloat(document.getElementById('collectionAmount').value);
                collection.goalAmount = parseFloat(document.getElementById('goalAmount').value) || (collection.amountPerMember * db.members.length);
                collection.paymentDeadline = document.getElementById('paymentDeadline').value || null;
                collection.goalCompletionDate = document.getElementById('goalCompletionDate').value || null;
                collection.frequency = document.getElementById('collectionFrequency').value;
                showToast(`Collection "${collection.name}" updated!`);
            } else {
                // Create new collection
                const name = document.getElementById('collectionName').value;
                const amount = parseFloat(document.getElementById('collectionAmount').value);
                const goalAmount = parseFloat(document.getElementById('goalAmount').value) || (amount * db.members.length);
                let paymentDeadline = document.getElementById('paymentDeadline').value || null;
                const goalCompletionDate = document.getElementById('goalCompletionDate').value || null;
                const frequency = document.getElementById('collectionFrequency').value;

                if (!paymentDeadline) {
                    paymentDeadline = goalCompletionDate;
                }

                const newPayments = db.members.map(member => ({ 
                    memberId: member.id, 
                    status: 'pending', 
                    amount: amount,
                    method: null, 
                    paymentDate: null 
                }));

                const newCollection = {
                    id: Date.now(), name, amountPerMember: amount, goalAmount, paymentDeadline, goalCompletionDate, frequency,
                    createdAt: new Date().toISOString().split('T')[0],
                    payments: newPayments
                };
                db.collections.unshift(newCollection);
                showToast(`Collection "${name}" created!`);
            }
            
            closeModal('collectionModal');
            renderAll();
            showScreen('collections');
        }

        function handleMemberFormSubmit(e) {
            e.preventDefault();
            const id = document.getElementById('memberId').value;
            const name = document.getElementById('memberName').value;
            const email = document.getElementById('memberEmail').value;
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

            if (id) {
                // Update existing member
                const member = db.members.find(m => m.id === parseInt(id));
                member.name = name;
                member.email = email;
                member.initials = initials;
                showToast(`Member "${name}" updated!`);
            } else {
                // Create new member
                const newMember = { id: Date.now(), name, email, initials, password: 'password', profilePicture: null };
                db.members.push(newMember);
                db.collections.forEach(collection => {
                    collection.payments.push({ memberId: newMember.id, status: 'pending', amount: collection.amountPerMember, method: null, paymentDate: null });
                });
                showToast(`Member "${name}" added.`);
            }

            closeModal('memberModal');
            renderAll();
            showScreen('members');
        }
        
        function handleProfileFormSubmit(e) {
            e.preventDefault();
            const name = document.getElementById('profileName').value;
            const email = document.getElementById('profileEmail').value;
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
            const fileInput = document.getElementById('profilePictureInput');
            const file = fileInput.files[0];

            const updateUser = (imageData) => {
                appState.currentUser.name = name;
                appState.currentUser.email = email;
                appState.currentUser.initials = initials;
                if (imageData) {
                    appState.currentUser.profilePicture = imageData;
                }

                // Also update the db
                if(appState.currentUserRole === 'admin') {
                    db.users[0] = appState.currentUser;
                } else {
                    const memberIndex = db.members.findIndex(m => m.id === appState.currentUser.id);
                    db.members[memberIndex] = appState.currentUser;
                }

                sessionStorage.setItem('currentUser', JSON.stringify(appState.currentUser));
                
                closeModal('profileModal');
                renderAll();
                updateAvatarDisplay(document.getElementById('userAvatar'), appState.currentUser);
                showToast('Profile updated!');
            };

            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    updateUser(event.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                updateUser(appState.currentUser.profilePicture);
            }
        }
        
        function openPaymentModal(collectionId, memberId) {
            if (appState.currentUserRole !== 'admin') return;
            const collection = db.collections.find(c => c.id === collectionId);
            const payment = collection.payments.find(p => p.memberId === memberId);
            const member = db.members.find(m => m.id === memberId);

            document.getElementById('paymentModalTitle').innerText = `Payment for ${member.name}`;
            document.getElementById('paymentModalBody').innerHTML = `
                <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">Amount Due: <span style="font-weight: 700;">₹${payment.amount}</span></p>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">Collection: ${collection.name}</p>
                <div class="action-grid">
                    <button class="btn" onclick="updatePaymentStatus(${collection.id}, ${member.id}, 'paid', 'online')">Paid (Online)</button>
                    <button class="btn" onclick="updatePaymentStatus(${collection.id}, ${member.id}, 'paid', 'offline')">Paid (Offline)</button>
                </div>
                <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="updatePaymentStatus(${collection.id}, ${member.id}, 'pending', null)">Mark as Pending</button>
            `;
            openModal('memberPaymentModal');
        }
        
        function updatePaymentStatus(collectionId, memberId, status, method) {
            const collection = db.collections.find(c => c.id === collectionId);
            const payment = collection.payments.find(p => p.memberId === memberId);
            const member = db.members.find(m => m.id === memberId);
            
            payment.status = status;
            payment.method = method;
            payment.paymentDate = status === 'paid' ? new Date().toISOString() : null;

            if (status === 'paid') {
                showToast(`Payment of ₹${payment.amount} from ${member.name} confirmed.`);
            }
            
            closeModal('memberPaymentModal');
            renderAll();
            if (appState.activeScreen === 'collectionDetail') {
                viewCollection(collectionId);
            }
        }

        // --- DELETE FUNCTIONS ---
        function openConfirmationModal(type, id, name) {
            const modal = document.getElementById('confirmationModal');
            const messageEl = document.getElementById('confirmationMessage');
            const confirmBtn = document.getElementById('confirmDeleteBtn');

            messageEl.innerHTML = `Are you sure you want to delete <strong>${name}</strong>? This will remove all associated data and cannot be undone.`;
            
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

            newConfirmBtn.onclick = () => {
                if (type === 'collection') {
                    deleteCollection(id);
                } else if (type === 'member') {
                    deleteMember(id);
                }
            };

            openModal('confirmationModal');
        }

        function deleteCollection(id) {
            const collectionName = db.collections.find(c => c.id === id)?.name || 'the collection';
            db.collections = db.collections.filter(c => c.id !== id);
            
            closeModal('confirmationModal');
            renderAll();
            if (appState.activeScreen === 'collectionDetail') {
                showScreen('collections');
            }
            showToast(`Collection "${collectionName}" was deleted.`);
        }

        function deleteMember(id) {
            const memberName = db.members.find(m => m.id === id)?.name || 'the member';
            db.members = db.members.filter(m => m.id !== id);
            
            db.collections.forEach(collection => {
                collection.payments = collection.payments.filter(p => p.memberId !== id);
            });

            closeModal('confirmationModal');
            renderAll();
            showToast(`Member "${memberName}" was deleted.`);
        }

        // --- UTILITY FUNCTIONS ---
        function updateAvatarDisplay(avatarEl, user) {
            if (!avatarEl || !user) return;
            if (user.profilePicture) {
                avatarEl.innerHTML = `<img src="${user.profilePicture}" alt="${user.name}">`;
            } else {
                avatarEl.innerHTML = user.initials;
            }
        }

        function getTimeLeft(deadline) {
            if (!deadline) return { text: 'No deadline', overdue: false };

            const now = new Date();
            const end = new Date(deadline);
            const diff = end - now;

            if (diff <= 0) {
                return { text: 'Overdue', overdue: true };
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);

            if (days > 0) return { text: `in ${days} day${days > 1 ? 's' : ''}`, overdue: false };
            if (hours > 0) return { text: `in ${hours} hour${hours > 1 ? 's' : ''}`, overdue: false };
            return { text: `in ${minutes} min`, overdue: false };
        }

        function showToast(message) {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            container.appendChild(toast);

            anime({
                targets: toast,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 500,
                easing: 'easeOutExpo',
                complete: () => {
                    anime({
                        targets: toast,
                        opacity: 0,
                        translateY: -20,
                        duration: 500,
                        easing: 'easeInExpo',
                        delay: 3000,
                        complete: () => {
                            container.removeChild(toast);
                        }
                    });
                }
            });
        }
        
        function shareTodaysCollection() {
            showLoader();
            const cardToCapture = document.getElementById('todays-collection-card');
            if (!cardToCapture) {
                hideLoader();
                return;
            }

            html2canvas(cardToCapture, {
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--surface').trim(),
                scale: 2 
            }).then(canvas => {
                const previewContainer = document.getElementById('screenshot-preview');
                previewContainer.innerHTML = '';
                const img = new Image();
                img.src = canvas.toDataURL('image/png');
                previewContainer.appendChild(img);
                
                const downloadLink = document.getElementById('downloadScreenshot');
                downloadLink.href = img.src;
                
                hideLoader();
                openModal('screenshotModal');
            });
        }
        
        async function generateReminder(collectionId) {
            showLoader();
            const collection = db.collections.find(c => c.id === collectionId);
            if (!collection) {
                hideLoader();
                return;
            }

            const reminderTextEl = document.getElementById('reminder-text');
            reminderTextEl.textContent = 'Generating...';
            openModal('reminderModal');

            const unpaidMembers = collection.payments
                .filter(p => p.status === 'pending')
                .map(p => db.members.find(m => m.id === p.memberId).name);

            if (unpaidMembers.length === 0) {
                reminderTextEl.textContent = 'Everyone has paid up!';
                hideLoader();
                return;
            }

            const prompt = `Write a friendly but firm reminder for a group money collection.
            - Collection Name: "${collection.name}"
            - Amount Due: ₹${collection.amountPerMember}
            - People to remind: ${unpaidMembers.join(', ')}
            
            Keep it concise and suitable for a group chat.`;

            try {
                let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
                const payload = { contents: chatHistory };
                const apiKey = ""; 
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                
                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    reminderTextEl.textContent = text;

                    document.getElementById('copyReminderBtn').onclick = () => {
                        const textarea = document.createElement('textarea');
                        textarea.value = text;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        showToast('Reminder copied to clipboard!');
                    };
                } else {
                    reminderTextEl.textContent = 'Could not generate a reminder at this time.';
                }
            } catch (error) {
                console.error("Error generating reminder:", error);
                reminderTextEl.textContent = 'An error occurred. Please try again.';
            } finally {
                hideLoader();
            }
        }
        
        function showLoader() {
            document.getElementById('loader').style.display = 'flex';
        }

        function hideLoader() {
            document.getElementById('loader').style.display = 'none';
        }
