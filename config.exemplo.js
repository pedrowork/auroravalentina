// Configurações do Google Calendar API
// RENOMEIE este arquivo para config.js e preencha com suas credenciais

const CONFIG = {
    // Google Calendar API Configuration
    // Obtenha estas credenciais em: https://console.cloud.google.com/
    GOOGLE_API_KEY: 'AIzaSyC...', // Sua Google API Key
    GOOGLE_CLIENT_ID: '123456789-abc123.apps.googleusercontent.com', // Seu Google Client ID
    
    // WhatsApp Configuration
    // Formato: código do país + DDD + número (sem + e sem espaços)
    // Exemplo para Brasil: 5511999999999
    WHATSAPP_NUMBER: '5511999999999', // Substitua pelo seu número
    
    // Calendar Configuration
    CALENDAR_ID: 'primary', // Use 'primary' para o calendário principal
    
    // Timezone - Ajuste conforme sua localização
    TIMEZONE: 'America/Sao_Paulo' // Fuso horário do Brasil
};

// Horários de funcionamento - Personalize conforme necessário
const HORARIOS_CONFIG = {
    MANHA: {
        INICIO: 9,   // 09:00
        FIM: 11,     // 11:00 (não incluso - vai até 10:50)
        INTERVALO: 10 // minutos entre slots
    },
    TARDE: {
        INICIO: 14,  // 14:00
        FIM: 17,     // 17:00 (não incluso - vai até 16:50)
        INTERVALO: 10 // minutos entre slots
    }
};

// Lista de parentescos disponíveis - Personalize conforme necessário
const PARENTESCOS = [
    'Família',
    'Amigo',
    'Próximo da Família'
];

// Configurações da mensagem do WhatsApp
const WHATSAPP_CONFIG = {
    // Mensagem que será enviada pelo WhatsApp após o agendamento
    MENSAGEM_TEMPLATE: `Olá! Acabei de agendar uma chamada de vídeo.

📅 Data: {DATA}
🕐 Horário: {HORARIO}
👤 Nome: {NOME}
👥 Parentesco: {PARENTESCO}

Aguardo o contato!`,
    
    // Duração padrão das chamadas em minutos
    DURACAO_CHAMADA: 30
};

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        CONFIG, 
        HORARIOS_CONFIG, 
        PARENTESCOS, 
        WHATSAPP_CONFIG 
    };
}
