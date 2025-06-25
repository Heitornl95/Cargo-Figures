// CONFIGURAÇÃO - SUBSTITUA PELA SUA URL DO GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzhhwbD2P--DCfsVAj92nRHSmW5K9cxlJxMbsR-wN5UpMdhoIspdH8ShtYdlP0gE8ilCQ/exec';

class CargoApp {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadCurrentData();
    }

    initializeElements() {
        this.form = document.getElementById('cargoForm');
        this.loadDataBtn = document.getElementById('loadDataBtn');
        this.updateDataBtn = document.getElementById('updateDataBtn');
        this.generateReportBtn = document.getElementById('generateReportBtn');
        this.quickStatusBtn = document.getElementById('quickStatusBtn');
        this.loading = document.getElementById('loading');
        this.status = document.getElementById('status');
        
        // Summary elements
        this.totalLoaded = document.getElementById('totalLoaded');
        this.totalBalance = document.getElementById('totalBalance');
        this.capacity = document.getElementById('capacity');
    }

    attachEventListeners() {
        this.loadDataBtn.addEventListener('click', () => this.loadCurrentData());
        this.updateDataBtn.addEventListener('click', () => this.updateData());
        this.generateReportBtn.addEventListener('click', () => this.generateReport());
        this.quickStatusBtn.addEventListener('click', () => this.quickStatus());
        
        // Auto-calculate summary when inputs change
        this.form.addEventListener('input', () => this.updateSummary());
    }

    showLoading(show = true) {
        this.loading.classList.toggle('show', show);
    }

    updateStatus(message, type = 'default') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
    }

    async loadCurrentData() {
        this.showLoading(true);
        this.updateStatus('Loading current data...', 'loading');
        
        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?function=getCurrentData`);
            const data = await response.json();
            
            // Populate form with current data
            document.getElementById('vesselName').value = data.vesselName || '';
            document.getElementById('voyageNumber').value = data.voyageNumber || '';
            document.getElementById('planningTime').value = data.planningTime || '';
            document.getElementById('planningHolds').value = data.planningHolds || '';
            
            document.getElementById('hold1Loaded').value = data.hold1Loaded || 0;
            document.getElementById('hold1Balance').value = data.hold1Balance || 0;
            document.getElementById('hold2Loaded').value = data.hold2Loaded || 0;
            document.getElementById('hold2Balance').value = data.hold2Balance || 0;
            document.getElementById('hold3Loaded').value = data.hold3Loaded || 0;
            document.getElementById('hold3Balance').value = data.hold3Balance || 0;
            document.getElementById('hold4Loaded').value = data.hold4Loaded || 0;
            document.getElementById('hold4Balance').value = data.hold4Balance || 0;
            document.getElementById('hold5Loaded').value = data.hold5Loaded || 0;
            document.getElementById('hold5Balance').value = data.hold5Balance || 0;
            
            document.getElementById('etcDate').value = data.etcDate || '';
            document.getElementById('etcTime').value = data.etcTime || '';
            
            this.updateSummary();
            this.updateStatus('Data loaded successfully', 'success');
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.updateStatus('Error loading data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async updateData() {
        if (!this.form.checkValidity()) {
            this.form.reportValidity();
            return;
        }

        this.showLoading(true);
        this.updateStatus('Updating data...', 'loading');
        
        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                this.updateStatus('Data updated successfully!', 'success');
                
                // Show success notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Cargo Data Updated', {
                        body: 'Your cargo data has been updated successfully!',
                        icon: 'icon-192.png'
                    });
                }
            } else {
                throw new Error(result.message);
            }
            
        } catch (error) {
            console.error('Error updating data:', error);
            this.updateStatus('Error updating data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async generateReport() {
        this.showLoading(true);
        this.updateStatus('Generating report...', 'loading');
        
        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?function=sendReportToWhatsApp`);
            const result = await response.text();
            
            this.updateStatus('Report sent to WhatsApp!', 'success');
            
        } catch (error) {
            console.error('Error generating report:', error);
            this.updateStatus('Error generating report', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async quickStatus() {
        this.showLoading(true);
        this.updateStatus('Sending quick status...', 'loading');
        
        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?function=sendQuickStatus`);
            const result = await response.text();
            
            this.updateStatus('Quick status sent!', 'success');
            
        } catch (error) {
            console.error('Error sending quick status:', error);
            this.updateStatus('Error sending quick status', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    updateSummary() {
        const holds = [
            { loaded: 'hold1Loaded', balance: 'hold1Balance' },
            { loaded: 'hold2Loaded', balance: 'hold2Balance' },
            { loaded: 'hold3Loaded', balance: 'hold3Balance' },
            { loaded: 'hold4Loaded', balance: 'hold4Balance' },
            { loaded: 'hold5Loaded', balance: 'hold5Balance' }
        ];

        let totalLoaded = 0;
        let totalBalance = 0;

        holds.forEach(hold => {
            const loaded = parseInt(document.getElementById(hold.loaded).value) || 0;
            const balance = parseInt(document.getElementById(hold.balance).value) || 0;
            
            totalLoaded += loaded;
            totalBalance += balance;
        });

        const capacity = totalBalance > 0 ? Math.round((totalLoaded / totalBalance) * 100) : 0;

        this.totalLoaded.textContent = `${totalLoaded} tons`;
        this.totalBalance.textContent = `${totalBalance} tons`;
        this.capacity.textContent = `${capacity}%`;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CargoApp();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});