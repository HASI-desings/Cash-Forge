/**
 * CashForge Dashboard Logic
 * Initializes user data display, renders investment plans, and controls the promo slider.
 * Dependencies: config.js, state.js, db.js, finance.js
 */

document.addEventListener('DOMContentLoaded', initDashboard);

// --- 1. Initialization and Data Load ---
async function initDashboard() {
    // Auth.checkProtection() is run by auth.js globally, ensuring user is logged in.
    
    // 1. Render Investment Plans using live data from the DB (or cached CONFIG data)
    await renderPlans();

    // 2. Start Promo Slider
    initSlider();

    // 3. Update the UI balance (Ensures initial render matches live data)
    // Note: State.bind handles automatic updates, this just forces the initial value.
    State.refresh();
}


// --- 2. Render Investment Plans ---
async function renderPlans() {
    const container = document.getElementById('plans-container');
    if (!container) return;
    
    // Fetch plans from the database (or cache, handled by DB.getPlansData)
    const allPlans = await DB.getPlansData();
    
    let html = '';
    
    // Only display the first 3 plans on the dashboard view
    const plansToShow = allPlans.slice(0, 3); 

    plansToShow.forEach(plan => {
        const dailyIncomeFormatted = CONFIG.formatCurrency(plan.daily_income);
        const priceFormatted = CONFIG.formatCurrency(plan.price);

        html += `
        <div class="white-card p-5 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform" onclick="window.location.href='packages.html'">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800 font-bold text-lg shadow-sm">
                    ${plan.id}
                </div>
                <div>
                    <h3 class="font-bold text-base text-slate-900 leading-tight">${plan.name}</h3>
                    <p class="text-xs text-slate-500 mt-1">Daily: <span class="font-bold text-slate-700">${CONFIG.CURRENCY_SYMBOL} ${dailyIncomeFormatted}</span></p>
                </div>
            </div>
            <div class="text-right">
                <div class="font-bold text-lg text-slate-900">${CONFIG.CURRENCY_SYMBOL} ${priceFormatted}</div>
                <div class="flex justify-end mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
        `;
    });
    container.innerHTML = html;
}


// --- 3. Auto-Sliding Promo Banner Logic ---
function initSlider() {
    const track = document.getElementById('slider-track');
    const dots = document.querySelectorAll('.dot');
    if (!track || dots.length === 0) return; 

    let currentSlide = 0;
    const totalSlides = dots.length;

    function updateSlider() {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
    }

    // Start auto-slide cycle
    setInterval(nextSlide, 3500); 
}