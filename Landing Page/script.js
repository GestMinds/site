// Efeito digitando no subtítulo
const texto = "Landing pages e sites personalizados para pequenos negócios que querem crescer online.";
const subtitulo = document.getElementById('subtitulo');
let index = 0;

function digitar() {
  if (index < texto.length) {
    subtitulo.innerHTML += texto[index];
    index++;
    setTimeout(digitar, 60);
  } else {
    subtitulo.style.borderRight = 'none';
  }
}

window.onload = function () {
  digitar();
};

// Abrir modal de contato
const modal = document.getElementById("contatoModal");
const btns = document.querySelectorAll(".cta, .bota-querer-site button");
const fechar = document.querySelector(".fechar");

btns.forEach(btn => {
  btn.addEventListener("click", () => {
    modal.style.display = "block";
  });
});

fechar.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
