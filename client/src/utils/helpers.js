// ============================================================
// HELPER UTILITIES
// ============================================================

/**
 * Validate email format
 */
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Generate a simple UUID
 */
export function generateId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Check password strength (min 6 chars)
 */
export function checkPasswordStrength(password) {
    if (!password || password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
}

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export const DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

/**
 * Format date to readable string
 */
export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Calculate rental days between two dates
 */
export function calculateRentalDays(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}

/**
 * Calculate rental total
 */
export function calculateRentalTotal(pricePerDay, days, quantity, securityDeposit) {
    const rentalFee = pricePerDay * days * quantity;
    const deposit = securityDeposit * quantity;
    return { rentalFee, deposit, total: rentalFee + deposit };
}

/**
 * Get rental status based on dates
 */
export function getRentalStatus(rentalEndDate, currentStatus) {
    if (currentStatus === 'Returned') return 'Returned';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(rentalEndDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays <= 1) return 'Pending Return';
    return 'Active';
}

/**
 * Get status badge color classes
 */
export function getStatusColor(status) {
    switch (status) {
        case 'Active': return 'bg-green-100 text-green-800';
        case 'Pending Return': return 'bg-yellow-100 text-yellow-800';
        case 'Overdue': return 'bg-red-100 text-red-800';
        case 'Returned': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

/**
 * Get stock status
 */
export function getStockStatus(availableQuantity) {
    if (availableQuantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (availableQuantity < 3) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Truncate text
 */
export function truncate(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}
