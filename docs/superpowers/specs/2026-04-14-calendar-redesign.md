# Calendar Page Redesign

## 1. Exibição padrão — todos os jogos em blocos temporais

- Ao abrir a página, **nenhum filtro de dia ativo** — todos os jogos aparecem
- Agrupamento primário por **data** (ex: "Hoje — 14 Abr", "Amanhã — 15 Abr"), e dentro de cada data, por **liga**
- Hierarquia visual: header de data > header de liga > match cards

## 2. Busca por equipe

- Busca filtra sobre **todos os jogos** (não apenas o dia selecionado)
- Quando o usuário seleciona um dia rápido ou data no picker, combina com a busca
- Controlada via `react-hook-form` (campo `search` com watch)

## 3. Date picker (shadcn)

- Componente shadcn `DatePicker` (Popover + Calendar) ao final da linha dos botões rápidos
- Ao selecionar uma data, funciona como filtro de dia (igual aos botões rápidos)
- Botão de limpar para voltar à visão "todos os jogos"

## 4. Botões de dia rápido dinâmicos

- Sempre "Hoje" + até 3 dias que tenham jogos (máx 4 botões total)
- Se amanhã não tem jogos, pula para o próximo dia com jogos
- Ao clicar num botão, filtra por aquele dia; clicar de novo (ou limpar) volta a "todos"

## 5. Badges de liga — bandeiras emoji

- Expandir `TOURNAMENT_COUNTRY` com Championship e outras ligas faltantes
- Badge exibe emoji de bandeira do país ao invés de texto de 2 letras

## 6. Nomes de liga — title case

- `formatTournament()` já retorna nomes legíveis ("Premier League")
- No header da seção, usar o retorno de `formatTournament()` sem `.toUpperCase()`

## 7. Dados

- Fetch server-side via tRPC com token do Strapi (prefetch no server component)
- React Query hidrata no client para filtragem 100% client-side
- Sem chamadas diretas ao Strapi do client
