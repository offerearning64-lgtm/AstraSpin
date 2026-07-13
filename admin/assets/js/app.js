/* AstraSpin Admin App v11 */

window.addEventListener("DOMContentLoaded", () => {

    console.log("Starting AstraSpin Admin Panel...");

    // Check modules
    if (!window.AdminModules) {
        window.AdminModules = {};
    }

    console.log(
        "Available Modules:",
        Object.keys(window.AdminModules)
    );


    // Sidebar buttons
    const buttons = document.querySelectorAll("[data-page]");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const page = button.dataset.page;

            console.log("Opening module:", page);


            if (
                window.AdminModules &&
                AdminModules[page] &&
                typeof AdminModules[page].init === "function"
            ) {

                AdminModules[page].init();

                console.log(
                    "Module opened:",
                    page
                );

            } else if (window.AdminRouter) {

                AdminRouter.go(page);

            } else {

                console.log(
                    "Module missing:",
                    page
                );

            }

        });

    });


    // Default Dashboard
    if (
        window.AdminModules &&
        AdminModules.dashboard &&
        typeof AdminModules.dashboard.init === "function"
    ) {

        AdminModules.dashboard.init();

        console.log(
            "Dashboard loaded"
        );

    }


    console.log(
        "AstraSpin Admin Panel Ready"
    );

});
