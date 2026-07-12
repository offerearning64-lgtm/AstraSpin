/* AstraSpin Admin Module Loader */

window.AdminModuleLoader = {

    load(moduleName) {

        const script = document.createElement("script");

        script.src = `assets/js/modules/${moduleName}.js`;

        script.onload = () => {
            console.log(moduleName + " module loaded");
        };

        script.onerror = () => {
            console.log(moduleName + " module failed");
        };

        document.body.appendChild(script);
    },

    loadAll(modules) {
        modules.forEach(moduleName => {
            this.load(moduleName);
        });
    }
};

console.log("Module Loader Ready");
