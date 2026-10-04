# JH Team

- Projeto novo: não inferir domínio ou funcionalidades pelo nome.
- Implementar features uma por vez, somente quando solicitadas.
- Mobile: React Native, Expo, Expo Router e TypeScript strict; usar npm e um único lockfile.
- Priorizar iOS físico e manter Android compatível sem complexidade extra.
- Rotas em mobile/app; código reutilizável em mobile/src; novas features em src/features/<nome> quando necessárias.
- PostgreSQL em Docker serve apenas ao desenvolvimento local. Nunca conectar mobile diretamente ao banco ou incluir suas credenciais no app.
- Não adicionar backend, ORM ou entidades sem solicitação.
- Evitar overengineering e pastas/abstrações vazias. Analisar o código antes de alterar arquitetura.
- Após alterações, executar os checks relevantes: npm run lint, npm run typecheck e npm run format:check em mobile.
- Não publicar, fazer push ou criar commits automaticamente.
