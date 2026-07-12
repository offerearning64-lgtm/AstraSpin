/* AstraSpin Admin Settings Module */

window.AdminModules = window.AdminModules || {};

AdminModules.settings = {

    init() {

        const content = document.getElementById("admin-content");

        if (content) {
            content.innerHTML = `
                <h2>Settings</h2>
                <p>Manage AstraSpin Admin settings.</p>
                <p>Security, ads and system options ready.</p>
            `;
        }

        console.log("Settings Module Initialized");
    }
};
