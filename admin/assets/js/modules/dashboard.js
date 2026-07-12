/* AstraSpin Admin Dashboard Module */

window.AdminModules = window.AdminModules || {};

AdminModules.dashboard = {

    init() {

        const content = document.getElementById("admin-content");

        if (content) {
            content.innerHTML = `
                <h2>Dashboard</h2>
                <p>Welcome to AstraSpin Admin Panel.</p>
                <p>System is ready.</p>
            `;
        }

        console.log("Dashboard Module Initialized");
    }
};
