document.addEventListener("DOMContentLoaded", function () {
    const logo = document.getElementById("LogoP");
    const modal = document.getElementById("loginModal");
    const cerrar = document.getElementById("modalCerrar");
    const btn = document.getElementById("loginBtn");
    const user = document.getElementById("loginUser");
    const pass = document.getElementById("loginPass");
    const token = document.getElementById("loginToken");
    const error = document.getElementById("loginError");

    if (!logo || !modal) return;

    logo.style.cursor = "pointer";

    logo.addEventListener("click", function (e) {
        e.stopPropagation();
        modal.style.display = "flex";
        user.value = "";
        pass.value = "";
        token.value = "";
        error.textContent = "";
        user.focus();
    });

    function cerrarModal() { modal.style.display = "none"; }

    if (cerrar) cerrar.addEventListener("click", cerrarModal);
    modal.addEventListener("click", function (e) {
        if (e.target === modal) cerrarModal();
    });

    btn.addEventListener("click", function () {
        const u = user.value.trim();
        const p = pass.value.trim();
        const t = token.value.trim();
        if (!t) {
            error.textContent = "Ingresá tu token de GitHub.";
            token.focus();
            return;
        }
        if (u === "Admin1" && p === "bocalomas1B*") {
            sessionStorage.setItem("gh_token", t);
            window.location.href = "./admin.html";
        } else {
            error.textContent = "Usuario o contraseña incorrectos.";
            user.value = "";
            pass.value = "";
            user.focus();
        }
    });

    user.addEventListener("keydown", function (e) {
        if (e.key === "Enter") pass.focus();
    });
    pass.addEventListener("keydown", function (e) {
        if (e.key === "Enter") token.focus();
    });
    token.addEventListener("keydown", function (e) {
        if (e.key === "Enter") btn.click();
    });
});
