/* AstraSpin Admin Dashboard Module */

window.AdminModules = window.AdminModules || {};

AdminModules.dashboard = {

    init() {

        const content = document.getElementById("admin-content");

        if (!content) return;

        content.innerHTML = `
            <div class="dashboard">

                <h2>📊 Dashboard</h2>
                <p>Welcome to AstraSpin Admin Panel</p>

                <div class="stats-grid">

                    <div class="stat-card">
                        <h3>Total Games</h3>
                        <span>0</span>
                    </div>

                    <div class="stat-card">
                        <h3>Categories</h3>
                        <span>0</span>
                    </div>

                    <div class="stat-card">
                        <h3>Uploads</h3>
                        <span>0</span>
                    </div>

                    <div class="stat-card">
                        <h3>System</h3>
                        <span>Online</span>
                    </div>

                </div>

                <div class="dashboard-section">
                    <h3>Quick Overview</h3>

                    <ul>
                        <li>✅ Admin Panel Ready</li>
                        <li>✅ JavaScript Modules Loaded</li>
                        <li>✅ Router Working</li>
                        <li>✅ Foundation Complete</li>
                    </ul>
                </div>

            </div>
        `;

        console.log("Dashboard Loaded");

    }

};
