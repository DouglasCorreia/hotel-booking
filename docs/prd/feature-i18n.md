# PRD — Lumina Hotels em português e inglês

> Tipo: PRD de feature · Data: 2026-11-19  
> **Status:** Implementada
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

A Lumina Hotels oferece a jornada demonstrativa de busca e reserva em português brasileiro (`pt-BR`) e inglês americano (`en-US`). O idioma acompanha a navegação, a apresentação do catálogo, a reserva e a experiência offline.

## 2. Problema que resolve

Hoje, visitantes que leem inglês precisam interpretar formulários, descrições de quartos, erros e termos em português antes de conseguir avaliar a demonstração. Isso dificulta pesquisar uma hospedagem, entender as condições do checkout e verificar a confirmação.

## 3. Público-alvo

Visitantes e avaliadores que querem explorar hospedagens brasileiras e concluir uma reserva demonstrativa em português ou inglês. As instruções de teste também atendem a quem desconhece o CPF e o formato de telefone brasileiro.

## 4. Objetivo do recorte atual

Permitir que a mesma pessoa complete e compartilhe a jornada nos dois idiomas. A busca e a reserva representam as mesmas datas, hóspedes, quartos e valores em ambos os endereços.

## 5. Funcionalidades

**Essenciais**

- Seletor de idioma no cabeçalho desktop e no menu mobile, com preferência lembrada ao voltar à página inicial.
- Busca, catálogo demonstrativo, detalhes, checkout, confirmação e estados da PWA em português e inglês.
- Formatação localizada de datas, horários, números e preços em BRL.
- Troca de idioma com preservação dos filtros e recuperação do rascunho do checkout.

**Desejáveis**

Não se aplica. As superfícies da jornada e os estados previstos têm critérios de aceite para esta entrega.

## 6. Fora do escopo

- Conversão monetária, destinos adicionais e novos documentos ou formatos de telefone no checkout.
- Exibição e tradução de avaliações escritas.
- Cobrança, envio de e-mail, bloqueio de quartos e operação com dados pessoais reais.

## 7. Regras de negócio

- A preferência salva muda por meio do seletor. Na entrada pela raiz, a última escolha tem prioridade e `pt-BR` é o padrão. Links diretos indicam o idioma pela rota, com as URLs históricas em português e as inglesas sob `/en-US`.
- Traduzir a apresentação dos dados mantém filtros, estoque, regras de ocupação, política de cancelamento e preços da mesma reserva. Nomes próprios, endereços e dados dos hóspedes são exibidos como registrados.
- Para concluir o checkout, o titular informa um CPF e um telefone brasileiro válidos para teste. Os totais calculados e registrados são em BRL.
- A troca no checkout requer confirmação e retoma a etapa de hóspedes. CPF, cartão e aceite são solicitados novamente.
- A confirmação consulta a mesma reserva nos dois idiomas. Quando faltar uma tradução para conteúdo demonstrativo ou histórico, usar o original com indicação de idioma no documento.

## 8. Fluxos principais

### Fluxo 1 — Alternar o idioma de uma busca

1. A pessoa abre a busca, informa o período e aplica os filtros.
2. Seleciona o outro idioma no cabeçalho ou no menu mobile.
3. A aplicação abre a busca equivalente com os mesmos parâmetros e âncora. A pessoa pode copiar a nova URL e enviá-la a outra pessoa.

### Fluxo 2 — Retomar e confirmar a reserva

1. A pessoa seleciona um quarto, preenche o checkout e decide trocar de idioma.
2. O sistema informa o que será recuperado e solicita confirmação da troca.
3. A pessoa retorna à etapa de hóspedes com a seleção e o rascunho recuperados. Informa novamente CPF e cartão fictícios, revisa o total e aceita os termos exibidos.
4. A confirmação abre no idioma atual. É possível trocar o idioma e consultar a mesma reserva.

### Fluxo 3 — Recuperar a navegação offline

1. Após abrir a aplicação conectada, a pessoa perde a internet e tenta navegar.
2. A tela offline usa o idioma do endereço ou a preferência conhecida na raiz.
3. Quando a rede volta, a pessoa tenta novamente e recupera o endereço original com os parâmetros.

## 9. Critérios de aceite

- Um visitante completa a jornada nos dois idiomas, incluindo a validação de CPF, a recusa do cartão de teste e a revisão de preço.
- A troca e o compartilhamento de uma busca mantêm destino, datas, ocupação, filtros múltiplos, ordenação, página e âncora.
- A troca de idioma no checkout recupera seleção, nomes, contato e cupom. CPF e cartão ficam fora da persistência e da requisição.
- A mesma confirmação exibe o identificador e o total registrados nos dois idiomas, inclusive para uma reserva antiga.
- O seletor funciona por teclado e no menu mobile. Erros, títulos e tela offline acompanham o idioma aplicável.
- O build de produção permite acesso direto às rotas de hotel e confirmação nos dois idiomas. As traduções cobrem os textos do catálogo demonstrativo da entrega.

## 10. Stack

Next.js App Router, React, TypeScript, Tailwind CSS e shadcn/ui na interface. Zod valida entradas e contratos, TanStack Query gerencia dados remotos, React Hook Form opera os formulários e Zustand guarda o rascunho da sessão. O catálogo e as reservas da demonstração usam a mock API baseada em json-server. A PWA preserva sua identidade de instalação.

## 11. Justificativa da stack

O App Router oferece resolução de idioma pela rota e renderização no servidor. Os formulários, contratos e dados demonstrativos existentes atendem aos dois idiomas. A localização do catálogo exige cobertura editorial para 47 descrições distintas de hotéis, 24 descrições e 22 nomes de quartos presentes no conjunto atual. [Guia de internacionalização do Next.js](https://nextjs.org/docs/app/guides/internationalization)

## 12. Fases de construção

| Fase                        | Objetivo                                                    | Specs         |
| --------------------------- | ----------------------------------------------------------- | ------------- |
| 1. Navegação                | Estabelecer a escolha de idioma e o compartilhamento.       | Spec 01       |
| 2. Jornada                  | Examinar hospedagens e concluir a reserva nos dois idiomas. | Specs 02 e 03 |
| 3. Acessibilidade e offline | Cobrir os estados da aplicação e verificar a PWA.           | Spec 04       |

## 13. Specs funcionais detalhadas

### Spec 01 — Idioma e navegação

- **Fase** — Navegação.
- **Objetivo** — Disponibilizar versões em português e inglês para início, busca, hotel, checkout e confirmação.
- **Intenção** — Permitir escolher o idioma e compartilhar um link que reproduza a mesma página e o mesmo contexto.
- **Contexto** — O cabeçalho mostra o idioma e a moeda. A busca já usa a URL para representar filtros e paginação.
- **Atores** — Visitante e destinatário de um link compartilhado.
- **Comportamento** — O seletor fica no cabeçalho desktop e no menu mobile. A troca abre a página equivalente, preserva os parâmetros e a âncora e registra a preferência. A navegação interna segue o idioma ativo ao voltar à página inicial. A entrada pela raiz usa a preferência disponível ou português.
- **Entradas e saídas** — Idioma ativo, escolha explícita e URL atual produzem a nova URL, o idioma do documento e a preferência.
- **Dados envolvidos** — Idioma, URL, parâmetros de busca, âncora e identificadores de hotel ou reserva.
- **Estados e transições** — Primeira visita em português, acesso direto em inglês ou português e troca explícita em qualquer direção.
- **Regras de negócio** — Usar `/en-US` para as páginas em inglês. As rotas portuguesas continuam disponíveis nos endereços históricos. Links diretos têm prioridade sobre a preferência, exceto pela entrada genérica na raiz.
- **Validações** — Aceitar apenas os dois idiomas previstos. Preservar parâmetros repetidos e tratar destinos desconhecidos como páginas não encontradas.
- **Fluxo do usuário** — Abrir uma página, acessar o seletor, escolher o idioma e continuar no contexto correspondente.
- **Casos de borda e erros** — Sem preferência disponível, a entrada pela raiz usa português. Uma rota inglesa ainda funciona quando o navegador bloqueia a persistência.
- **Impacto no existente** — Links e ações de navegação passam a respeitar o idioma atual.
- **Critérios de aceite** — Dada uma busca em português com filtros e âncora, quando a pessoa trocar para inglês, então a URL deve manter os valores e a âncora. Dada a preferência em inglês, quando a pessoa abrir uma URL histórica de hotel e navegar ao início, então a sessão mantém o português nessa navegação.
- **Definição de pronto** — Links diretos, recarga e troca por teclado e toque estão validados nos dois idiomas.
- **Dependências** — Nenhuma.
- **Fora do escopo desta spec** — Idiomas adicionais e troca baseada no idioma do navegador.

### Spec 02 — Busca, catálogo e detalhes

- **Fase** — Jornada.
- **Objetivo** — Entregar pesquisa, filtros, comodidades, políticas e detalhes de hotéis e quartos nos dois idiomas.
- **Intenção** — Permitir a comparação de hospedagens e preços em inglês sem alterar os resultados da pesquisa.
- **Contexto** — A mock API retorna nomes de destinos, descrições, preços e identificadores canônicos de propriedades, comodidades e quartos.
- **Atores** — Visitante que pesquisa e compara hospedagens.
- **Comportamento** — Traduzir rótulos, validações, descrições e tipos de quarto. Exibir nomes próprios e endereços como publicados. Aplicar formatação do idioma ativo a datas, horas, quantidades, avaliações e preços.
- **Entradas e saídas** — O contexto da busca e os dados do catálogo produzem resultados, detalhes e opções de quarto localizados.
- **Dados envolvidos** — Destino, filtros, hospedagem, quarto, comodidades, política, ocupação e valor da diária em BRL.
- **Estados e transições** — Preenchimento, carregamento, resultado, lista vazia, erro e recuperação.
- **Regras de negócio** — Os dois idiomas usam os mesmos identificadores e critérios de filtro, ordenação e seleção. A moeda continua sendo BRL.
- **Validações** — Datas, capacidade e filtros seguem as regras atuais. A cobertura editorial inclui todos os hotéis e quartos do conjunto demonstrativo.
- **Fluxo do usuário** — Buscar por destino, aplicar filtros, abrir uma hospedagem e selecionar um quarto elegível.
- **Casos de borda e erros** — Exibir textos originais sem tradução com identificação do idioma de origem. Exibir orientação localizada para pesquisas inválidas, catálogos vazios e falhas de carregamento.
- **Impacto no existente** — A apresentação passa a depender do idioma. As buscas continuam usando os valores canônicos do catálogo.
- **Critérios de aceite** — Dada a mesma pesquisa nos dois idiomas, quando forem aplicados os mesmos filtros, então a ordem e os identificadores dos resultados coincidem. Dado conteúdo demonstrativo com tradução, quando o visitante abrir o hotel em inglês, então as descrições de hotel e quarto aparecem em inglês.
- **Definição de pronto** — Todo o conjunto demonstrativo tem cobertura e uma entrada sem tradução preserva o texto original.
- **Dependências** — Spec 01, para receber o idioma ativo e manter a navegação.
- **Fora do escopo desta spec** — Tradução de avaliações escritas e conversão de moeda.

### Spec 03 — Checkout e confirmação

- **Fase** — Jornada.
- **Objetivo** — Tornar as três etapas do checkout e a confirmação consultáveis nos dois idiomas.
- **Intenção** — Permitir que a pessoa entenda a simulação, corrija erros e confira o preço que aceitou.
- **Contexto** — O checkout guarda seleção, nomes, contato e cupom na mesma aba. O CPF, o cartão e o aceite ficam em memória. A confirmação lê o resumo registrado no momento do envio.
- **Atores** — Titular da reserva demonstrativa e pessoa que consulta a confirmação.
- **Comportamento** — Traduzir campos, erros, exemplos fictícios, apresentação dos termos e resumo. Avisar antes de trocar de idioma no checkout e, após a confirmação da troca, reabrir a etapa de hóspedes com os dados recuperáveis. A mesma reserva abre nos dois idiomas.
- **Entradas e saídas** — Seleção, rascunho, dados fictícios, aceite, preço e identificador produzem um checkout localizado e a confirmação registrada.
- **Dados envolvidos** — Hóspedes, CPF, telefone, cartão de teste, cupom, condições, total e resumo histórico da reserva.
- **Estados e transições** — Hóspedes, pagamento, revisão, envio e confirmação. Cancelar o aviso de troca preserva a etapa. Confirmar a troca retoma hóspedes. A troca fica indisponível durante o envio.
- **Regras de negócio** — O total exibido na confirmação vem da reserva salva. O conteúdo original de um resumo antigo permanece disponível quando falta tradução. Dados sensíveis de teste ficam fora da persistência e do envio.
- **Validações** — CPF inválido, cartão de teste recusado, indisponibilidade, mudança de preço e aceite dos termos têm feedback localizado.
- **Fluxo do usuário** — Informar hóspedes, simular pagamento, revisar o preço, aceitar os termos e confirmar. Abrir o mesmo identificador nos dois idiomas.
- **Casos de borda e erros** — Cobrir ausência de seleção, preço alterado, falta de internet, resultado incerto e reserva ausente.
- **Impacto no existente** — O rascunho pode ser retomado em outro idioma no mesmo navegador e aba. As confirmações anteriores continuam consultáveis.
- **Critérios de aceite** — Dado um checkout na revisão, quando a troca for confirmada, então nomes, contato e cupom são recuperados e os campos de CPF, cartão e aceite são solicitados novamente. Dada uma reserva antiga, quando aberta em inglês, então exibe o total salvo e conserva textos históricos sem tradução.
- **Definição de pronto** — Jornadas de reserva e recuperação de rascunho foram verificadas, incluindo as falhas e a ausência de CPF e cartão no armazenamento e na requisição.
- **Dependências** — Specs 01 e 02, para navegação localizada e apresentação do quarto e da política.
- **Fora do escopo desta spec** — Pagamento real e suporte a documentos estrangeiros.

### Spec 04 — Acessibilidade, erros e PWA

- **Fase** — Acessibilidade e offline.
- **Objetivo** — Aplicar o idioma a metadados, navegação assistiva e estados de recuperação.
- **Intenção** — Manter a jornada compreensível para quem usa teclado, leitor de tela ou perde a conexão.
- **Contexto** — A PWA instalada usa uma identidade única e uma página de contingência para falhas de rede.
- **Atores** — Visitante no navegador ou na PWA instalada.
- **Comportamento** — Localizar idioma do documento, metadados, rótulos acessíveis, espera, erros e 404. A tela offline usa o idioma da URL ou, na raiz, a preferência conhecida com fallback em português. A ação de tentar novamente recupera o mesmo endereço.
- **Entradas e saídas** — URL, idioma conhecido e disponibilidade de rede produzem o estado de espera, erro ou contingência correspondente.
- **Dados envolvidos** — Idioma, escolha recente, endereço de navegação e identidade da instalação.
- **Estados e transições** — Online, offline e reconectado. Uma página ausente mantém a indicação de erro no idioma da URL.
- **Regras de negócio** — A PWA tem uma identidade de instalação. A busca e a confirmação exigem conexão.
- **Validações** — Seleção por teclado e toque, indicação do idioma do documento, tratamento de links incorretos e recuperação da URL de uma busca offline.
- **Fluxo do usuário** — Acessar o app conectado, abrir um endereço em modo offline, reconectar e tentar novamente.
- **Casos de borda e erros** — Sem preferência conhecida na abertura offline pela raiz, mostrar português. Uma rota direta em inglês usa inglês mesmo quando a preferência indica português.
- **Impacto no existente** — A contingência offline passa a acompanhar a navegação e a escolha registrada.
- **Critérios de aceite** — Dada uma busca em inglês e uma falha de rede, quando o usuário navegar, então vê a tela offline em inglês. Depois de reconectar, a nova tentativa abre a busca com os mesmos parâmetros.
- **Definição de pronto** — A validação de produção cobre rotas diretas, metadados, instalação e contingência nos dois idiomas.
- **Dependências** — Specs 01 a 03, para validar os estados da jornada localizada.
- **Fora do escopo desta spec** — Pesquisar o catálogo ou criar reservas offline.

## 14. Ordem recomendada de implementação

1. Spec 01 — Idioma e navegação.
2. Spec 02 — Busca, catálogo e detalhes.
3. Spec 03 — Checkout e confirmação.
4. Spec 04 — Acessibilidade, erros e PWA.

A resolução do idioma sustenta os fluxos localizados. O catálogo traduzido fornece os rótulos exibidos no checkout. A última fase verifica os estados compartilhados e o comportamento da jornada no build de produção.

## Validação da implementação

Em 19 de novembro de 2026, passaram no ambiente local o build de produção, o typecheck, o lint, 59 testes unitários e de integração, 19 testes E2E e cinco testes da PWA no Chromium. Os testes cobriram a troca de idioma com filtros aplicados, a retomada do checkout, a confirmação de reservas antigas e a recuperação da navegação offline nos dois idiomas.
