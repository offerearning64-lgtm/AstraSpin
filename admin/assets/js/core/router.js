/* AstraSpin Admin Router */

window.AdminRouter = {
    current: "dashboard",

    go(moduleName) {
        this.current = moduleName;

        const content = document.getElementById("admin-content");

        if (window.AdminModules[moduleName] && typeof window.AdminModules[moduleName].init === "function") {
            window.AdminModules[moduleName].init();
            console.log("Module:", moduleName);
        } else {
            if (content) {
                content.innerHTML = `
                    <h2>${moduleName}</h2>
                    <p>${moduleName} module not found</p>
                `;
            }
            console.log("Module missing:", moduleName);
        }
    }
};

window.addEventListener("DOMContentLoaded", () => {
    AdminRouter.go("dashboard");
});
