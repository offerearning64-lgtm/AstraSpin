/* AstraSpin Admin Games Module */

window.AdminModules = window.AdminModules || {};

AdminModules.games = {

    init() {

        const content = document.getElementById("admin-content");

        if (content) {
            content.innerHTML = `
                <h2>Games Manager</h2>
                <p>Manage AstraSpin games here.</p>
                <p>Maximum Games: 5000</p>
            `;
        }

        console.log("Games Module Initialized");
    }
};
