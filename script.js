// ==================== INICIALIZAÇÃO SEGURA DO DOM ====================
document.addEventListener('DOMContentLoaded', () => {
  
  // ==================== EFEITO DIGITANDO NO SUBTÍTULO ====================
  const textoDigitado = "Landing pages e sites personalizados para pequenos negócios que querem crescer online.";
  const heroContent = document.querySelector(".hero-content");

  if (heroContent) {
    // Cria e adiciona o subtítulo dinamicamente
    const subtitulo = document.createElement("h2");
    subtitulo.id = "subtitulo";
    subtitulo.style.cssText = `
      color: var(--cor-hover);
      font-size: 1.3rem;
      font-weight: 500;
      margin-bottom: 1rem;
      min-height: 1.6rem;
      opacity: 0.9;
    `;
    
    // Insere o subtítulo após o h1
    const h1 = heroContent.querySelector('h1');
    if (h1) {
      h1.insertAdjacentElement('afterend', subtitulo);
    } else {
      heroContent.appendChild(subtitulo);
    }

    let index = 0;
    let apagando = false;

    function digitar() {
      try {
        if (!apagando && index < textoDigitado.length) {
          subtitulo.innerHTML += textoDigitado[index];
          index++;
          setTimeout(digitar, 90);
        } else if (!apagando && index === textoDigitado.length) {
          apagando = true;
          setTimeout(digitar, 2000);
        } else if (apagando && index > 0) {
          subtitulo.innerHTML = textoDigitado.substring(0, index - 1);
          index--;
          setTimeout(digitar, 40);
        } else {
          apagando = false;
          setTimeout(digitar, 800);
        }
      } catch (error) {
        console.error('Erro no efeito de digitação:', error);
      }
    }

    // Inicia o efeito após um pequeno delay
    setTimeout(digitar, 500);
  } else {
    console.warn('Elemento .hero-content não encontrado');
  }

  // ==================== MENU HAMBÚRGUER MODERNO ====================
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const navLinks = document.getElementById("navLinks");
  const navClose = document.getElementById("navClose");
  const navOverlay = document.getElementById("navOverlay");

  function openMenu() {
    navLinks.classList.add("show");
    navOverlay.classList.add("show");
    hamburgerMenu.classList.add("active");
    hamburgerMenu.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden"; // Previne scroll do body
  }

  function closeMenu() {
    navLinks.classList.remove("show");
    navOverlay.classList.remove("show");
    hamburgerMenu.classList.remove("active");
    hamburgerMenu.setAttribute("aria-expanded", "false");
    document.body.style.overflow = ""; // Restaura scroll do body
  }

  if (hamburgerMenu && navLinks) {
    // Abre o menu
    hamburgerMenu.addEventListener("click", (e) => {
      e.preventDefault();
      if (navLinks.classList.contains("show")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Fecha o menu com o botão X
    if (navClose) {
      navClose.addEventListener("click", (e) => {
        e.preventDefault();
        closeMenu();
      });
    }

    // Fecha o menu ao clicar no overlay
    if (navOverlay) {
      navOverlay.addEventListener("click", closeMenu);
    }

    // Fecha o menu ao clicar em um link
    const navLinksItems = navLinks.querySelectorAll('a');
    navLinksItems.forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Fecha o menu com a tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains("show")) {
        closeMenu();
      }
    });

    // Fecha o menu ao redimensionar a tela
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navLinks.classList.contains("show")) {
        closeMenu();
      }
    });
  } else {
    console.warn('Elementos do menu hambúrguer não encontrados');
  }

  // ==================== ANIMAÇÕES DE SCROLL ====================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, observerOptions);

  // Observa elementos para animação
  const elementsToAnimate = document.querySelectorAll('.card, .beneficio, .titulo-servicos');
  elementsToAnimate.forEach(el => {
    observer.observe(el);
  });

  // ==================== EFEITOS HOVER AVANÇADOS ====================
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });

  // ==================== SCROLL SUAVE PARA LINKS INTERNOS ====================
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80; // Compensa a navbar fixa
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==================== NAVBAR SCROLL EFFECT ====================
  let lastScrollTop = 0;
  const navbar = document.querySelector('.navbar');
  
  if (navbar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Adiciona/remove classe baseada no scroll
      if (scrollTop > 100) {
        navbar.style.background = 'linear-gradient(135deg, rgba(255, 81, 47, 0.95), rgba(221, 36, 118, 0.95))';
        navbar.style.backdropFilter = 'blur(15px)';
      } else {
        navbar.style.background = 'linear-gradient(135deg, var(--cor-secundaria), var(--cor-primaria))';
        navbar.style.backdropFilter = 'blur(10px)';
      }
      
      lastScrollTop = scrollTop;
    });
  }

  // ==================== PERFORMANCE OPTIMIZATION ====================
  // Debounce function para otimizar eventos de scroll/resize
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ==================== LOADING ANIMATION ====================
  const loadingElements = document.querySelectorAll('.hero-content, .card, .beneficio');
  loadingElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      el.style.transition = 'all 0.6s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, index * 100);
  });

  // ==================== TRATAMENTO DE ERROS GLOBAL ====================
  window.addEventListener('error', (e) => {
    console.error('Erro JavaScript:', e.error);
  });

  // ==================== FALLBACK PARA JAVASCRIPT DESABILITADO ====================
  // Adiciona classe no body para indicar que JS está funcionando
  document.body.classList.add('js-enabled');
  
  console.log('🚀 Site GestMinds carregado com sucesso!');
});

// ==================== LOADER REMOVAL ====================
window.addEventListener("load", () => {
  // Remove elementos de loading se existirem
  const overlay = document.querySelector(".overlay");
  const loader = document.querySelector(".loader");
  
  if (overlay) overlay.style.display = "none";
  if (loader) loader.style.display = "none";
  
  // Adiciona classe para indicar que a página foi totalmente carregada
  document.body.classList.add('page-loaded');
});

// ==================== UTILITÁRIOS GLOBAIS ====================
// Função para smooth scroll programático
window.smoothScrollTo = (element, offset = 80) => {
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

// Função para adicionar classe com delay
window.addClassWithDelay = (element, className, delay = 0) => {
  setTimeout(() => {
    if (element) element.classList.add(className);
  }, delay);
};
