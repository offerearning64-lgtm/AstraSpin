/* AstraSpin Admin Categories Module */

window.AdminModules = window.AdminModules || {};

AdminModules.categories = {

    init() {

        const content = document.getElementById("admin-content");

        if (content) {
            content.innerHTML = `
                <h2>Categories Manager</h2>
                <p>Create and manage game categories.</p>
                <p>Default Category: Arcade</p>
            `;
        }

        console.log("Categories Module Initialized");
    }
};
