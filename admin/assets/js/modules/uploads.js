/* AstraSpin Admin Uploads Module */

window.AdminModules = window.AdminModules || {};

AdminModules.uploads = {

    init() {

        const content = document.getElementById("admin-content");

        if (content) {
            content.innerHTML = `
                <h2>Uploads Manager</h2>
                <p>Upload and manage game files.</p>
                <p>Asset system ready.</p>
            `;
        }

        console.log("Uploads Module Initialized");
    }
};
