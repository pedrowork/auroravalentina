// Configuração do Google Calendar API
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events'; // 'https://www.googleapis.com/auth/calendar';

// Variáveis globais
let tokenClient;
let gapiInited = false;
let gisInited = false;
let isAuthorized = false;

// Estado do agendamento
let agendamentosOcupados = new Set();

// Utilidades para aguardar carregamento das APIs do Google (até 10s)
async function ensureGapiLoaded(timeoutMs = 10000) {
    const start = Date.now();
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (window.gapi && typeof window.gapi.load === 'function') {
                clearInterval(interval);
                resolve(true);
            } else if (Date.now() - start > timeoutMs) {
                clearInterval(interval);
                resolve(false);
            }
        }, 100);
    });
}

async function ensureGISLoaded(timeoutMs = 10000) {
    const start = Date.now();
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (window.google && window.google.accounts && window.google.accounts.oauth2) {
                clearInterval(interval);
                resolve(true);
            } else if (Date.now() - start > timeoutMs) {
                clearInterval(interval);
                resolve(false);
            }
        }, 100);
    });
}

// Elementos DOM
const form = document.getElementById('agendamentoForm');
const dataInput = document.getElementById('dataAgendamento');
const horarioSelect = document.getElementById('horarioAgendamento');
const statusInfo = document.getElementById('statusInfo');
const successMessage = document.getElementById('successMessage');
const whatsappBtn = document.getElementById('whatsappBtn');

// Configurar data mínima (amanhã)
function configurarDataMinima() {
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    dataInput.min = amanha.toISOString().split('T')[0];
}

// Gerar horários disponíveis
function gerarHorarios() {
    const horarios = [];
    
    // Horários da manhã: 09:00 às 11:00
    for (let hora = 9; hora < 11; hora++) {
        for (let minuto = 0; minuto < 60; minuto += 10) {
            const horaFormatada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
            horarios.push(horaFormatada);
        }
    }
    
    // Horários da tarde: 14:00 às 17:00
    for (let hora = 14; hora < 17; hora++) {
        for (let minuto = 0; minuto < 60; minuto += 10) {
            const horaFormatada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
            horarios.push(horaFormatada);
        }
    }
    
    return horarios;
}

// Verificar se horário está disponível
function verificarDisponibilidade(data, horario) {
    const chaveAgendamento = `${data}_${horario}`;
    return !agendamentosOcupados.has(chaveAgendamento);
}

// Atualizar opções de horário
function atualizarHorarios() {
    const dataSelecionada = dataInput.value;
    horarioSelect.innerHTML = '<option value="">Selecione um horário</option>';
    
    if (!dataSelecionada) {
        statusInfo.style.display = 'none';
        return;
    }
    
    const horarios = gerarHorarios();
    let horariosDisponiveis = 0;
    
    horarios.forEach(horario => {
        const option = document.createElement('option');
        option.value = horario;
        option.textContent = horario;
        
        if (verificarDisponibilidade(dataSelecionada, horario)) {
            horariosDisponiveis++;
        } else {
            option.disabled = true;
            option.textContent += ' (Ocupado)';
        }
        
        horarioSelect.appendChild(option);
    });
    
    // Atualizar status
    if (horariosDisponiveis > 0) {
        statusInfo.className = 'status-info disponivel';
        statusInfo.textContent = `✅ ${horariosDisponiveis} horários disponíveis nesta data`;
        statusInfo.style.display = 'block';
    } else {
        statusInfo.className = 'status-info indisponivel';
        statusInfo.textContent = '❌ Nenhum horário disponível nesta data';
        statusInfo.style.display = 'block';
    }
}

// Configuração inicial do Google API
async function initializeGapi() {
    await window.gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await window.gapi.client.init({
        apiKey: CONFIG.GOOGLE_API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

function initializeGis() {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: '', // definido na autorização
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        console.log('Google APIs inicializadas com sucesso');
        verificarStatusAPIs();
    }
}

// Autorizar acesso ao Google Calendar
function handleAuthClick() {
    if (!tokenClient) {
        alert('Serviço de identidade do Google ainda não carregou. Aguarde alguns segundos e tente novamente.');
        return;
    }
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            console.error('Erro na autorização:', resp);
            alert('Erro na autorização. Tente novamente.');
            return;
        }
        isAuthorized = true;
        verificarStatusAPIs();
        await carregarAgendamentos();
    };

    if (window.gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
}

// Carregar agendamentos existentes do Google Calendar
async function carregarAgendamentos() {
    try {
        const request = {
            'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 100,
            'orderBy': 'startTime'
        };

        const response = await window.gapi.client.calendar.events.list(request);
        const eventos = response.result.items;

        agendamentosOcupados.clear();

        eventos.forEach(evento => {
            if (evento.summary && evento.summary.includes('[Agendamento WhatsApp]')) {
                const inicio = new Date(evento.start.dateTime);
                const data = inicio.toISOString().split('T')[0];
                const horario = inicio.toTimeString().substring(0, 5);
                agendamentosOcupados.add(`${data}_${horario}`);
            }
        });

        atualizarHorarios();
    } catch (err) {
        console.error('Erro ao carregar agendamentos:', err);
    }
}

// Criar evento no Google Calendar
async function criarEventoCalendar(nome, parentesco, data, horario) {
    const dataHora = new Date(`${data}T${horario}:00`);
    const dataFim = new Date(dataHora.getTime() + 30 * 60000); // 30 minutos depois

    const evento = {
        'summary': `[Agendamento WhatsApp] ${nome}`,
        'description': `Chamada de vídeo agendada\nNome: ${nome}\nParentesco: ${parentesco}\nPlataforma: WhatsApp`,
        'start': {
            'dateTime': dataHora.toISOString(),
            'timeZone': CONFIG.TIMEZONE
        },
        'end': {
            'dateTime': dataFim.toISOString(),
            'timeZone': CONFIG.TIMEZONE
        },
        'reminders': {
            'useDefault': false,
            'overrides': [
                {'method': 'popup', 'minutes': 15},
                {'method': 'email', 'minutes': 60}
            ]
        }
    };

    try {
        const request = window.gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': evento
        });

        const response = await request;
        return response.result;
    } catch (err) {
        console.error('Erro ao criar evento:', err);
        throw err;
    }
}

// Submissão do formulário
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const dados = {
        nome: formData.get('nomeCompleto'),
        parentesco: formData.get('grauParentesco'),
        data: formData.get('dataAgendamento'),
        horario: formData.get('horarioAgendamento'),
        email: formData.get('emailContato') || undefined
    };

    // Validações
    if (!dados.nome || !dados.parentesco || !dados.data || !dados.horario) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    if (!verificarDisponibilidade(dados.data, dados.horario)) {
        alert('Este horário não está mais disponível. Por favor, escolha outro.');
        atualizarHorarios();
        return;
    }

    // Adicionar loading
    const submitBtn = document.getElementById('agendarBtn');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        // Verificar se está autorizado
        if (!isAuthorized) {
            alert('É necessário autorizar o acesso ao Google Calendar para continuar.');
            adicionarBotaoAutorizacao();
            return;
        }

        // Criar evento no Google Calendar
        await criarEventoCalendar(dados.nome, dados.parentesco, dados.data, dados.horario);

        // Marcar horário como ocupado
        agendamentosOcupados.add(`${dados.data}_${dados.horario}`);

        // Mostrar mensagem de sucesso
        form.style.display = 'none';
        successMessage.style.display = 'block';

        // Configurar botão do WhatsApp
        const mensagemWhatsApp = encodeURIComponent(
            `Olá! Acabei de agendar uma chamada de vídeo.\n\n` +
            `📅 Data: ${new Date(dados.data).toLocaleDateString('pt-BR')}\n` +
            `🕐 Horário: ${dados.horario}\n` +
            `👤 Nome: ${dados.nome}\n` +
            `👥 Parentesco: ${dados.parentesco}\n\n` +
            `Aguardo o contato!`
        );

        whatsappBtn.onclick = () => {
            window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${mensagemWhatsApp}`, '_blank');
        };

        // Atualizar status
        statusInfo.className = 'status-info agendado';
        statusInfo.textContent = '✅ Agendamento confirmado!';

    } catch (error) {
        console.error('Erro ao agendar:', error);
        alert('Ocorreu um erro ao realizar o agendamento. Tente novamente.');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Adicionar botão de autorização do Google
function adicionarBotaoAutorizacao() {
    if (document.getElementById('autorizeBtn')) return;
    
    const statusContainer = document.querySelector('.status-container');
    const botaoAutorizar = document.createElement('button');
    botaoAutorizar.id = 'autorizeBtn';
    botaoAutorizar.type = 'button';
    botaoAutorizar.className = 'btn-agendar';
    botaoAutorizar.innerHTML = '🔐 Autorizar Google Calendar';
    botaoAutorizar.style.marginBottom = '20px';
    botaoAutorizar.onclick = handleAuthClick;
    
    statusContainer.parentNode.insertBefore(botaoAutorizar, statusContainer);
}

// Verificar status de inicialização das APIs
function verificarStatusAPIs() {
    const statusElement = document.getElementById('statusInfo');
    
    if (!gapiInited || !gisInited) {
        statusElement.className = 'status-info indisponivel';
        statusElement.textContent = '⚠️ Carregando APIs do Google...';
        statusElement.style.display = 'block';
        return;
    }
    
    if (!isAuthorized) {
        statusElement.className = 'status-info indisponivel';
        statusElement.textContent = '🔐 Autorização necessária para acessar o Google Calendar';
        statusElement.style.display = 'block';
        adicionarBotaoAutorizacao();
        return;
    }
    
    statusElement.style.display = 'none';
    const botaoAutorizar = document.getElementById('autorizeBtn');
    if (botaoAutorizar) {
        botaoAutorizar.remove();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    configurarDataMinima();
    dataInput.addEventListener('change', atualizarHorarios);
    form.addEventListener('submit', handleFormSubmit);
    
    // Verificar status inicial
    verificarStatusAPIs();
    
    // Tentar carregar as APIs do Google de forma resiliente
    const gapiOk = await ensureGapiLoaded();
    if (gapiOk) {
        try { await initializeGapi(); } catch (e) { console.error('Falha ao inicializar gapi:', e); }
    } else {
        console.warn('Google API não carregada (timeout)');
    }

    const gisOk = await ensureGISLoaded();
    if (gisOk) {
        try { initializeGis(); } catch (e) { console.error('Falha ao inicializar GIS:', e); }
    } else {
        console.warn('Google Identity Services não carregado (timeout)');
    }
});

// Simular agendamentos para demonstração (remover em produção)
function simularAgendamentos() {
    // Adicionar alguns horários ocupados para demonstração
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    const dataAmanha = amanha.toISOString().split('T')[0];
    
    agendamentosOcupados.add(`${dataAmanha}_09:00`);
    agendamentosOcupados.add(`${dataAmanha}_09:10`);
    agendamentosOcupados.add(`${dataAmanha}_14:00`);
}

// Inicializar simulação (remover em produção quando integrar com Google Calendar)
// simularAgendamentos();
