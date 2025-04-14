const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = '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'; // logo ira expirar e precisara de outro token do https://openrouter.ai/
const HTTP_REFERER = 'https://www.viniciusdev.com';
const X_TITLE = 'viniciusdev';
const MODEL = 'deepseek/deepseek-r1:free';

const messageHistory = []; // Cache para armazenar as últimas mensagens

async function sendMessage() {
    const inputField = document.getElementById('userInput');
    const responseDiv = document.getElementById('response');
    const message = inputField.value.trim();

    if (!message) {
        responseDiv.innerHTML =
            '<div class="alert alert-warning">Qual sua dúvida?</div>';
        inputField.focus();
        return;
    }

    responseDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="spinner-border text-primary me-2" role="status"></div>
            <span>Carregando resposta...</span>
        </div>
    `;

    // Adiciona a nova mensagem ao histórico
    messageHistory.push({ role: 'user', content: message });

    // Formata o histórico como contexto
    const context = messageHistory
        .map((msg, index) => `Mensagem ${index + 1} (${msg.role}): ${msg.content}`)
        .join('\n');

    const messagesToSend = [
        {
            role: 'system',
            content: 'Você é um assistente que responde com base no histórico fornecido abaixo. Use apenas as informações relevantes do histórico para responder.',
        },
        {
            role: 'user',
            content: `Aqui está o histórico de mensagens para contexto:\n\n${context}\n\nAgora, responda à última mensagem.`,
        },
    ];

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'HTTP-Referer': HTTP_REFERER,
                'X-Title': X_TITLE,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL,
                messages: messagesToSend,
            }),
        });

        const data = await res.json();

        const markdownText =
            data?.choices?.[0]?.message?.content || 'Erro, sem resposta!!! ⚠️';
        responseDiv.innerHTML = marked.parse(markdownText);
    } catch (err) {
        responseDiv.innerHTML = `
            <div class="alert alert-danger">
                Error: ${err.message}
            </div>
        `;
    }
}

// Enviar ao pressionar Enter
document.getElementById('userInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});
