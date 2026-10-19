# Baseline de validação — Etapa 0

Registro das falhas já observadas antes da Etapa 1. Não representa validação atual nem autoriza
ignorar falhas futuras.

## Frontend

- `lint`: exit 0, com dois avisos de limite de linhas.
- `format`: passou.
- `typecheck`: bloqueado por 60 erros `TS2322` em usos de tipos do Chakra UI.
- `check-deps` anterior: exit 0 sem analisar módulos, pois chamava `dependency-cruiser src`.
- `depcruise` anterior com glob: 1.050 erros `not-to-unresolvable` e 74 avisos `no-orphans` no
  dependency-cruiser 17.3.5, incompatível com TypeScript 6. Os resultados não eram uma leitura
  arquitetural confiável.
- Build: não foi considerado parte da baseline de checks não mutáveis; gera artefatos em `dist`.

## Backend

- `lint`: cinco erros e dois avisos preexistentes.
- `format`: 20 arquivos fora do padrão.
- `typecheck`: bloqueado por `TS5101`, relacionado à depreciação de `baseUrl` na configuração atual
  do TypeScript.
- dependency-cruiser: dois avisos e nenhum erro.
- `check:env:dev`: validação inicial de configuração passou; verificação seguinte de isolamento
  bloqueada pela ausência de `.env.test`, sem conexão ao banco.
- `check:static` anterior executava geração do Prisma e barrels, correções automáticas de lint e
  formatação e geração de métricas; não era um check não mutável.

## Compatibilidade do lockfile do frontend

Antes da atualização direcionada dos pacotes de ferramentas, `npm ci --dry-run --ignore-scripts`
falhava com `ERESOLVE`: `typescript-eslint` resolvido no lockfile declarava peer dependency de
TypeScript `<6`, mas o projeto usa TypeScript 6. A Etapa 1 atualiza apenas `dependency-cruiser` e
`typescript-eslint` para corrigir compatibilidade e habilitar a análise real.
