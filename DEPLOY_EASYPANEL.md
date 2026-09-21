# Publicação na VPS com EasyPanel

## Escopo atual

O repositório contém protótipos estáticos do site público e do painel administrativo. Eles podem ser publicados como arquivos estáticos, mas não possuem PHP, MySQL, login, pedidos reais, migrações ou health check de aplicação. Os itens marcados como **futura aplicação** só devem ser executados depois que a versão PHP/MySQL segura for implementada e revisada.

## 1. Pré-publicação

- [ ] Definir domínio público, por exemplo `pedidos.seu-dominio.com.br`, e, se necessário, subdomínio administrativo como `admin.seu-dominio.com.br`.
- [ ] Criar ambientes separados: `staging` e `production`.
- [ ] Confirmar que `.env` está ignorado pelo Git e que somente [`.env.example`](.env.example) será versionado.
- [ ] Revisar o repositório para chaves, tokens, dumps SQL, arquivos `.zip`, `.bak`, logs e diretórios `.git` públicos.
- [ ] Manter o painel EasyPanel, sistema operacional, PHP e MySQL atualizados.
- [ ] Definir responsável técnico, janela de manutenção e plano de reversão.

## 2. Variáveis de ambiente

1. No EasyPanel, abra o serviço da aplicação e cadastre as variáveis usando `.env.example` como catálogo.
2. Gere `APP_KEY` e `BACKUP_ENCRYPTION_KEY` com fonte criptograficamente segura, fora do repositório.
3. Crie `DB_PASSWORD` no painel, nunca no código, imagem Docker ou histórico de terminal.
4. Em produção, use `APP_ENV=production` e `APP_DEBUG=false`.
5. Configure `APP_URL` com HTTPS e `APP_TIMEZONE=America/Sao_Paulo`.

**Teste:** exportar a configuração pelo painel, se permitido, e conferir que nenhum valor secreto aparece em Git, HTML, JavaScript, logs ou respostas de erro.

## 3. Banco de dados MySQL, futura aplicação

- [ ] Criar serviço MySQL gerenciado pelo EasyPanel, em rede privada, sem porta pública exposta.
- [ ] Criar banco `brasa_burger` e usuário exclusivo `brasa_app`.
- [ ] Conceder ao usuário da aplicação apenas `SELECT`, `INSERT`, `UPDATE`, `DELETE` e `CREATE/ALTER/INDEX` durante migrações controladas. Não usar `root` na aplicação.
- [ ] Definir `utf8mb4` e collation consistente, preferencialmente `utf8mb4_unicode_ci` ou equivalente disponível.
- [ ] Habilitar backups antes da primeira migração.
- [ ] Documentar tamanho inicial, retenção e crescimento esperado de pedidos, imagens e auditoria.

**Teste:** conectar com o usuário da aplicação e confirmar que ele não consegue criar usuários, acessar bancos não relacionados ou executar ações administrativas globais.

## 4. Migrações seguras, futura aplicação

- [ ] Versionar migrações SQL/PHP, nunca alterar manualmente apenas o banco de produção.
- [ ] Toda migração deve ter identificador, data, autor, objetivo e plano de reversão.
- [ ] Executar primeiro em staging com uma cópia anonimizada do esquema e dados de teste.
- [ ] Fazer backup verificado imediatamente antes de migrar produção.
- [ ] Preferir alterações compatíveis em etapas: adicionar campo opcional, publicar código compatível, preencher em lotes, depois tornar obrigatório.
- [ ] Para índices ou tabelas grandes, usar estratégia que minimize bloqueios e janela de indisponibilidade.
- [ ] Executar migrações uma única vez por release, com trava para evitar duas instâncias executando em paralelo.

**Teste:** validar criação, atualização e reversão de uma migração em staging; medir tempo e bloqueio; restaurar um snapshot em banco isolado.

## 5. Serviço da aplicação

### Protótipo atual

- [ ] Criar serviço estático ou servidor web que publique `index.html` e `admin.html`.
- [ ] Montar `assets/images` como conteúdo somente leitura da aplicação.
- [ ] Não expor `.git`, arquivos de configuração, backups ou listagem de diretório.

### Futura aplicação PHP

- [ ] Criar serviço PHP 8.2+ com servidor web/reverse proxy no EasyPanel.
- [ ] Rodar o processo como usuário não root e com filesystem de código somente leitura quando possível.
- [ ] Criar volume persistente exclusivo para `/var/www/storage` ou caminho definido em `STORAGE_PATH`.
- [ ] Manter uploads fora do diretório público e servi-los por rota controlada ou storage privado.
- [ ] Limitar tamanho de upload no proxy e no PHP; o limite deve respeitar `UPLOAD_MAX_MB`.
- [ ] Configurar tarefa agendada para limpeza de uploads temporários, tokens expirados e backups locais antigos.

**Teste:** reiniciar e recriar o container. O conteúdo do volume persistente deve continuar disponível; arquivos de código não devem aceitar escrita pelo processo web.

## 6. Domínio, DNS e HTTPS

- [ ] Criar registro DNS A/AAAA apontando para a VPS ou seguir o endereço indicado pelo EasyPanel.
- [ ] Adicionar domínio ao serviço, emitir certificado TLS pelo EasyPanel e habilitar renovação automática.
- [ ] Forçar redirecionamento HTTP para HTTPS.
- [ ] Após validar o certificado e todos os subdomínios, habilitar HSTS.
- [ ] Restringir CORS a domínios realmente usados pela aplicação.
- [ ] Aplicar CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` e proteção contra frame/clickjacking.

**Teste:** acessar HTTP e confirmar redirecionamento; revisar certificado, renovação e cabeçalhos com scanner externo; tentar incorporar `/admin` em um iframe externo.

## 7. Health check e disponibilidade

### Protótipo estático

- [ ] Configurar health check HTTP em `GET /` que espere `200`.

### Futura aplicação

- [ ] Implementar `GET /healthz` sem autenticação, sem dados pessoais e sem detalhes internos.
- [ ] Retornar `200` somente quando PHP e banco estiverem disponíveis para operações básicas.
- [ ] Retornar `503` durante manutenção ou quando a dependência essencial estiver indisponível.
- [ ] Configurar o EasyPanel para verificar a rota periodicamente e reiniciar instâncias que falhem.

**Teste:** interromper temporariamente a conexão do banco em staging e confirmar `503`; restaurar a conexão e confirmar recuperação automática sem expor stack trace.

## 8. Logs, monitoramento e alertas

- [ ] Gravar logs estruturados com data, nível, ID de correlação e evento, sem senha, cookie, token, cartão, endereço completo ou telefone completo.
- [ ] Separar logs de acesso, aplicação e auditoria administrativa.
- [ ] Proteger os logs com acesso mínimo, retenção definida e rotação.
- [ ] Monitorar indisponibilidade, erros 5xx, aumento de 401/403/429, falha de backup, espaço em disco, CPU/memória, expiração de certificado e tentativas de login anormais.
- [ ] Configurar alerta para canal operacional com responsável e horário de escalonamento.

**Teste:** gerar erro controlado e tentativa de login inválida em staging; confirmar alerta, correlação e ausência de dados sensíveis.

## 9. Backups e restauração

- [ ] Backup diário criptografado do MySQL, com retenção mínima definida em `BACKUP_RETENTION_DAYS`.
- [ ] Backup do volume persistente de uploads e dos arquivos de configuração necessários, sem guardar segredos no repositório.
- [ ] Manter uma cópia fora da VPS, em local protegido e com acesso restrito.
- [ ] Registrar resultado, duração e checksum de cada backup.
- [ ] Definir RPO, perda máxima aceitável de dados, e RTO, tempo máximo de recuperação.
- [ ] Documentar o procedimento de restauração e a ordem: banco, volume, variáveis, aplicação, validação.

**Teste obrigatório mensal:** restaurar banco e volume em ambiente isolado; conferir pedidos, imagens e configurações; registrar tempo real de recuperação. Backup sem restauração testada não é backup confiável.

## 10. Testes pós-publicação

- [ ] `https://domínio/` responde `200` e renderiza imagens locais.
- [ ] `https://domínio/admin.html` responde apenas conforme o escopo atual do protótipo. Na futura aplicação, `/admin` exige autenticação no servidor.
- [ ] Certificado TLS válido, redirecionamento HTTPS e cabeçalhos presentes.
- [ ] Nenhum arquivo `.env`, `.git`, backup, log ou diretório navegável é exposto pela web.
- [ ] Health check do EasyPanel está saudável.
- [ ] Volume de armazenamento permanece após reinício/redeploy.
- [ ] Backups foram executados e há evidência de restauração testada.
- [ ] Em staging, validar login, logout, CSRF, autorização, cálculo de preço no servidor, cupom, taxa de entrega, upload e fluxo de pedido.
- [ ] Testar uma atualização e rollback controlados antes da primeira release de produção.

## 11. Procedimento de rollback

1. Colocar a aplicação em modo de manutenção, preservando pedidos existentes.
2. Voltar para a imagem/release anterior no EasyPanel.
3. Restaurar banco apenas se a migração tiver alterado dados de modo incompatível e o plano de reversão exigir.
4. Validar `/healthz`, página pública, login administrativo e criação de pedido de teste.
5. Registrar incidente, impacto, causa e ações preventivas.

## Checklist de aprovação final

- [ ] Ambiente de produção separado de staging.
- [ ] Variáveis registradas só no EasyPanel e `.env` fora do Git.
- [ ] Banco privado, usuário de mínimo privilégio e backup verificado.
- [ ] Migrações testadas e reversíveis.
- [ ] HTTPS, domínio, cabeçalhos e health check ativos.
- [ ] Volume persistente montado e restauração testada.
- [ ] Logs protegidos, alertas configurados e playbook de incidente disponível.
- [ ] Testes pós-publicação concluídos e registrados.
