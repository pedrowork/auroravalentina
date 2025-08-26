// Configurações do Google Calendar API
// IMPORTANTE: Substitua estes valores pelos seus próprios

const CONFIG = {
    // Google Calendar API Configuration
    // Exemplo: GOOGLE_API_KEY: 'AIzaSyC1234567890abcdefghijklmnopqrstuvwx',
    GOOGLE_API_KEY: 'AIzaSyAPWpI6i_kiuObJpXHI_Qjj8Xy_twuybng',
    
    // Exemplo: GOOGLE_CLIENT_ID: '123456789-abc123def456.apps.googleusercontent.com',
    GOOGLE_CLIENT_ID: '441407921403-knpin7jjcqsm8crl4rqm85pqudg8a8q2.apps.googleusercontent.com',
    
    // WhatsApp Configuration
    // Exemplo: '5511999887766' (Brasil: 55 + DDD + número)
    WHATSAPP_NUMBER: '5579996054554', // Substitua pelo seu número (com código do país, sem +)
    
    // Calendar Configuration
    CALENDAR_ID: 'primary', // Use 'primary' para o calendário principal
    
    // Timezone
    TIMEZONE: 'America/Sao_Paulo'
};

// Horários de funcionamento
const HORARIOS_CONFIG = {
    MANHA: {
        INICIO: 9,   // 09:00
        FIM: 11,     // 11:00
        INTERVALO: 10 // minutos
    },
    TARDE: {
        INICIO: 14,  // 14:00
        FIM: 17,     // 17:00
        INTERVALO: 10 // minutos
    }
};

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, HORARIOS_CONFIG };
}
