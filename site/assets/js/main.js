window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const vh = window.innerHeight;

    // 1. Efeito na Hero (Distanciamento e Blur)
    const hero = document.querySelector('.hero-section');
    if (scrollTop <= vh) {
        const p = scrollTop / vh;
        hero.style.transform = `scale(${1 - p * 0.15})`;
        hero.style.filter = `blur(${p * 20}px)`;
        hero.style.opacity = 1 - p;
    }

    // 2. Faixa Expansível e Scroll Horizontal
    const container = document.querySelector('.horizontal-scroll-container');
    const strip = document.querySelector('.expanding-strip');
    const wrapper = document.querySelector('.horizontal-wrapper');
    
    const cTop = container.offsetTop;
    const cHeight = container.offsetHeight;

    if (scrollTop >= cTop) {
        const progress = (scrollTop - cTop) / (cHeight - vh);

        // Fase A: Crescer a faixa (até 25% do scroll da seção)
        if (progress <= 0.25) {
            const widthProgress = progress / 0.25;
            strip.style.width = `${widthProgress * 100}vw`;
            wrapper.style.opacity = widthProgress;
            wrapper.style.transform = `translateX(0)`;
        } 
        // Fase B: Scroll Horizontal (após a faixa estar 100% aberta)
        else {
            strip.style.width = '100vw';
            wrapper.style.opacity = '1';
            const horizontalP = (progress - 0.25) / 0.75;
            wrapper.style.transform = `translateX(-${horizontalP * 300}vw)`;
        }
    }
});