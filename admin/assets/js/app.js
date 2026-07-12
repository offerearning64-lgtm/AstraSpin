/* AstraSpin Admin App */

window.addEventListener("DOMContentLoaded", () => {

    console.log("Starting AstraSpin Admin Panel...");

    if (window.AdminConfig) {
        console.log("Config Loaded");
    }

    // सभी modules load करें
    if (window.AdminConfig && window.AdminModuleLoader) {
        AdminModuleLoader.loadAll(AdminConfig.modules);
    }

    // Sidebar buttons
    const buttons = document.querySelectorAll("[data-page]");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const page = button.dataset.page;

            if (
                window.AdminModules &&
                AdminModules[page] &&
                typeof AdminModules[page].init === "function"
            ) {
                AdminModules[page].init();
            } else if (window.AdminRouter) {
                AdminRouter.go(page);
            }

        });

    });

    // Default page
    if (
        window.AdminModules &&
        AdminModules.dashboard &&
        typeof AdminModules.dashboard.init === "function"
    ) {
        AdminModules.dashboard.init();
    }

    console.log("Admin Panel Ready");

});
