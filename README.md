# 📱 Sistema de Agendamento para WhatsApp

Sistema de agendamento de chamadas de vídeo com integração ao Google Calendar e redirecionamento para WhatsApp.

## 🚀 Funcionalidades

- ✅ Formulário de agendamento com validação
- ✅ Horários pré-definidos (09:00-11:00 e 14:00-17:00)
- ✅ Intervalos de 10 minutos
- ✅ Integração com Google Calendar
- ✅ Redirecionamento automático para WhatsApp
- ✅ Design responsivo e moderno
- ✅ Deploy fácil na Netlify

## 📋 Campos do Formulário

- **Nome Completo**: Campo obrigatório
- **Grau de Parentesco**: Família, Amigo, Próximo da Família
- **Data**: Apenas datas futuras
- **Horário**: Slots disponíveis de 10 em 10 minutos
- **Status**: Exibição em tempo real da disponibilidade

## ⚙️ Configuração

### 1. Google Calendar API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google Calendar API
4. Crie credenciais (API Key e OAuth 2.0 Client ID)
5. Configure as origens autorizadas:
   - Para desenvolvimento: `http://localhost:3000`
   - Para produção: `https://seu-dominio.netlify.app`

### 2. Configurar Credenciais

Edite o arquivo `config.js` e substitua:

```javascript
const CONFIG = {
    GOOGLE_API_KEY: 'sua_api_key_aqui',
    GOOGLE_CLIENT_ID: 'seu_client_id_aqui.apps.googleusercontent.com',
    WHATSAPP_NUMBER: '5511999999999', // Seu número com código do país
};
```

### 3. Deploy na Netlify

1. Faça fork deste repositório
2. Conecte sua conta Netlify ao GitHub
3. Selecione o repositório
4. As configurações de build já estão no `netlify.toml`
5. Deploy automático!

## 🕐 Horários Disponíveis

- **Manhã**: 09:00 às 11:00
- **Tarde**: 14:00 às 17:00
- **Intervalos**: 10 minutos

## 📱 Integração WhatsApp

Após o agendamento, o usuário é redirecionado para o WhatsApp com uma mensagem pré-formatada contendo:
- Data e horário agendados
- Nome e parentesco
- Confirmação do agendamento

## 🔒 Segurança

- Headers de segurança configurados
- CSP (Content Security Policy) implementado
- Validação client-side e server-side
- Proteção contra XSS e CSRF

## 🛠️ Tecnologias

- HTML5, CSS3, JavaScript (ES6+)
- Google Calendar API
- Google OAuth 2.0
- Netlify (hosting)
- Design responsivo com CSS Grid/Flexbox

## 📄 Estrutura de Arquivos

```
agendamento/
├── index.html          # Página principal
├── styles.css          # Estilos responsivos
├── script.js           # Lógica principal
├── config.js           # Configurações da API
├── netlify.toml        # Configurações do Netlify
└── README.md           # Documentação
```

## 🎨 Personalização

### Cores do WhatsApp
- Primary: #25D366
- Secondary: #128C7E
- Gradientes modernos

### Responsividade
- Mobile-first design
- Breakpoints otimizados
- Interface touch-friendly

## 📞 Suporte

Para suporte ou dúvidas, entre em contato através do WhatsApp após realizar um agendamento!

---

Desenvolvido com ❤️ para facilitar agendamentos de chamadas de vídeo.
