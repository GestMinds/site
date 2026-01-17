async function loadPage(pageName) {
    const response = await fetch(`pages/${pageName}.html`);
    const html = await response.text();
    document.getElementById('main-content').innerHTML = html;
}

// Ao carregar o app, chama o dashboard por padrão
loadPage('dashboard');