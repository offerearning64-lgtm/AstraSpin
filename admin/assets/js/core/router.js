/* AstraSpin Admin Router */

window.AdminRouter = {
    current: "dashboard",

    go(moduleName) {
        this.current = moduleName;

        const content = document.getElementById("admin-content");

        if (content) {
            content.innerHTML = `
                <h2>${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}</h2>
                <p>${moduleName} module loaded.</p>
            `;
        }

        console.log("Module:", moduleName);
    }
};

window.addEventListener("DOMContentLoaded", () => {
    AdminRouter.go("dashboard");
});
