/* js/controllers/history.js */
/* js/controllers/history.js */
import { supabase } from '../config/supabase.js'; // CORRECT PATH: from js/controllers up to js/config
import { supabase } from '../config/supabase.js';
import { getCurrentUser } from '../services/auth.js'; // Assumed function name
import { formatCurrency, formatDate, getStatusBadge } from '../utils/formatters.js';

const HistoryController = {
    
    // --- 1. INITIALIZE ---
    async init() {
        // Check if user is logged in
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            window.location.href = 'login.html';
            return;
        }

        // Load Data for current user
        this.loadTransactions(sessionUser.id);
        
        // Attach Filter Listeners
        this.attachFilters();
    },

    // --- 2. FETCH DATA FROM SUPABASE ---
    async loadTransactions(userId) {
        const container = document.getElementById('history-container');
        if(!container) return; // Guard clause

        // Show loading state
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#999;">Loading history...</div>';

        try {
            // Select all columns from 'transactions' table
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }); // Newest first

            if (error) throw error;

            this.renderList(data || []);

        } catch (err) {
            console.error(err);
            container.innerHTML = '<div style="text-align:center; color:red;">Failed to load transactions.</div>';
        }
    },

    // --- 3. RENDER LIST ---
    renderList(transactions) {
        const container = document.getElementById('history-container');
        const emptyState = document.getElementById('empty-state');
        container.innerHTML = '';

        // Handle Empty State
        if (transactions.length === 0) {
            if(emptyState) emptyState.style.display = 'block';
            return;
        }

        if(emptyState) emptyState.style.display = 'none';

        // Loop through transactions
        transactions.forEach(txn => {
            // Determine Styling based on transaction type
            let icon = 'activity';
            let colorClass = 'txn-earning'; // Default yellow
            let amountClass = 'amt-plus';
            let amountPrefix = '+';

            if (txn.type === 'deposit') {
                icon = 'arrow-down-circle';
                colorClass = 'txn-deposit'; // Green
            } else if (txn.type === 'withdraw') {
                icon = 'arrow-up-circle';
                colorClass = 'txn-withdraw'; // Red
                amountClass = 'amt-minus';
                amountPrefix = '-';
            }

            // Create the HTML Element
            const div = document.createElement('div');
            div.className = `txn-item ${colorClass}`;
            div.setAttribute('data-type', txn.type); // Used for filtering

            div.innerHTML = `
                <div class="txn-left">
                    <div class="txn-icon"><i data-lucide="${icon}"></i></div>
                    <div class="txn-meta">
                        <h4 style="text-transform: capitalize;">${txn.type}</h4>
                        <span>${formatDate(txn.created_at)}</span>
                    </div>
                </div>
                <div class="txn-right">
                    <span class="txn-amount ${amountClass}">
                        ${amountPrefix} ${formatCurrency(txn.amount)}
                    </span>
                    ${getStatusBadge(txn.status)}
                </div>
            `;
            container.appendChild(div);
        });

        // Re-render icons (Lucide) since we injected new HTML
        if (window.lucide) {
            window.lucide.createIcons();
        }
    },

    // --- 4. FILTER LOGIC ---
    attachFilters() {
        // We expose this function globally so the HTML onclick="" attributes work
        window.filterList = (type) => {
            // 1. Update Tab UI (Active State)
            document.querySelectorAll('.filter-chip').forEach(c => {
                c.classList.remove('active');
                // Basic check to highlight the correct button
                if(c.innerText.toLowerCase().includes(type) || (type === 'all' && c.innerText === 'All')) {
                    c.classList.add('active');
                }
            });

            // 2. Filter DOM Elements
            const items = document.querySelectorAll('.txn-item');
            let visibleCount = 0;
            
            items.forEach(item => {
                const itemType = item.getAttribute('data-type');
                
                if (type === 'all' || itemType === type) {
                    item.style.display = 'flex';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            // 3. Toggle Empty State if filter matches nothing
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = (visibleCount === 0) ? 'block' : 'none';
            }
        };
    }
};

// Start the controller when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    HistoryController.init();
});

