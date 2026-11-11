const loginPanel = document.getElementById("login");
const registerPanel = document.getElementById("register");
const loginButton = document.getElementById("loginbtn");
const registerButton = document.getElementById("registerbtn");

function showAuthView(view) {
  const isRegisterView = view === "register";
  loginPanel.style.left = isRegisterView ? "-520px" : "4px";
  registerPanel.style.right = isRegisterView ? "5px" : "-520px";
  loginPanel.style.opacity = isRegisterView ? "0" : "1";
  registerPanel.style.opacity = isRegisterView ? "1" : "0";
  loginButton.classList.toggle("white-btn", !isRegisterView);
  registerButton.classList.toggle("white-btn", isRegisterView);
}

document.querySelectorAll("[data-auth-view]").forEach((control) => {
  control.addEventListener("click", (event) => {
    event.preventDefault();
    showAuthView(control.dataset.authView);
  });
});
