/* AstraSpin Admin Games Module */

window.AdminModules = window.AdminModules || {};

AdminModules.games = {

    init() {

        const content = document.getElementById("admin-content");

        if (content) {
            content.innerHTML = `
                <div class="games-manager">
                    <h2>🎮 Games Manager</h2>
                    <p>Add and manage AstraSpin games.</p>

                    <div class="card">
                        <h3>Total Games</h3>
                        <p>0 Games Added</p>
                    </div>

                    <button class="btn btn-primary">
                        Add Game
                    </button>
                </div>
            `;
        }

        console.log("Games Module Initialized");
    }

};
