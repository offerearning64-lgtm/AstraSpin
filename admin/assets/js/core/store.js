/* AstraSpin Admin Store */

window.AdminStore = {
    data: {},

    set(key, value) {
        this.data[key] = value;
        localStorage.setItem(
            "AstraSpin_" + key,
            JSON.stringify(value)
        );
    },

    get(key) {
        const saved = localStorage.getItem(
            "AstraSpin_" + key
        );

        if (saved) {
            this.data[key] = JSON.parse(saved);
        }

        return this.data[key];
    },

    remove(key) {
        delete this.data[key];
        localStorage.removeItem(
            "AstraSpin_" + key
        );
    }
};

console.log("Admin Store Loaded");
