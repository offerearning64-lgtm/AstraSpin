

/* AstraSpin Admin Router v11 */

window.AdminRouter = {

    current: "dashboard",

    go(moduleName) {

        this.current = moduleName;

        if (
            window.AdminModules &&
            AdminModules[moduleName] &&
            typeof AdminModules[moduleName].init === "function"
        ) {

            AdminModules[moduleName].init();

            console.log("Module loaded:", moduleName);

        } else {

            const content = document.getElementById("admin-content");

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
