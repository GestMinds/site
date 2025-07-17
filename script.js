// Efeito digitando no subtítulo
const texto = "Landing pages e sites personalizados para pequenos negócios que querem crescer online.";
const subtitulo = document.getElementById('subtitulo');
let index = 0;
let apagando = false;

function digitar() {
  if (!apagando && index < texto.length) {
    subtitulo.innerHTML += texto[index];
    index++;
    setTimeout(digitar, 90);
  } else if (!apagando && index === texto.length) {
    // Espera um pouco antes de começar a apagar
    apagando = true;
    setTimeout(digitar, 1500);
  } else if (apagando && index > 0) {
    subtitulo.innerHTML = texto.substring(0, index - 1);
    index--;
    setTimeout(digitar, 30); // apagar mais rápido
  } else {
    // Reinicia a digitação
    apagando = false;
    setTimeout(digitar, 500);
  }
}

digitar();


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
