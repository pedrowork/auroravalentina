# 🚀 Deploy Rápido na Netlify

Guia rápido para colocar seu sistema de agendamento no ar em poucos minutos!

## ✅ Pré-requisitos

- [ ] Conta no [GitHub](https://github.com)
- [ ] Conta no [Netlify](https://netlify.com)
- [ ] Credenciais do Google Calendar API ([veja SETUP.md](SETUP.md))

## 🚀 Deploy em 5 Passos

### 1. Preparar o Código

```bash
# Clone ou baixe este projeto
git clone seu-repositorio
cd agendamento

# Copie o arquivo de exemplo
cp config.exemplo.js config.js

# Edite o config.js com suas credenciais
# (veja o SETUP.md para obter as credenciais)
```

### 2. Subir para o GitHub

```bash
git add .
git commit -m "Sistema de agendamento WhatsApp"
git push origin main
```

### 3. Conectar ao Netlify

1. Acesse [netlify.com](https://netlify.com)
2. Clique em "New site from Git"
3. Escolha GitHub e autorize
4. Selecione seu repositório
5. Configurações automáticas (já está no `netlify.toml`)
6. Clique em "Deploy site"

### 4. Configurar Google Calendar

1. Anote a URL do Netlify (ex: `https://seu-site.netlify.app`)
2. Vá ao [Google Cloud Console](https://console.cloud.google.com)
3. Em "Credenciais" > Edite seu OAuth Client ID
4. Adicione a URL do Netlify nas "Origens autorizadas"
5. Salve

### 5. Testar

- Acesse sua URL do Netlify
- Teste o agendamento completo
- Verifique se o evento aparece no Google Calendar
- Teste o redirecionamento para WhatsApp

## 🔧 Configurações Importantes

### URLs para Google OAuth

Adicione estas URLs no Google Cloud Console:

```
Para desenvolvimento:
http://localhost:3000

Para produção:
https://seu-dominio.netlify.app
```

### Variáveis de Ambiente (Opcional)

Para maior segurança, use variáveis de ambiente no Netlify:

1. Site settings > Environment variables
2. Adicione:
   - `GOOGLE_API_KEY` = sua API key
   - `GOOGLE_CLIENT_ID` = seu client ID
   - `WHATSAPP_NUMBER` = seu número

E modifique o `config.js`:

```javascript
const CONFIG = {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || 'fallback_key',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'fallback_id',
    WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER || '5511999999999',
    // ...
};
```

## 📱 Customização Rápida

### Mudar Horários

Edite `config.js`:

```javascript
const HORARIOS_CONFIG = {
    MANHA: {
        INICIO: 8,   // 08:00
        FIM: 12,     // 12:00
        INTERVALO: 15 // 15 minutos
    },
    TARDE: {
        INICIO: 13,  // 13:00
        FIM: 18,     // 18:00
        INTERVALO: 15 // 15 minutos
    }
};
```

### Mudar Cores

Edite `styles.css` - procure por `#25D366` e `#128C7E` e substitua pelas suas cores.

### Mudar Título

Edite `index.html`:

```html
<title>Seu Título Aqui</title>
<h1>🎥 Seu Título Aqui</h1>
```

## 🔍 Solução de Problemas

### Site não carrega
- Verifique se o deploy foi bem-sucedido no Netlify
- Veja os logs de build

### Erro "API key not valid"
- Verifique se a API Key está correta no `config.js`
- Confirme se a Google Calendar API está ativada

### Erro "redirect_uri_mismatch"
- Adicione a URL do Netlify no Google Cloud Console
- Verifique se não há `/` extra no final

### Agendamentos não aparecem
- Verifique se a autorização foi feita
- Confirme se o timezone está correto

## 🎯 URL para WhatsApp Bio

Após o deploy, copie sua URL do Netlify e use em:

- Bio do WhatsApp Business
- Status do WhatsApp
- Links em outras redes sociais
- Cartão de visita digital

Exemplo: `https://agendamento-video.netlify.app`

## 📈 Próximos Passos

- [ ] Personalizar design com sua marca
- [ ] Adicionar Google Analytics
- [ ] Configurar domínio customizado
- [ ] Implementar notificações por email
- [ ] Adicionar mais opções de horário

---

🎉 **Pronto!** Seu sistema de agendamento está no ar!

Para suporte, crie uma issue no GitHub ou entre em contato.
