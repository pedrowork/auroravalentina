# 🔧 Guia de Configuração do Google Calendar API

Este guia te ajudará a configurar a integração com o Google Calendar API para o sistema de agendamento.

## 📋 Pré-requisitos

- Conta Google
- Acesso ao Google Cloud Console
- Editor de código (VS Code, etc.)

## 🚀 Passo a Passo

### 1. Configurar Projeto no Google Cloud Console

1. **Acesse o Google Cloud Console**
   - Vá para [console.cloud.google.com](https://console.cloud.google.com/)
   - Faça login com sua conta Google

2. **Criar ou Selecionar Projeto**
   - Clique no seletor de projeto no topo
   - Clique em "Novo Projeto"
   - Nome: "Sistema Agendamento WhatsApp"
   - Clique em "Criar"

3. **Ativar Google Calendar API**
   - No menu lateral, vá em "APIs e Serviços" > "Biblioteca"
   - Pesquise por "Google Calendar API"
   - Clique na API e depois em "Ativar"

### 2. Criar Credenciais

#### API Key
1. Vá em "APIs e Serviços" > "Credenciais"
2. Clique em "+ Criar Credenciais" > "Chave da API"
3. Copie a chave gerada
4. Clique em "Restringir chave"
5. Em "Restrições da API", selecione "Google Calendar API"
6. Salve

#### OAuth 2.0 Client ID
1. Na mesma página de credenciais
2. Clique em "+ Criar Credenciais" > "ID do cliente OAuth"
3. Tipo de aplicativo: "Aplicativo da Web"
4. Nome: "Agendamento WhatsApp Client"
5. **Origens JavaScript autorizadas:**
   - `http://localhost:3000` (para desenvolvimento)
   - `https://seu-dominio.netlify.app` (para produção)
6. Clique em "Criar"
7. Copie o "ID do cliente"

### 3. Configurar Tela de Consentimento OAuth

1. Vá em "APIs e Serviços" > "Tela de consentimento OAuth"
2. Tipo de usuário: "Externo"
3. Preencha as informações obrigatórias:
   - Nome do app: "Agendamento WhatsApp"
   - Email de suporte do usuário: seu email
   - Email de contato do desenvolvedor: seu email
4. Salve e continue
5. **Escopos**: Adicione o escopo do Google Calendar
   - Clique em "Adicionar ou remover escopos"
   - Pesquise por "calendar" 
   - Selecione `https://www.googleapis.com/auth/calendar`
6. **Usuários de teste**: Adicione seu email para testes
7. Salve

### 4. Configurar o Código

1. **Edite o arquivo `config.js`:**

```javascript
const CONFIG = {
    GOOGLE_API_KEY: 'sua_api_key_copiada_aqui',
    GOOGLE_CLIENT_ID: 'seu_client_id_copiado_aqui.apps.googleusercontent.com',
    WHATSAPP_NUMBER: '5511999999999', // Seu número com código do país (sem +)
    CALENDAR_ID: 'primary',
    TIMEZONE: 'America/Sao_Paulo'
};
```

2. **Substitua os valores:**
   - `GOOGLE_API_KEY`: Cole a API Key criada
   - `GOOGLE_CLIENT_ID`: Cole o Client ID OAuth criado
   - `WHATSAPP_NUMBER`: Seu número do WhatsApp (ex: 5511999999999)

### 5. Testar Localmente

1. **Servidor Local:**
   ```bash
   # Usando Python
   python -m http.server 3000
   
   # Ou usando Node.js
   npx serve . -p 3000
   ```

2. **Acesse:** `http://localhost:3000`

3. **Teste o fluxo:**
   - Preencha o formulário
   - Autorize o acesso ao Google Calendar
   - Verifique se o evento foi criado no seu calendário

### 6. Deploy na Netlify

1. **Conectar Repositório:**
   - Faça push do código para GitHub
   - Conecte sua conta Netlify ao GitHub
   - Selecione o repositório

2. **Configurar Build:**
   - Build command: `echo "Static site"`
   - Publish directory: `.`

3. **Atualizar Domínio:**
   - Após o deploy, copie a URL do Netlify
   - Volte ao Google Cloud Console
   - Adicione a URL nas "Origens JavaScript autorizadas"

### 7. Configurações de Segurança (Opcional)

1. **Restringir API Key:**
   - Adicione restrições de HTTP referrers
   - Liste seus domínios autorizados

2. **Configurar CORS:**
   - Já configurado no `netlify.toml`

## 🔍 Troubleshooting

### Erro: "API key not valid"
- Verifique se a API Key está correta
- Confirme se a Google Calendar API está ativada
- Verifique as restrições da API Key

### Erro: "redirect_uri_mismatch"
- Confirme se a URL está listada nas origens autorizadas
- Verifique se não há barras extras no final da URL

### Erro: "access_denied"
- Adicione seu email nos usuários de teste
- Verifique se os escopos estão configurados corretamente

### Eventos não aparecem no Calendar
- Verifique se o timezone está correto
- Confirme se o usuário tem permissão de escrita no calendário

## 📞 Suporte

Se tiver problemas:
1. Verifique o console do navegador para erros
2. Confirme todas as configurações do Google Cloud
3. Teste primeiro localmente antes do deploy

## 🔒 Segurança

- **NUNCA** commite as credenciais no Git
- Use variáveis de ambiente em produção
- Configure adequadamente os domínios autorizados
- Mantenha as credenciais seguras

---

✅ Após seguir todos os passos, seu sistema de agendamento estará funcionando perfeitamente!
