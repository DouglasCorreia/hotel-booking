# Filtros múltiplos — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implementar as cinco specs aprovadas de filtros múltiplos.

**Architecture:** Preservar a consulta paginada da API. Traduzir as comodidades validadas para uma expressão de correspondência exata com exigência simultânea, suportada pelo filtro existente da API antes da paginação. Consultar separadamente os dados do catálogo para obter a escala do destino e detectar ar-condicionado no nível da hospedagem; a falha dessa consulta não bloqueia os resultados. Usar Slider e Checkbox do shadcn e o formulário validado já existente.

**Tech Stack:** Next.js 16.4.6, React, TypeScript, Zod, React Hook Form, TanStack Query, shadcn/Radix, Vitest, Playwright.

**Spec:** docs/prd/feature-filtros-multiplos.md

## Global Constraints

- Todas as comodidades selecionadas são obrigatórias; qualquer tipo selecionado é aceito.
- Aplicação explícita; campos vazios não criam limites de preço.
- Escala completa do destino; precisão de centavos; valores manuais fora da escala preservados.
- Filtrar e ordenar antes de contar e paginar dez itens.
- Preservar contexto, recuperação por URL e acessibilidade.
- Não modificar o seed nem as alterações anteriores da página do hotel.
- Reutilizar o checkout atual; trabalhar na branch local codex/filtros-multiplos, sem commits ou publicação automáticos.

## Review Focus

- Correspondência exata de comodidades, sem aceitar nomes que só contenham o texto procurado — teste de integração real da consulta.
- Restaurar seleções por histórico e URLs duplicadas/desconhecidas — testes de contrato e navegador.
- Slider não deve ativar um limite intocado, inclusive por teclado — teste de interação.
- Igualdade, diária única, preço fora da escala e erro independente da escala — testes do formulário.
- Respostas atrasadas e troca de destino não devem reescrever uma seleção atual — revisão da integração com consultas e navegador.

## Task 1 — Contratos e consulta (Spec 01)

**Files:** features/search/model.ts; features/hotels/api.ts; features/hotels/hooks.ts; tests/catalog-filters.test.ts; tests/mock-api.test.ts.

**Interfaces:** Filters acrescenta amenities e propertyTypes; parseFilters aceita getAll; getHotels mantém retorno paginado; getHotelFilterOptions(signal?) retorna hotéis validados usados para escala e presença global de aircon.

- [x] Escrever testes de round-trip, deduplicação, opções inválidas, centavos e combinação antes da paginação.
- [x] Executar os testes e observar as falhas esperadas.
- [x] Implementar listas fechadas, normalização e consulta com correspondência exata de todas as comodidades e tipos alternativos.
- [x] Adicionar consulta independente das opções, com dados validados e cancelamento.
- [x] Executar os testes de contrato e integração. Esperado: testes aprovados com total correto.

## Task 2 — Controles e formulário (Specs 02 e 03)

**Files:** app/search/_components/filters.tsx; app/search/_components/price-filter.tsx; components/ui/slider.tsx; components/ui/checkbox.tsx; app/globals.css; tests/filters.test.tsx.

**Interfaces:** FiltersForm recebe search, filters e options com extremos, presença de aircon, estado de carregamento/erro e nova tentativa. PriceFilter edita minPrice/maxPrice pelo contexto do formulário. Slider oferece rótulos por controle e edição individual do limite ativo.

- [x] Escrever testes de edição sem aplicar, slider/campo, limite intocado, campos fora da escala, lista de comodidades, diária única e erro independente.
- [x] Executar e confirmar falhas por funcionalidades ausentes.
- [x] Adicionar Slider/Checkbox via CLI shadcn e compor grupos usando FieldSet/FieldLegend/Field.
- [x] Implementar controles sincronizados, mensagens, formatação, seleção múltipla e indicador de edição pendente.
- [x] Adaptar estilos aos tokens existentes e largura estreita.
- [x] Executar os testes de interação. Esperado: todos aprovados.

## Task 3 — Jornada e validação (Specs 04 e 05)

**Files:** app/search/_components/content.tsx; tests/e2e/filters.spec.ts; README.md; docs/prd/feature-filtros-multiplos.md.

**Interfaces:** useCatalog acrescenta options; conteúdo passa opções e estado independente ao formulário. Paginação, links e histórico usam a serialização completa da Task 1.

- [x] Escrever e executar testes do navegador de combinação, refresh, histórico, detalhes, limpeza e teclado/mobile; confirmar falha antes da integração.
- [x] Integrar opções, atualizar mensagens de filtros inválidos e anunciar carregamento.
- [x] Confirmar consulta mais recente via chaves e cancelamento existentes; garantir remount do formulário por URL.
- [x] Rodar testes, typecheck, lint, build e formatação dos arquivos alterados; inspecionar desktop/mobile em uma rodada, corrigir problemas e confirmar.
- [x] Fazer revisão final independente conforme executing-plans; corrigir achados relevantes e repetir testes afetados.
- [x] Documentar comportamento e evidências; marcar PRD implementado apenas após concluir as cinco specs.

## Registro de execução

- Planejamento: PRD aprovado pelo usuário ao solicitar implementação. Execução direta no checkout existente; branch local criada, alterações anteriores preservadas.
- Pre-flight: Tasks 2 e 3 consomem as seleções normalizadas da Task 1; Task 3 fornece opções independentes ao formulário da Task 2. Nenhum conflito de interface identificado.
- Decisão técnica: expressão de comodidades construída somente a partir de uma lista validada, sem aceitar expressões fornecidas por usuários. Mantém semântica original dos demais consumidores da API.
- Task 1: complete — testes de contrato e API isolada passaram; combinação, correspondência exata, total e segunda página verificados.
- Task 2: complete — testes do formulário passaram; teclado, limites opcionais, escala vazia/única/indisponível e disponibilidade de ar-condicionado verificados.
- Task 3: complete — 37 testes unitários/integração e oito testes de navegador aprovados; typecheck, lint, build e format:check aprovados; inspeção desktop/mobile concluída.
- Final review: revisão independente executada por review_filters. Um P2 confirmado: reaplicar seleções equivalentes deixava o aviso pendente. Teste de regressão observado falhar e passar após redefinir o formulário com valores normalizados; suíte completa aprovada após a correção.
- Execução: o CLI shadcn falhou por cache global incompleto e lock de cache local; instaladas as primitivas oficiais Radix e adicionados os componentes locais conforme documentação shadcn. Nenhuma mudança nas regras funcionais.
- Validação: uma execução concorrente do teste legado de reserva teve timeout na confirmação; o teste isolado e depois a suíte completa com um worker passaram sem alterar o código de checkout ou o teste legado.
- Integração: alterações mantidas na branch local, sem commit, merge ou publicação automática. Nenhum achado de revisão foi adiado.
