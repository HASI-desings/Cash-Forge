/* Formatters Utility - CashForge
   Centralized functions for text, number, and date formatting.
   
   Usage: 
   Formatters.currency(1234.5); // "1,234.50"
   Formatters.mask('Txyz12345abcd', 4, 4); // "Txyz...abcd"
*/

const Formatters = {
    
    // --- 1. CURRENCY ---
    // Converts 1234.5678 -> "1,234.57"
    currency(amount, currencySymbol = '') {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '0.00';
        }
        
        const val = parseFloat(amount).toFixed(2);
        // Add commas for thousands
        const parts = val.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        
        return (currencySymbol ? currencySymbol + ' ' : '') + parts.join(".");
    },

    // --- 2. DATES ---
    // Converts ISO String -> "Dec 14, 2025"
    date(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Converts ISO String -> "Dec 14, 10:30 AM"
    dateTime(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    },

    // --- 3. MASKING (Privacy) ---
    // Converts "rudy@example.com" -> "ru***@example.com"
    // Converts "Txyz123456abcd" -> "Txyz...abcd"
    maskWallet(address) {
        if (!address || address.length < 10) return address;
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    },

    maskEmail(email) {
        if (!email || !email.includes('@')) return email;
        const [name, domain] = email.split('@');
        if (name.length <= 3) return email; // Too short to mask
        return `${name.substring(0, 3)}***@${domain}`;
    },

    // --- 4. STATUS BADGES ---
    // Returns HTML string for status colors
    statusBadge(status) {
        const s = status ? status.toLowerCase() : 'unknown';
        let color = '#999';
        let bg = '#eee';

        if (s === 'completed' || s === 'success' || s === 'approved') {
            color = '#2ecc71'; // Green
            bg = '#eafaf1';
        } else if (s === 'pending' || s === 'processing') {
            color = '#f39c12'; // Orange
            bg = '#fef9e7';
        } else if (s === 'rejected' || s === 'failed') {
            color = '#e74c3c'; // Red
            bg = '#fdedec';
        }

        return `<span style="color:${color}; background:${bg}; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:bold; text-transform:uppercase;">${s}</span>`;
    }
};

// Expose globally
window.Formatters = Formatters;