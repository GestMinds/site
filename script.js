const chatbot = document.getElementById("gestmindsAssist");
const chatbotToggle = chatbot.querySelector(".chatbot-toggle");
const chatbotClose = chatbot.querySelector(".chatbot-header-close");
const chatbotWindow = chatbot.querySelector(".chatbot-window");
const messages = document.getElementById("chatMessages");
const form = document.getElementById("chatForm");
const input = document.getElementById("chatInput");
const progressBar = document.getElementById("chatProgressBar");
const progressText = document.getElementById("chatProgressText");

const WHATSAPP = "5587981454634";

const lead = {
    objective: "",
    segment: "",
    problem: "",
    solution: "",
    name: "",
    company: "",
    whatsapp: ""
};

let currentStep = 1;

const steps = 5;

const openChatbot = () => {
    chatbot.classList.add("open");
    chatbotWindow.setAttribute("aria-hidden", "false");

    setTimeout(() => {
        input.focus();
    }, 250);
};

const closeChatbot = () => {
    chatbot.classList.remove("open");
    chatbotWindow.setAttribute("aria-hidden", "true");
};

chatbotToggle.addEventListener("click", () => {
    chatbot.classList.contains("open")
        ? closeChatbot()
        : openChatbot();
});

chatbotClose.addEventListener("click", closeChatbot);

const scrollBottom = () => {
    messages.scrollTo({
        top: messages.scrollHeight,
        behavior: "smooth"
    });
};

const updateProgress = () => {
    const percentage = (currentStep / steps) * 100;

    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${currentStep} de ${steps}`;
};

const addMessage = (text, type = "bot") => {
    const element = document.createElement("div");

    element.className = `chat-message ${type}`;

    element.innerHTML = `
        <div class="message-content">${text}</div>
        <span class="message-time">Agora</span>
    `;

    messages.appendChild(element);

    scrollBottom();
};

const showTyping = () => {
    const element = document.createElement("div");

    element.className = "chat-message bot chatbot-typing";

    element.innerHTML = `
        <div class="message-content">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    messages.appendChild(element);

    scrollBottom();

    return element;
};

const addOptions = (options, callback) => {
    const container = document.createElement("div");

    container.className = "chatbot-option-group";

    options.forEach((option) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "chatbot-option";
        button.textContent = option.label;

        button.addEventListener("click", () => {
            container.remove();

            addMessage(option.label, "user");

            callback(option.value);
        });

        container.appendChild(button);
    });

    messages.appendChild(container);

    scrollBottom();
};

const bot = (text, delay = 650) => {
    const typing = showTyping();

    return new Promise((resolve) => {
        setTimeout(() => {
            typing.remove();
            addMessage(text);
            resolve();
        }, delay);
    });
};

const startChat = async () => {
    await bot(
        "Olá. Sou o GestMinds Assist, o consultor digital da GestMinds."
    );

    await bot(
        "Vou fazer algumas perguntas rápidas para entender o momento da sua empresa e indicar quais soluções podem fazer mais sentido."
    );

    addOptions(
        [
            {
                label: "Aumentar vendas",
                value: "vendas"
            },
            {
                label: "Automatizar processos",
                value: "automacao"
            },
            {
                label: "Desenvolver um sistema",
                value: "software"
            },
            {
                label: "Melhorar o marketing",
                value: "marketing"
            },
            {
                label: "Ainda não tenho certeza",
                value: "indefinido"
            }
        ],
        handleObjective
    );
};

const handleObjective = async (value) => {
    lead.objective = value;

    currentStep = 2;
    updateProgress();

    await bot(
        "Perfeito. Agora me conta um pouco sobre o seu negócio."
    );

    addOptions(
        [
            {
                label: "Comércio / Loja",
                value: "comercio"
            },
            {
                label: "Serviços",
                value: "servicos"
            },
            {
                label: "Saúde / Estética",
                value: "saude"
            },
            {
                label: "Tecnologia",
                value: "tecnologia"
            },
            {
                label: "Indústria",
                value: "industria"
            },
            {
                label: "Outro segmento",
                value: "outro"
            }
        ],
        handleSegment
    );
};

const handleSegment = async (value) => {
    lead.segment = value;

    currentStep = 3;
    updateProgress();

    await bot(
        "Entendi. Agora vamos identificar o principal obstáculo que sua empresa enfrenta atualmente."
    );

    let options = [];

    if (lead.objective === "vendas") {
        options = [
            {
                label: "Poucos clientes chegando",
                value: "aquisicao"
            },
            {
                label: "Muitos contatos, poucas vendas",
                value: "conversao"
            },
            {
                label: "Atendimento lento ou manual",
                value: "atendimento"
            },
            {
                label: "Não sei exatamente",
                value: "indefinido"
            }
        ];
    } else if (lead.objective === "automacao") {
        options = [
            {
                label: "Muitas tarefas manuais",
                value: "tarefas"
            },
            {
                label: "Processos desorganizados",
                value: "processos"
            },
            {
                label: "Atendimento",
                value: "atendimento"
            },
            {
                label: "Integração entre sistemas",
                value: "integracao"
            }
        ];
    } else if (lead.objective === "software") {
        options = [
            {
                label: "Preciso de um sistema interno",
                value: "interno"
            },
            {
                label: "Quero criar um SaaS",
                value: "saas"
            },
            {
                label: "Preciso de um aplicativo",
                value: "app"
            },
            {
                label: "Preciso de uma plataforma web",
                value: "web"
            }
        ];
    } else {
        options = [
            {
                label: "Baixa presença digital",
                value: "presenca"
            },
            {
                label: "Poucos leads",
                value: "leads"
            },
            {
                label: "Baixa conversão",
                value: "conversao"
            },
            {
                label: "Falta de estratégia",
                value: "estrategia"
            }
        ];
    }

    addOptions(options, handleProblem);
};

const handleProblem = async (value) => {
    lead.problem = value;

    currentStep = 4;
    updateProgress();

    await bot(
        "Ótimo. Com essas informações já consigo identificar algumas soluções que podem fazer sentido para o seu cenário."
    );

    const recommendation = getRecommendation();

    lead.solution = recommendation.title;

    const recommendationElement = document.createElement("div");

    recommendationElement.className = "chatbot-recommendation";

    recommendationElement.innerHTML = `
        <span class="chatbot-recommendation-label">
            Recomendação inicial
        </span>

        <strong>${recommendation.title}</strong>

        <p>${recommendation.description}</p>
    `;

    messages.appendChild(recommendationElement);

    scrollBottom();

    await bot(
        "Se quiser, posso registrar seu interesse e encaminhar essas informações para um de nossos especialistas."
    );

    currentStep = 5;
    updateProgress();

    showLeadForm();
};

const getRecommendation = () => {
    if (lead.objective === "software") {
        return {
            title: "Desenvolvimento de Software sob Medida",
            description:
                "Uma solução desenvolvida de acordo com a operação, objetivos e necessidades específicas da sua empresa."
        };
    }

    if (lead.objective === "automacao") {
        return {
            title: "Automação & Inteligência Artificial",
            description:
                "Automação de processos, integrações e agentes inteligentes para reduzir tarefas manuais e aumentar a eficiência."
        };
    }

    if (lead.objective === "marketing") {
        return {
            title: "Marketing & Performance",
            description:
                "Estratégia digital, posicionamento, tráfego pago e otimização da presença online para gerar novas oportunidades."
        };
    }

    if (lead.objective === "vendas") {
        return {
            title: "Aceleração de Vendas",
            description:
                "Uma combinação de aquisição, conversão, automação e tecnologia para criar uma operação comercial mais eficiente."
        };
    }

    return {
        title: "Solução Personalizada",
        description:
            "Seu cenário possui necessidades específicas. Uma análise personalizada pode definir a melhor combinação de tecnologia e marketing."
    };
};

const showLeadForm = () => {
    const container = document.createElement("div");

    container.className = "chatbot-lead-form";

    container.innerHTML = `
        <input
            type="text"
            placeholder="Seu nome"
            id="leadName"
            autocomplete="name"
        >

        <input
            type="text"
            placeholder="Nome da empresa"
            id="leadCompany"
            autocomplete="organization"
        >

        <input
            type="tel"
            placeholder="Seu WhatsApp"
            id="leadWhatsapp"
            autocomplete="tel"
        >

        <button type="button" class="chatbot-lead-submit">
            Solicitar análise
        </button>
    `;

    messages.appendChild(container);

    const submit = container.querySelector(".chatbot-lead-submit");

    submit.addEventListener("click", submitLead);

    scrollBottom();
};

const submitLead = async () => {
    const name = document.getElementById("leadName").value.trim();
    const company = document.getElementById("leadCompany").value.trim();
    const whatsapp = document.getElementById("leadWhatsapp").value.trim();

    if (!name || !company || !whatsapp) {
        return;
    }

    lead.name = name;
    lead.company = company;
    lead.whatsapp = whatsapp;

    document.querySelector(".chatbot-lead-form")?.remove();

    addMessage(`Meu nome é ${name}.`, "user");

    await bot(
        `Obrigado, ${name}. Já tenho uma visão inicial do seu cenário.`
    );

    await bot(
        "Vou preparar seu encaminhamento para um de nossos especialistas."
    );

    const message = encodeURIComponent(
        `Olá, tudo bem? Meu nome é ${lead.name} e sou da empresa ${lead.company}. Fiz uma análise pelo GestMinds Assist e gostaria de continuar o atendimento.

Objetivo: ${lead.objective}
Segmento: ${lead.segment}
Principal necessidade: ${lead.problem}
Solução indicada: ${lead.solution}

Meu WhatsApp: ${lead.whatsapp}`
    );

    const whatsappLink = document.createElement("a");

    whatsappLink.href = `https://wa.me/${WHATSAPP}?text=${message}`;
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener";
    whatsappLink.className = "chatbot-whatsapp-action";
    whatsappLink.textContent = "Continuar com um especialista";

    messages.appendChild(whatsappLink);

    scrollBottom();
};

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const value = input.value.trim();

    if (!value) {
        return;
    }

    addMessage(value, "user");

    input.value = "";

    bot(
        "Obrigado pela informação. Para este primeiro diagnóstico, recomendo selecionar uma das opções disponíveis acima."
    );
});

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        chatbot.classList.contains("open")
    ) {
        closeChatbot();
    }
});

startChat();

const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("gestminds-theme");

if (savedTheme === "light" || savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", savedTheme);
}

if (themeToggle) {
    const updateThemeButton = () => {
        const isLight =
            document.documentElement.getAttribute("data-theme") === "light";

        themeToggle.setAttribute(
            "aria-label",
            isLight ? "Ativar modo escuro" : "Ativar modo claro"
        );
    };

    themeToggle.addEventListener("click", () => {
        const currentTheme =
            document.documentElement.getAttribute("data-theme");

        const newTheme =
            currentTheme === "light" ? "dark" : "light";

        document.documentElement.setAttribute("data-theme", newTheme);

        localStorage.setItem("gestminds-theme", newTheme);

        updateThemeButton();
    });

    updateThemeButton();
}