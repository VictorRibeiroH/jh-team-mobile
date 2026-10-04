# JH Team

## Sobre

Base técnica inicial do aplicativo JH Team. Nenhum domínio ou funcionalidade de produto foi definido. Não há backend, autenticação, tabelas ou conexão do mobile ao banco.

## Stack

React Native + Expo SDK 57, TypeScript strict, Expo Router, Zustand instalado sem store artificial, TanStack Query com provider e integração ao foco do app, ESLint e Prettier. PostgreSQL 18 oficial em Docker, apenas para desenvolvimento local. Assets padrão do Expo; tema dark provisório.

## Estrutura do projeto

```text
mobile/
  app/                 # rotas e layout
  src/components/ui/   # AppText, Button, Screen
  src/providers/       # Query e Safe Area
  src/theme/           # tokens mínimos
  assets/              # assets padrão
AGENTS.md
docker-compose.yml
.env.example
```

## Pré-requisitos

- Node.js 22.13+ da linha 22 ou 24.3+ (recomendado: Node 24 LTS) e npm. Se usar asdf, selecione uma versão compatível antes de instalar; o Node 20.5.1 disponível inicialmente neste Mac não atende ao SDK.
- macOS e Xcode com Command Line Tools selecionadas, para iOS.
- Docker Desktop iniciado, para PostgreSQL.
- DBeaver, para visualizar o banco.
- iPhone com versão de iOS compatível com o SDK, cabo e acesso à assinatura de desenvolvimento no Xcode.

## Primeira instalação

Na raiz:

```bash
cp .env.example .env
cd mobile
npm ci
```

O Compose também funciona sem `.env`, usando os mesmos valores padrão. Use somente npm; versione `package-lock.json`.

## Mobile

```bash
cd mobile
npm start
```

Inicia Metro em modo development client. A primeira instalação no aparelho exige o passo seguinte. O alias `@/*` aponta para `src/*` via tsconfig e é resolvido pelo Metro do Expo, sem plugins Babel extras.

## Rodar no iPhone físico

1. Conecte o iPhone ao Mac, desbloqueie e aceite **Confiar neste computador**.
2. Ative **Ajustes → Privacidade e Segurança → Modo de Desenvolvedor**, se solicitado, reinicie e confirme.
3. Abra o Xcode uma vez para concluir sua instalação e aceitar os termos. Use sua conta Apple em **Xcode → Settings → Accounts**, se a assinatura exigir.
4. Execute:

```bash
cd mobile
npx expo run:ios --device
```

5. Selecione o iPhone. O Expo gera os diretórios nativos quando necessário, compila, instala a development build e inicia Metro.
6. Se houver erro de assinatura, abra o workspace gerado em `mobile/ios/` no Xcode, selecione o target JH Team e, em **Signing & Capabilities**, habilite assinatura automática e escolha seu Apple Development Team real. Não há Team ID configurado no repositório. Execute novamente o comando.
7. Se solicitado no aparelho, confie no desenvolvedor em **Ajustes → Geral → VPN e Gerenciamento de Dispositivo**.
8. Abra **JH Team** no iPhone. Para sessões seguintes, execute `npm start` no Mac e abra o servidor pelo QR code ou pelo launcher da development build. Mac e iPhone devem conseguir acessar a mesma rede; permita acesso à rede local quando o iOS solicitar.

Os diretórios `ios/` e `android/` são gerados e ignorados. Configurações persistentes devem ficar no app.json/config plugins. Não é necessário executar prebuild manualmente. Mudanças em dependências nativas ou configuração nativa exigem reconstruir o app; edições TypeScript normalmente não.

## Abrir pelo QR code

### Expo Go

Instale Expo Go no iPhone. Se a versão do Expo Go instalada suportar o SDK 57 deste projeto:

```bash
cd mobile
npx expo start --go
```

Mac e iPhone devem estar na mesma rede Wi-Fi. Leia o QR code do terminal com a câmera do iPhone e abra no Expo Go. Esse modo usa o aplicativo Expo Go como runtime; não instala o próprio JH Team. Se aparecer incompatibilidade de SDK, use a development build configurada neste projeto.

### Development build JH Team

Primeiro instale o app pelo cabo com `npx expo run:ios --device`, conforme a seção anterior. Nas sessões seguintes:

```bash
cd mobile
npm start
```

Leia o QR code com a câmera do iPhone para abrir a development build instalada. O QR code conecta ao Metro; ele não substitui a primeira compilação/instalação local. Depois, edições TypeScript são atualizadas pelo Fast Refresh, sem recompilar a cada alteração.

Referência: [usar development builds](https://docs.expo.dev/develop/development-builds/use-development-builds/).

## Fast Refresh

Com Metro ativo e o app aberto, edite `mobile/app/index.tsx`, altere um texto e salve. A tela deve atualizar automaticamente. Caso necessário, abra o menu de desenvolvimento e habilite Fast Refresh. A instalação e a atualização visual precisam ser confirmadas no aparelho; exportar o bundle não substitui essa validação.

## PostgreSQL local / Docker

Execute na raiz:

```bash
docker compose up -d
docker compose ps
docker compose logs postgres
```

O container deve apresentar estado `healthy`. Para validar o banco:

```bash
docker compose exec postgres psql -U postgres -d jh_team -c 'SELECT current_database();'
```

Para parar, preservando o volume:

```bash
docker compose down
```

Para remover também o banco local:

```bash
docker compose down -v
```

**`-v` apaga os dados persistidos.** O volume do PostgreSQL 18 está montado em `/var/lib/postgresql`, conforme o layout da imagem oficial. A porta é publicada apenas em localhost. As credenciais são locais; nunca use esses valores em produção ou no aplicativo.

## Conectar via DBeaver

Crie uma conexão e use **Test Connection** (baixe o driver se solicitado):

```text
Driver: PostgreSQL
Host: localhost
Port: 5433
Database: jh_team
Username: postgres
Password: postgres
```

A porta externa 5433 foi escolhida porque 5432 já estava ocupada neste Mac. Esses são os defaults reais do Compose. Se alterar `.env`, ajuste a conexão; alterações de usuário/senha/database não reinicializam um volume existente. Nenhum schema de negócio foi criado.

## Comandos úteis / Qualidade de código

Em `mobile/`:

```bash
npm start
npm run ios
npm run android
npm run lint
npm run typecheck
npm run format
npm run format:check
npx expo install --check
npx expo-doctor
```

## Estrutura para novas features

Crie `src/features/<nome>/` quando uma feature for definida. Mantenha rotas focadas na navegação/composição, componentes compartilhados em `src/components/ui` e tokens em `src/theme`. Não crie services, stores, hooks ou pastas vazias antecipadamente. O QueryClient usa staleTime de 1 minuto, gcTime de 5 minutos e uma tentativa adicional; ajuste conforme requisições reais surgirem. Não existem chamadas HTTP ou stores demonstrativas.

## Publicação futura

Nome `JH Team`, slug `jh-team`, bundle identifier provisório `com.victor.jhteam` (também package Android). Não há publicação, build de produção ou certificados de distribuição configurados. Confirme a disponibilidade do identificador quando houver planejamento da publicação.

Referências oficiais: [development build local e dispositivo](https://docs.expo.dev/guides/local-app-development/), [aliases TypeScript](https://docs.expo.dev/guides/typescript/), [imagem PostgreSQL](https://hub.docker.com/_/postgres).

## Validação desta etapa

- Instalação reproduzível com `npm ci`, lint, typecheck e formatação validados.
- Expo Doctor: 21/21 checks; versões compatíveis conferidas pelo Expo.
- Bundle iOS gerado pelo Metro com Expo Router e aliases resolvidos.
- PostgreSQL saudável em localhost:5433; banco jh_team confirmado; nenhuma tabela pública.
- Metro iniciou em modo CI, que desabilita reloads. O modo normal encontrou `EMFILE` neste Mac. Watchman não estava instalado e sua instalação via Homebrew foi bloqueada pelo sandbox deste ambiente. Para o fluxo normal, execute no seu terminal:

```bash
brew install watchman
```

- Node 24.21.0 instalado pelo asdf e selecionado em `.tool-versions` na raiz. O npm funciona tanto na raiz quanto em `mobile/`. Em um novo clone com asdf, execute `asdf install` na raiz.

- A compilação, instalação, renderização visual e o Fast Refresh no iPhone ainda não foram validados. A ferramenta de detecção do Xcode foi bloqueada pelo sandbox; nenhuma conta Apple foi alterada.
- DBeaver: parâmetros conferidos com Compose e consulta SQL validada no container; conexão pela interface do DBeaver ainda não foi testada.
- `npm audit` reporta 29 alertas transitivos/agregados (10 moderados e 19 altos) na stack instalada. `npm audit fix` sem force foi executado; os alertas restantes não foram eliminados. As sugestões com force incluem downgrade incompatível do Expo ou troca de SDK do Router; reavaliar quando houver correções oficiais compatíveis.
