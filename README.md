# Central DO · CS

## Publicar
1. Crie um repositório PRIVADO no GitHub com esta pasta e importe na Vercel (New Project). Use o plano Pro: a agência é uso comercial, e o plano Hobby não permite.
2. Storage > Marketplace > Upstash for Redis: crie e conecte ao projeto. As variáveis KV_REST_API_URL e KV_REST_API_TOKEN entram sozinhas.
3. Rode `npm run hash -- "sua senha"` e cole o resultado em USERS_JSON.
4. Preencha as demais variáveis de `.env.example` em Settings > Environment Variables. Gere SESSION_SECRET e CRON_SECRET com `openssl rand -hex 32`.
5. Faça o Redeploy.

## Subdomínio
Em Settings > Domains adicione `cs.autodesignonline.com.br`. No DNS do domínio crie o registro que a Vercel mostrar (normalmente CNAME `cs` para `cname.vercel-dns.com`).

## Segurança
- O site e os dados só saem do servidor com sessão válida (cookie HttpOnly, 12 horas).
- Senhas com scrypt. Login bloqueia após 8 tentativas por 15 minutos.
- Campos de login, CPF, CNPJ e financeiro nunca entram na sincronização.
- O link de agendamento é assinado por cliente e só mostra o nome da loja e os horários.

## Tela do cliente
Demandas vêm do ClickUp. Resultados de anúncios precisam de META_TOKEN (token de usuário do sistema com leitura de anúncios).

## Backup
Cópia diária do estado por 35 dias (`bk:AAAA-MM-DD` no Redis). `/api/export` baixa tudo em JSON, com login.

## ATA automática (Tactiq)
Crie um Zap: gatilho Tactiq de nova reunião, ação Webhooks POST para `/api/ingest`, com header `x-token` igual a INGEST_TOKEN e os campos id, title, date, attendees e transcript. O comando `/ata` passa a achar a reunião. Sem isso, ele pede a transcrição colada.

## Agenda no ClickUp
Preencha CLICKUP_AGENDA_LIST com o id da lista. Cada agendamento vira uma tarefa com data e hora, e aparece na visão Calendário dessa lista. Link geral: `/agendar`. Horários: dias úteis, 13h30 às 17h30.

## Automático
- 08h30: atualiza do ClickUp (`/api/cron/sync`).
- 03h: backup (`/api/cron/backup`).

Rodar localmente: `npm run dev`, usuário `thiago`, senha `senha-de-teste`.
