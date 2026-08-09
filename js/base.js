document.addEventListener("DOMContentLoaded", () => {
    const currentPage = document.body.dataset.page;

    document.querySelectorAll("[data-page]").forEach((link) => {
        link.classList.toggle("active", link.dataset.page === currentPage);
    });

    const toastElement = document.querySelector("#appToast");
    const toastMessage = document.querySelector("#toastMessage");

    document.querySelector("#btnLoginPlaceholder")?.addEventListener("click", () => {
        toastMessage.textContent = "El inicio de sesión será desarrollado en el Sprint 3.";
        bootstrap.Toast.getOrCreateInstance(toastElement).show();
    });
});
