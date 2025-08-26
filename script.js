// Estado do agendamento
let agendamentosOcupados = new Set();

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

// Fluxo de OAuth removido (usamos Netlify Functions com Service Account)

// Função de carregamento via API removida

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

// Sem botão de autorização - backend cuida do acesso

function verificarStatusAPIs() {
    const statusElement = document.getElementById('statusInfo');
    statusElement.className = 'status-info agendado';
    statusElement.textContent = 'Selecione a data para consultar disponibilidade.';
    statusElement.style.display = 'block';
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    configurarDataMinima();
    dataInput.addEventListener('change', async () => {
        if (dataInput.value) {
            await carregarAgendamentosDaData(dataInput.value);
        }
        atualizarHorarios();
    });
    form.addEventListener('submit', handleFormSubmit);
    
    // Verificar status inicial
    verificarStatusAPIs();
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
