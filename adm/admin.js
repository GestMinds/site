const email = localStorage.getItem("usuarioEmail");

const admins = [
  "empresarialvitorbr@outlook.com",
  "ph0984596@gmail.com"
];

if (!admins.includes(email)) {
  alert("Acesso restrito.");
  window.location.href = "/dashboard/dashboard.html";
}
