// ==================== EFEITO DIGITANDO NO SUBTÍTULO ====================

// Criar dinamicamente o subtítulo no topo do .hero-content
const textoDigitado =
  "Landing pages e sites personalizados para pequenos negócios que querem crescer online.";
const heroContent = document.querySelector(".hero-content");

// Cria e adiciona o subtítulo dinamicamente
const subtitulo = document.createElement("h2");
subtitulo.id = "subtitulo";
heroContent.appendChild(subtitulo);

let index = 0;
let apagando = false;

function digitar() {
  if (!apagando && index < textoDigitado.length) {
    subtitulo.innerHTML += textoDigitado[index];
    index++;
    setTimeout(digitar, 90);
  } else if (!apagando && index === textoDigitado.length) {
    apagando = true;
    setTimeout(digitar, 1500);
  } else if (apagando && index > 0) {
    subtitulo.innerHTML = textoDigitado.substring(0, index - 1);
    index--;
    setTimeout(digitar, 30);
  } else {
    apagando = false;
    setTimeout(digitar, 500);
  }
}

digitar();

// ==================== MENU RESPONSIVO (opcional) ====================

const menuIcon = document.getElementById("menuIcon");
const navLinks = document.getElementById("navLinks");

menuIcon.addEventListener("click", () => {
  navLinks.classList.toggle("ativo");
});

// ==================== MODAL DE CONTATO (caso adicione depois) ====================

// Exemplo de estrutura funcional (sem HTML do modal por enquanto):
// const modal = document.getElementById("contatoModal");
// const btns = document.querySelectorAll(".cta, .bota-querer-site button");
// const fechar = document.querySelector(".fechar");

// btns.forEach(btn => {
//   btn.addEventListener("click", () => {
//     modal.style.display = "block";
//   });
// });

// fechar.addEventListener("click", () => {
//   modal.style.display = "none";
// });

// window.addEventListener("click", (e) => {
//   if (e.target === modal) {
//     modal.style.display = "none";
//   }
// });

// ==================== LOADER ====================

window.addEventListener("load", () => {
  document.querySelector(".overlay").style.display = "none";
  document.querySelector(".loader").style.display = "none";
});
