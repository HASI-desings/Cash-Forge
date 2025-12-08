/**
 * CashForge Authentication Handler
 * Manages user sessions, registration, and route protection.
 * Dependencies: config.js, db.js
 */

const Auth = {
    
    // =================================
    // 1. REGISTRATION
    // =================================
    register: function(name, email, password, confirmPass, refCode) {
        // Basic Validation
        if (!name || !email || !password) {
            return { success: false, msg: "All fields are required." };
        }
        
        if (password.length < 6) {
            return { success: false, msg: "Password must be at least 6 characters." };
        }

        if (password !== confirmPass) {
            return { success: false, msg: "Passwords do not match." };
        }

        // Create New User Object
        // Note: In a real app, this would be an API call. 
        // Here we overwrite the local "Current User" to simulate a new account.
        const newUser = {
            uid: "UID-" + Math.floor(100000 + Math.random() * 900000),
            name: name,
            email: email,
            password: password, // Security Note: Never store plain passwords in real apps!
            balance: 0,         // New users start with 0
            vipLevel: 0,
            teamCount: 0,
            totalIncome: 0,
            pin: null,          // Withdrawal PIN not set
            referrer: refCode || null,
            joinedDate: new Date().toISOString().split('T')[0]
        };

        // Initialize Mock Data for new user
        DB.saveUser(newUser);
        
        // Reset Transaction History for new user
        localStorage.setItem('cf_transactions', JSON.stringify([]));
        localStorage.setItem('cf_my_plans', JSON.stringify([]));

        // Auto-Login (Set Token)
        this.setSession();

        return { success: true, msg: "Account created successfully!" };
    },

    // =================================
    // 2. LOGIN
    // =================================
    login: function(email, password) {
        // 1. Get stored user
        const storedUser = DB.getUser();

        // 2. Validation
        if (!email || !password) {
            return { success: false, msg: "Please enter email and password." };
        }

        // 3. Mock Authentication Logic
        // Since this is a frontend demo, we check if the input matches the stored mock user.
        // If the stored user is generic ("New Member"), we update it to match this login 
        // so the demo feels personalized.
        
        if (storedUser.email === "" || storedUser.email === email) {
            // Update the mock user email if it was empty
            if(storedUser.email === "") {
                storedUser.email = email;
                DB.saveUser(storedUser);
            }
            
            // Set Session
            this.setSession();
            return { success: true, msg: "Login successful!" };
        } else {
            // If email doesn't match the one in localStorage
            return { success: false, msg: "Invalid credentials (Demo: Use the email you registered with)" };
        }
    },

    // =================================
    // 3. SESSION MANAGEMENT
    // =================================
    
    // Set Session Token
    setSession: function() {
        const token = "cf_token_" + Date.now() + "_" + Math.random().toString(36).substr(2);
        localStorage.setItem(CONFIG.STORAGE.TOKEN, token);
    },

    // Check if user is logged in
    isAuthenticated: function() {
        return !!localStorage.getItem(CONFIG.STORAGE.TOKEN);
    },

    // Logout
    logout: function() {
        localStorage.removeItem(CONFIG.STORAGE.TOKEN);
        window.location.href = 'login.html';
    },

    // Guard: Protect internal pages
    checkProtection: function() {
        const path = window.location.pathname;
        const publicPages = ['index.html', 'login.html', 'register.html', 'forget-password.html'];
        
        // Check if current page is NOT public
        let isProtected = true;
        publicPages.forEach(page => {
            if (path.includes(page)) isProtected = false;
        });

        // Redirect if not logged in
        if (isProtected && !this.isAuthenticated()) {
            window.location.href = 'login.html';
        }
        
        // Redirect if logged in but trying to access login/register
        if (!isProtected && this.isAuthenticated() && !path.includes('index.html')) {
            // Optional: Auto-redirect to dashboard if already logged in
            // window.location.href = 'dashboard.html';
        }
    }
};

// Auto-run protection check on page load
Auth.checkProtection();