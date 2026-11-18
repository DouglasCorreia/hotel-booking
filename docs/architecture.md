# Lumina Hotels — Arquitetura

Atualizado em 18 de novembro de 2026.

## Stack e limites da aplicação

O frontend usa Next.js 16.4.6 com App Router, React 19.3 e TypeScript em modo estrito. Tailwind CSS 4 e componentes shadcn/ui compõem a interface. TanStack Query v5 gerencia as consultas e mutações, React Hook Form controla os formulários, Zod valida dados externos e Zustand mantém a seleção e o rascunho do checkout.

A mock API é um processo separado do frontend. Usa json-server 0.17, iniciado por `scripts/mock-api.mjs` a partir da instalação npm da raiz. O arquivo `mock-api/db.seed.json` contém os dados iniciais versionados. A cada inicialização, o script recria o banco transitório `mock-api/db.json`.

## Publicação da demonstração

O [frontend na Vercel](https://hotel-booking-sandy-one.vercel.app/) usa a [mock API no Render](https://hotel-booking-8pbs.onrender.com/hotels). Na Vercel, `NEXT_PUBLIC_API_URL` é uma variável de configuração do ambiente **Production** com o endereço HTTPS base do Render. O Next.js incorpora o valor durante o build. Mudanças na URL exigem um novo deploy do frontend.

O Render executa a API como um Web Service Node a partir da raiz do repositório. O build usa `npm ci --include=dev` porque `json-server` está em `devDependencies`. O comando `npm run api -- --host 0.0.0.0` inicia o servidor na porta fornecida pelo Render.

## Organização do código

| Diretório                | Responsabilidade                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `app/`                   | Rotas do App Router, metadados, estados de carregamento e erro e componentes específicos das telas.  |
| `components/`            | Layout compartilhado, provedores, imagens, feedback, resumo da estadia e componentes de UI.          |
| `features/search/`       | Formulário de busca, validação de datas e ocupação, filtros e serialização da URL.                   |
| `features/hotels/`       | Schemas Zod, funções HTTP e hooks de consulta para destino, catálogo, hotel e quartos.               |
| `features/booking/`      | Regras de ocupação e preço, validação do checkout, persistência da seleção e integração de reservas. |
| `lib/`                   | Cliente HTTP, formatação e utilitários compartilhados.                                               |
| `scripts/` e `mock-api/` | Inicialização da mock API e dados demonstrativos.                                                    |
| `tests/`                 | Testes de regras, componentes, contratos, integração com a mock API e jornadas no navegador.         |

As props de componentes complexos têm JSDoc junto à declaração TypeScript. Os comentários descrevem a origem dos dados, valores padrão, condições de uso e a precedência entre opções quando isso afeta quem usa o componente.

## Renderização e integração HTTP

- As entradas das rotas são Server Components. Os formulários, filtros e consultas interativas ficam em Client Components. O projeto habilita Cache Components e prefetch parcial. Os parâmetros das rotas de hotel e confirmação são resolvidos sob Suspense.
- Em `/hotel/[hotelId]`, `generateMetadata` consulta o hotel no servidor para montar `Nome do hotel | lumina hotels`. Se a consulta falhar, a rota usa o título genérico. Os detalhes exibidos na tela e a lista de quartos são consultados separadamente no cliente.
- O cliente HTTP usa `NEXT_PUBLIC_API_URL` no navegador e no servidor. O valor entra no bundle, por isso a variável deve conter somente o endereço público da mock API. As imagens remotas do catálogo são carregadas via `next/image` com `images.unsplash.com` na lista permitida.
- As funções das features chamam a mock API diretamente e validam as respostas com Zod. O cliente HTTP define timeout de 12 segundos. As consultas do TanStack Query podem repetir até duas vezes em falhas transitórias. A criação da reserva não tem retry automático.
- O [README](../README.md#referência-da-api-simulada) lista os endpoints, os parâmetros de consulta e as opções para simular lentidão e falhas.

## Estado e fluxo de dados

| Estado                     | Fonte e duração                                                                                                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Busca e filtros aplicados  | A URL guarda destino, datas, ocupação, ordenação, página e filtros. As entradas são validadas com Zod. A API aplica filtros e ordenação antes da paginação e fornece o total em `X-Total-Count`.                        |
| Dados remotos              | TanStack Query cuida do carregamento, cache e novas tentativas. No catálogo, uma consulta independente com cache de cinco minutos fornece a escala de preço dos destinos e identifica se há hotéis com ar-condicionado. |
| Seleção e rascunho         | Zustand usa `sessionStorage`. Persiste a seleção, nomes, contato do titular, cupom e progresso. Uma nova seleção ou uma criação bem-sucedida limpa o rascunho anterior.                                                 |
| CPF, cartão e aceite atual | Vivem em memória durante o preenchimento. A restauração abre a etapa de hóspedes para coletar novamente o CPF.                                                                                                          |
| Reserva criada             | A mock API guarda a reserva até ser reiniciada. A confirmação consulta a API pelo identificador e usa o resumo registrado.                                                                                              |

## Contrato de reserva

O checkout consulta hotel e quarto em paralelo e revalida diária, estoque e capacidade antes de executar `POST /bookings`. Um bloqueio síncrono evita envios simultâneos. Em falhas nas quais a criação pode ter ocorrido, a interface informa que reenviar pode gerar duplicidade.

O corpo da reserva contém o contato do titular, o resumo do hotel e do quarto (`snapshot`) e, nas reservas novas, os nomes dos acompanhantes, a composição do preço e o registro de aceite versionado (`checkout`). CPF e dados do cartão ficam fora da requisição. A confirmação usa `GET /bookings/:id` e aceita reservas antigas sem o bloco `checkout`.

A mock API aceita a criação sem validar o contrato e permite consultar reservas sem autenticação. A disponibilidade não depende das datas e o estoque não diminui ao criar uma reserva.

## Verificação

Vitest e Testing Library cobrem regras, componentes e contratos. Playwright cobre a jornada de busca e reserva, recuperação após recarregar, filtros, falhas e interação por teclado e em viewport mobile. Os comandos e as portas usados estão no [guia de execução](../README.md#verificações).
