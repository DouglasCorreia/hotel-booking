# Lumina Hotels

Aplicação de busca e reserva **simulada** de hotéis, em português brasileiro. Inclui o frontend e a mock-api fornecida, sem depender de arquivos em Downloads.

## Executar localmente

Requisitos: Node.js 24 LTS e npm.

```bash
npm ci
```

Copie `.env.example` para `.env.local` e ajuste o endereço da API se necessário:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Abra dois terminais na raiz do projeto:

```bash
# Terminal 1 — API
npm run api
```

```bash
# Terminal 2 — frontend
npm run dev
```

Abra [Lumina Hotels](http://localhost:3000). O endereço do backend é configurado pela variável de ambiente; não há URL local fixa no cliente HTTP. Alterou a variável? Reinicie o frontend. Ao gerar um build, o endereço público é incorporado ao bundle.

## Funcionalidades

- Busca com autocomplete, debounce, cancelamento de consultas obsoletas e operação por teclado.
- Validação de calendário, estadias de uma a trinta noites e ocupação.
- Busca compartilhável pela URL, dez hotéis por página, filtros de diária/avaliação e ordenação.
- Detalhes, galeria ampliada, comodidades, políticas e seleção de um tipo de quarto.
- Validação de estoque e capacidade incluindo crianças, com um adulto por quarto.
- Checkout em três etapas com dados por hóspede, CPF do titular, pagamento simulado e rascunho na mesma aba.
- Cupom, taxa e imposto demonstrativos no resumo do preço, com aceite obrigatório dos termos.
- Revalidação de preço e estoque antes de concluir, com aceitação explícita de novo preço.
- Criação sem retry automático e proteção contra submissões simultâneas.
- Confirmação lida da API, com resumo contratado preservado e funcionamento após refresh.
- Imagens otimizadas, fallback de imagens, skeletons, estados vazios e recuperação de erros.
- Layout mobile, foco visível, link para pular navegação e formulários com erros associados.

## Stack e arquitetura

Next.js 16.4.6 (App Router), React 19.3, TypeScript estrito, Tailwind CSS 4, componentes shadcn/ui, TanStack Query v5, Zustand, React Hook Form e Zod. A fonte Montserrat é servida localmente pelo projeto.

```text
app/                 Rotas Server Components e _components específicos
components/          Shell, feedback, imagens, resumo e primitivas de UI
features/search/     Datas, ocupação, URL e formulário compartilhado
features/hotels/     Contratos, consultas e hooks de catálogo e quartos
features/booking/    Regras, reserva, seleção temporária e fluxo do checkout
lib/                 Cliente HTTP, erros, formatação e utilitários
scripts/             Inicialização da API simulada
mock-api/            Somente dados iniciais e banco transitório da simulação
tests/               Regras, contratos HTTP, checkout e testes de navegador
docs/prd/            PRD funcional aprovado
```

As rotas mantêm suas entradas no servidor. Consultas e interações utilizam componentes cliente. A estrutura estática é prerenderizada e as rotas com identificadores usam Suspense. Hotel e quarto são revalidados em paralelo no checkout. A URL é a fonte da busca e TanStack Query controla dados remotos. Zustand guarda em `sessionStorage` a seleção e o rascunho com nomes, contato, cupom e progresso. CPF e cartão ficam apenas em memória.

O cliente HTTP valida respostas com Zod, aplica timeout de 12 segundos e distingue ausência, falha de serviço e resultado incerto. Consultas podem ter duas novas tentativas; mutações nunca são repetidas automaticamente. O bloqueio síncrono do checkout evita dois envios antes de React atualizar o botão.

A aplicação usa os endpoints existentes para salvar os hóspedes, o contato do titular, a composição do preço e o registro de aceite. Os contratos utilizados pela aplicação são definidos com Zod e os tipos são derivados dos schemas.

O servidor é uma ferramenta de desenvolvimento executada por `scripts/mock-api.mjs`. Sua dependência `json-server` 0.17 está nas dependências de desenvolvimento do manifesto principal e no lockfile da raiz. A instalação completa na raiz atende tanto o frontend quanto a API; não existe instalação separada do backend.

## Rotas

| Rota                        | Uso                                    |
| --------------------------- | -------------------------------------- |
| `/`                         | Pesquisa e hotéis em destaque          |
| `/search`                   | Catálogo com contexto na URL           |
| `/hotel/[hotelId]`          | Detalhes e seleção                     |
| `/checkout`                 | Hóspedes, pagamento simulado e revisão |
| `/confirmation/[bookingId]` | Consulta da confirmação                |

## Verificações

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```

Para os testes de navegador, instale o Chromium do Playwright se necessário:

```bash
npx playwright install chromium
npm run test:e2e
```

No Windows, a configuração aproveita o Google Chrome quando encontrado no caminho padrão. A variável `PLAYWRIGHT_CHANNEL` pode selecionar outro canal instalado, como `msedge` ou `chromium`.

Playwright inicia frontend e API automaticamente quando estão desligados. Localmente reutiliza os serviços em 3000/3333; confira se o frontend existente aponta para a mesma API. Em CI inicia seus próprios processos. Os testes criam reservas demonstrativas no banco transitório.

Os testes cobrem regras de busca e filtros, validação de CPF e cartão, cálculo em centavos, falhas de criação, mudança de preço e estoque, duplo envio, restauração do rascunho e consulta da confirmação após recarregar. CPF e cartão são verificados como ausentes do armazenamento e da requisição de criação.

## Simular lentidão e erros

```bash
npm run api -- --delay 2000
npm run api -- --fail-rate 0.3
```

Reinicie a API com a opção desejada. Também são aceitos `_delay=3000` e `_fail=1` nas requisições, conforme a documentação abaixo. Bonito, MS não tem hotéis propositalmente; Rio e São Paulo possuem mais de uma página; existem hotéis esgotados e quartos com capacidades diferentes.

## Referência da API simulada

O comando `npm run api` usa a porta 3333, endereço `localhost` e atraso de 300 ms por requisição. Flags têm precedência sobre variáveis de ambiente:

| Flag          | Variável    | Padrão      | Uso                                        |
| ------------- | ----------- | ----------- | ------------------------------------------ |
| `--port`      | `PORT`      | `3333`      | Porta do servidor                          |
| `--host`      | `HOST`      | `localhost` | Endereço de escuta                         |
| `--delay`     | `DELAY`     | `300`       | Atraso em milissegundos                    |
| `--fail-rate` | `FAIL_RATE` | `0`         | Proporção de falhas simuladas, entre 0 e 1 |

Passe flags depois de `--`:

```bash
npm run api -- --delay 0
npm run api -- --port 4000 --host 0.0.0.0
npm run api -- --fail-rate 0.2
```

Ao mudar a porta, ajuste `NEXT_PUBLIC_API_URL` e reinicie o frontend. O servidor resolve os dados pela própria localização, mesmo quando executado por caminho absoluto a partir de outro diretório.

### Endpoints

| Método e caminho         | Comportamento                                           |
| ------------------------ | ------------------------------------------------------- |
| `GET /suggestions?q=sao` | Sugestões; busca sem diferenciar acentos                |
| `GET /hotels`            | Lista de hotéis com filtros, ordenação e paginação      |
| `GET /hotels/:id`        | Detalhes; retorna 404 para um hotel inexistente         |
| `GET /rooms?hotelId=1`   | Quartos de um hotel                                     |
| `GET /rooms/:id`         | Detalhes de um quarto                                   |
| `GET /reviews?hotelId=1` | Avaliações de um hotel                                  |
| `POST /bookings`         | Salva o corpo enviado, gera identificação e retorna 201 |
| `GET /bookings/:id`      | Consulta a reserva salva; retorna 404 se ausente        |
| `GET /bookings`          | Lista as reservas demonstrativas                        |

O destino em `/hotels?destination=...` deve ser exatamente o nome retornado pela sugestão, incluindo acentos. Somente a consulta textual das sugestões normaliza acentos; o campo `searchName` dos dados iniciais sustenta essa busca.

### Filtros, ordenação e paginação

| Parâmetros                                | Exemplo ou finalidade                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `destination`                             | Nome oficial do destino, como `São Paulo, SP`                          |
| `name_like`                               | Parte do nome do hotel, como `Palace`                                  |
| `pricePerNight_gte` e `pricePerNight_lte` | Faixa de diária                                                        |
| `rating_gte`                              | Avaliação mínima, como `4.5`                                           |
| `propertyType`                            | `hotel`, `pousada` ou `resort`; valores repetidos funcionam como OU    |
| `amenities_like`                          | Comodidade; valores repetidos funcionam como OU, não como E            |
| `featured=true`                           | Hotéis em destaque                                                     |
| `_sort` e `_order`                        | `pricePerNight` com `asc`/`desc`, ou `rating`/`reviewCount` com `desc` |
| `_page` e `_limit`                        | Número da página e quantidade de itens                                 |

Uma consulta paginada responde um **array**, com o total no cabeçalho `X-Total-Count`; não responde um objeto paginado. O cliente HTTP monta o resultado utilizado pela interface. Os operadores `_gte`, `_lte`, `_ne`, `_like` e `q` seguem o json-server 0.17.

### Filtros múltiplos na interface

O catálogo combina preço, avaliação, comodidades e tipos de propriedade. Todas as comodidades marcadas são exigidas; basta corresponder a um dos tipos marcados. A aplicação converte as comodidades de uma lista validada em uma expressão de correspondência exata para `amenities_like`, exigindo todos os tokens antes da ordenação, contagem e paginação. Isso preserva o comportamento OU das consultas diretas que repetem `amenities_like`.

O slider tem dois controles, ajustáveis por teclado ou arraste, sincronizados com os campos numéricos e com precisão de centavos. Sua escala considera todas as hospedagens do destino e permanece igual ao editar os demais filtros ou navegar pelas páginas. Valores digitados fora dessa escala continuam válidos e podem resultar em uma busca vazia. Campos vazios não adicionam restrições.

A lista de comodidades oferece Wi-Fi, piscina, estacionamento, café da manhã, academia, spa e restaurante. Ar-condicionado passa a ser oferecido quando cadastrado em uma hospedagem; características exclusivas dos quartos não são usadas para inferir comodidades do hotel. Uma seleção válida já presente no endereço continua removível mesmo sem oferta atual.

Para o catálogo demonstrativo atual de 60 hospedagens, uma consulta independente e validada de `/hotels`, com cache de cinco minutos no cliente, fornece a escala de cada destino e identifica ar-condicionado no catálogo. Se essa consulta falhar, os resultados e a entrada manual de preços continuam disponíveis. Um catálogo maior precisará fornecer esses agregados sem transferir todas as hospedagens.

As alterações só chegam aos resultados depois de “Aplicar filtros”, que retorna à primeira página. Os parâmetros repetidos `amenities` e `propertyTypes` na URL da busca preservam múltiplas seleções em compartilhamento, recarregamento, histórico, paginação e retorno dos detalhes. “Limpar filtros” restaura menor preço, todas as avaliações e primeira página, preservando destino, datas e ocupação. Uma nova submissão da pesquisa principal inicia uma busca sem filtros.

Relacionamentos disponíveis: `/hotels/1?_embed=rooms`, `/hotels/1?_embed=reviews` e `/rooms/1?_expand=hotel`. É possível repetir `_embed` para consultar quartos e avaliações juntos.

### Dados e reservas

- `mock-api/db.seed.json`: dados iniciais versionados; 10 destinos, 60 hotéis, 162 quartos e 328 avaliações.
- `mock-api/db.json`: cópia de trabalho gerada na inicialização e ignorada pelo Git.
- A diária do hotel é a menor diária entre seus quartos; `availableRooms` representa o estoque agregado.
- Os contratos efetivamente aceitos pela aplicação estão nos schemas das features. A confirmação consulta o resumo salvo na criação e também aceita reservas feitas no formato anterior.
- O backend não valida o corpo da reserva. A aplicação executa as validações; isso não transforma o mock em um backend de produção.

Na inicialização, os dados iniciais substituem a cópia de trabalho; reservas anteriores deixam de existir. Para alterar os dados de partida, edite o seed e reinicie. O estoque não varia com datas nem diminui ao reservar. O CORS permanece liberado.

### Falhas, lentidão e diagnóstico

`_delay=3000` substitui o atraso de uma requisição. A presença de `_fail`, por exemplo `/hotels/1?_fail=1`, força status 500 com corpo `{ "error": "Falha simulada pela mock API" }`. `--fail-rate 0.2` simula falha em aproximadamente 20% das requisições.

Se a porta estiver ocupada (`EADDRINUSE`), escolha outra com `--port`. Se o frontend não alcançar a API, confira o processo iniciado pelo comando da raiz, a porta configurada e a variável de conexão. Instale as dependências de desenvolvimento para executar o servidor mock.

## Limitações e decisões

- **Não é uma plataforma de reservas reais.** Não há pagamento, contato com hotel, e-mail, autenticação ou garantia de disponibilidade.
- Estoque é estático, independe das datas e não diminui ao reservar. O frontend valida o que a API informa, sem prometer atomicidade ou segurança de produção.
- Reservas são apagadas a cada reinício da API; `db.json` é transitório e ignorado pelo Git. Os dados iniciais estão em `db.seed.json`.
- Não há idempotência no servidor. Se uma criação perder a resposta, a interface avisa que uma nova tentativa pode duplicar a reserva.
- Nomes dos hóspedes e contato do titular são consultáveis na API demonstrativa por identificador, sem autenticação. Use dados fictícios. CPF e cartão são solicitados novamente ao recarregar e ficam fora da API.
- O cupom `LUMINA10` dá 10% de desconto sobre diária × noites × quartos. A taxa de serviço de 5% e o imposto de 3% são demonstrações e incidem sobre o subtotal após o desconto.
- Cada reserva utiliza um único tipo de quarto. Há no mínimo um adulto por quarto e todas as crianças contam na capacidade.
- Login, comparação dedicada, reviews, mapas, favoritos, pagamento real, edição/cancelamento, histórico e deploy ficam fora do escopo.
- Virtualização e antecipação de detalhes não foram adicionadas: páginas de dez itens não justificam esse custo neste recorte.

Consulte o [PRD](docs/prd/lumina-hotels.md) para as regras e critérios completos.

A reorganização da instalação e dos arquivos está registrada no [PRD de organização da mock-api](docs/prd/feature-organizacao-mock-api.md).

A ampliação do catálogo está registrada no [PRD de filtros múltiplos](docs/prd/feature-filtros-multiplos.md), que inclui os filtros de comodidades e propriedade antes excluídos do recorte inicial.

O [PRD do checkout em etapas](docs/prd/feature-checkout-em-etapas.md) registra as regras do pagamento simulado, do preço e da recuperação do rascunho.
