/* AstraSpin Admin App */

window.addEventListener("DOMContentLoaded", () => {
    console.log("Starting AstraSpin Admin Panel...");

    if (window.AdminConfig) {
        console.log("Config Loaded");
    }

    if (window.AdminRouter) {
        AdminRouter.go("dashboard");
    }

    console.log("Admin Panel Ready");
});
