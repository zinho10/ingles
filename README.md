# ENGLISH NOW — site de aulas de inglês

Site estático (HTML, CSS e JavaScript puros) do curso **ENGLISH NOW**, com o
**Professor Nicolas**. Pode ser aberto direto no navegador ou hospedado em
qualquer serviço de hospedagem estática.

## Arquivos

```
index.html           → estrutura e conteúdo
styles.css           → tema escuro, layout e animações
script.js            → menu, animações, FAQ, validação e envio do formulário
supabase-config.js   → URL e chave pública do seu projeto Supabase
supabase/schema.sql  → SQL para criar a tabela de solicitações
README.md            → este arquivo
```

## Como abrir

- Dê duplo clique em `index.html`; ou
- Hospede a pasta em Netlify, Vercel, GitHub Pages ou qualquer hospedagem estática.

## Formulário de solicitação

- Os 4 campos (nome, e-mail, WhatsApp e nível) são **obrigatórios**.
- O botão **“Enviar solicitação”** fica desativado até que todos estejam preenchidos.
- Ao enviar, o site:
  1. abre o **WhatsApp (22) 98106-5343** com todos os dados na mensagem;
  2. envia a mesma solicitação por **e-mail para nicki133029@email.com**;
  3. salva a solicitação na tabela **`leads`** do **Supabase**.

### Envio de e-mail

O envio usa o serviço gratuito **FormSubmit** (não precisa de backend). No
**primeiro envio**, o FormSubmit manda um e-mail de ativação para
`nicki133029@email.com`. É necessário abrir esse e-mail e clicar no link de
confirmação para que os próximos pedidos sejam entregues. Verifique também a
caixa de spam.

Se o navegador bloquear a janela do WhatsApp, use o botão **“Abrir WhatsApp”**
que aparece na confirmação. Se o e-mail não chegar, use **“Enviar por e-mail”**
(abre o aplicativo de e-mail com a mensagem pronta).

## Integração com o Supabase

### 1. Criar a tabela

No painel do Supabase, abra **SQL Editor**, cole o conteúdo de
`supabase/schema.sql` e execute. Isso cria a tabela `public.leads`, ativa o RLS
e libera **apenas INSERT** para a chave pública (`anon`).

### 2. Conectar o site

Em **Project Settings → API**, copie:

- **Project URL**
- **anon public key**

E cole no arquivo `supabase-config.js`:

```js
window.ENGLISH_NOW_SUPABASE = {
  url: "https://SEU-PROJETO.supabase.co",
  anonKey: "SUA-ANON-KEY",
  table: "leads",
};
```

Pronto. A partir daí, cada envio do formulário grava um registro com nome,
e-mail, WhatsApp, nível, mensagem, data/hora, origem e user agent.

### 3. Ver as solicitações

No painel do Supabase, abra **Table Editor → leads**. Os registros aparecem em
ordem decrescente de `created_at`.

> **Sobre segurança:** a chave `anon` é pública e pode ficar no site. O
> `schema.sql` ativa o RLS e permite somente inserções anônimas — visitantes não
> conseguem ler, alterar nem excluir os dados. A leitura fica disponível apenas
> no painel do Supabase (service role).

Se `supabase-config.js` ainda estiver com os valores de exemplo, o site continua
funcionando normalmente: WhatsApp e e-mail são enviados e a confirmação avisa
que o banco não está configurado.

## Como personalizar

| O que mudar | Onde |
| --- | --- |
| URL/chave do Supabase | `supabase-config.js` |
| Nome da tabela | `supabase-config.js` → `table` (ajuste também no `schema.sql`) |
| Número do WhatsApp | `script.js` → `WHATSAPP_NUMBER` e links do `index.html` |
| E-mail de destino | `script.js` → `CONTACT_EMAIL`, `action` do form `#emailRelay` e links do rodapé |
| Cores do tema | `styles.css` → variáveis no topo (`--accent`, `--bg`, etc.) |
| Textos e seções | `index.html` |
| Nome da marca | `index.html` (atualmente **ENGLISH NOW**) |

## Observações

- Números e redes sociais são conteúdos de exemplo; troque pelos reais.
- Os links de Instagram, YouTube e LinkedIn estão como `#` no rodapé.
- O site é responsivo (testado de 320px a 1440px) e acessível por teclado.
