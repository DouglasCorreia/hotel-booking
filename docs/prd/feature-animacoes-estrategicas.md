# PRD — Animações estratégicas na Lumina Hotels

> Tipo: PRD de feature · Data: 2026-11-18  
> **Status:** Aguardando implementação
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

Adicionar movimento discreto a três momentos da busca e reserva simulada. Os efeitos ajudam o visitante a perceber resultados atualizados, reconhecer a etapa atual do checkout e identificar a confirmação da reserva.

## 2. Problema que resolve

No catálogo e no checkout, o conteúdo pode mudar no mesmo lugar após uma ação. Uma transição breve torna a substituição perceptível. Na confirmação, o movimento do ícone reforça o sucesso já comunicado pelo texto.

## 3. Público-alvo

Visitantes da Lumina Hotels que comparam hospedagens e completam uma reserva simulada em desktop ou mobile, inclusive quem usa teclado ou prefere movimento reduzido.

## 4. Objetivo do recorte atual

Aplicar três efeitos localizados durante a jornada de busca e reserva. O visitante pode continuar usando a interface assim que cada estado é apresentado.

## 5. Funcionalidades

**Essenciais**

- Fade de 180 ms quando filtros aplicados, ordenação ou paginação mudarem os hotéis exibidos ou sua ordem.
- Fade de 160 ms no conteúdo ao avançar ou retornar no checkout.
- Destaque de 220 ms no ícone de confirmação, da escala de 94% a 100%.
- Exibição instantânea dos três efeitos com movimento reduzido.

**Desejáveis**

Não se aplica. Os três pontos compõem o recorte acordado.

## 6. Fora do escopo

- Animações na página inicial, na galeria, entre rotas ou em componentes compartilhados.
- Redesenho de telas e mudanças nos fluxos, na API ou nas regras da reserva simulada.

## 7. Regras de negócio

- Os efeitos são complementares à comunicação visual e textual existente. As ações podem ser usadas imediatamente.
- A preferência do sistema por movimento reduzido torna os efeitos instantâneos. Navegação por teclado, toque, foco e mensagens mantêm seu comportamento.
- A interface apresenta apenas os dados da consulta atual. Transições locais mantêm as dimensões do conteúdo e a rolagem horizontal continua desnecessária.

## 8. Fluxos principais

1. O visitante aplica ou limpa filtros, muda a ordenação ou troca de página. Se a sequência de hotéis mudar e houver resultados, o bloco dos cartões aparece com fade.
2. O visitante escolhe um quarto e avança ou retorna entre Hóspedes, Pagamento e Revisão. O indicador é atualizado, o título recebe foco e a etapa ativa aparece com fade.
3. O visitante abre a confirmação após concluir a reserva ou pelo endereço da reserva. Quando a consulta entrega uma reserva válida, o ícone recebe um destaque único na visita.

## 9. Critérios de aceite

- Dado um catálogo com resultados, quando a aplicação de filtros, a ordenação ou a paginação alterar os cartões visíveis ou sua ordem, então somente os cartões recebem o fade.
- Dado um checkout em uso, quando a etapa mudar, então o indicador e o foco acompanham a nova etapa e o formulário anterior fica indisponível imediatamente.
- Dada uma confirmação consultada com sucesso, quando a tela mostrar pela primeira vez a reserva na visita atual, então o ícone recebe o destaque e os detalhes aparecem junto com ele.
- Dada a preferência por movimento reduzido, quando o visitante percorre os três pontos, então a interface apresenta cada estado diretamente e mantém todas as ações acessíveis.

## 10. Stack

Next.js, React, TypeScript e Tailwind CSS compõem a interface existente. Framer Motion é a dependência prevista para os efeitos. As consultas do catálogo e da confirmação continuam usando TanStack Query, e o checkout usa React Hook Form e Zustand para preenchimento e rascunho.

## 11. Justificativa da stack

Framer Motion oferece os efeitos de opacidade e escala necessários. O sistema já distingue carregamento, erro e sucesso e mantém a etapa do checkout, o que permite associar movimento diretamente aos estados relevantes.

## 12. Fases de construção

1. **Busca** — Spec 01, resultados atualizados no catálogo.
2. **Reserva** — Specs 02 e 03, mudança de etapa e confirmação.

## 13. Specs funcionais detalhadas

### Spec 01 — Resultados atualizados no catálogo

- **Fase** — Busca.
- **Objetivo** — Dar feedback visual quando muda o conjunto ou a ordem dos hotéis exibidos.
- **Intenção** — Ajudar quem compara hospedagens a perceber que a lista responde à ação de busca.
- **Contexto** — O catálogo usa filtros aplicados e página registrados na URL e apresenta carregamento, erro e estado vazio.
- **Atores** — Visitantes que filtram, ordenam ou paginam resultados.
- **Descrição do comportamento** — Após aplicar ou limpar filtros, mudar a ordenação ou trocar de página, o bloco dos cartões faz um fade de 180 ms se o resultado válido for não vazio e tiver hotéis diferentes ou em outra ordem. Cabeçalho, formulário, contagem e paginação ficam visíveis independentemente do efeito.
- **Entradas e saídas** — Filtros, ordenação, página e resultados da consulta ativa determinam quais cartões são exibidos e se o fade é acionado.
- **Dados e entidades** — A busca de hospedagem e a sequência de hotéis exibida para cada consulta aplicada.
- **Estados e transições** — A primeira carga apresenta os resultados diretamente. Uma consulta alterada segue o carregamento existente e pode acionar o fade no sucesso. A atualização em segundo plano segue a apresentação normal.
- **Regras de negócio** — A seção 7 se aplica. A edição antes de aplicar filtros e o retorno da mesma sequência de hotéis ficam sem fade.
- **Validações** — O resultado precisa pertencer à consulta ativa, com destino, filtros e página válidos, e deve conter pelo menos um hotel.
- **Fluxo do usuário**
  1. Abrir o catálogo e observar a lista inicial.
  2. Aplicar ou limpar filtros, alterar a ordenação ou selecionar outra página.
  3. Conferir os cartões retornados e escolher uma hospedagem.
- **Casos de borda e erros** — Respostas antigas ficam fora de exibição. Carregamento, falha e lista vazia usam as mensagens existentes. Ao limpar filtros a partir de uma lista vazia, o retorno de cartões pode acionar o fade.
- **Impacto no existente** — A apresentação do bloco de cartões ganha uma transição. O estado da busca continua registrado na URL.
- **Critérios de aceite**
  - Dado um catálogo carregado, quando a ordenação aplicada trocar a ordem ou a paginação trocar os hotéis, então apenas o bloco de cartões faz o fade.
  - Dado um catálogo carregado, quando o visitante apenas editar um filtro ou a consulta aplicada retornar os mesmos hotéis em igual ordem, então o efeito não é reproduzido.
  - Dadas consultas em rápida sequência, quando uma resposta anterior chegar depois da atual, então somente a consulta atual determina o conteúdo exibido.
- **Definição de pronto** — Aplicação e limpeza de filtros, ordenação, paginação, respostas fora de ordem e recuperação de vazio ou erro verificados em navegador, com e sem movimento reduzido.
- **Dependências** — Catálogo e filtros existentes.
- **Fora do escopo desta spec** — Animação individual por cartão, efeitos de rolagem e alterações na consulta ou paginação.

### Spec 02 — Troca de etapa no checkout

- **Fase** — Reserva.
- **Objetivo** — Sinalizar a mudança efetiva entre Hóspedes, Pagamento e Revisão.
- **Intenção** — Ajudar o visitante a se orientar ao avançar ou retornar sem depender de uma mudança de página.
- **Contexto** — O checkout alterna três etapas, mantém dados durante a navegação e restaura parte do rascunho na mesma aba.
- **Atores** — Visitantes que preenchem e revisam uma reserva simulada.
- **Descrição do comportamento** — Na mudança de etapa, o indicador é atualizado imediatamente e o título da etapa recebe foco. A etapa anterior deixa de ser interativa assim que é substituída. O conteúdo da nova etapa faz um fade de 160 ms e aceita interação durante o efeito.
- **Entradas e saídas** — Avanço validado, retorno ou mudança efetiva prevista pelo fluxo acionam o novo conteúdo, o foco e o indicador da etapa ativa.
- **Dados e entidades** — Etapa ativa, dados dos hóspedes, dados de pagamento simulado e revisão da reserva.
- **Estados e transições** — Abertura inicial e restauração exibem a etapa diretamente. Avanço e retorno fazem o fade da etapa de destino.
- **Regras de negócio** — A seção 7 se aplica. Validações, persistência do rascunho e proteção de envio continuam sendo regidas pelo checkout existente.
- **Validações** — O formulário é validado pelo fluxo atual. O efeito depende de uma mudança efetiva de etapa.
- **Fluxo do usuário**
  1. Preencher os dados dos hóspedes e avançar para o pagamento simulado.
  2. Simular um pagamento aprovado e abrir a revisão.
  3. Retornar às etapas anteriores e conferir os dados preenchidos.
- **Casos de borda e erros** — Validação inválida, recusa simulada, alerta de preço e envio em andamento seguem seu tratamento atual. Se a etapa permanecer a mesma, o fade não se repete.
- **Impacto no existente** — O formulário ativo recebe uma transição. O resumo da estadia permanece utilizável e sem efeito.
- **Critérios de aceite**
  - Dada uma etapa preenchida corretamente, quando o visitante avançar pelo teclado, então o título seguinte recebe foco e o formulário anterior não está disponível.
  - Dada a etapa de revisão, quando o visitante voltar até Hóspedes, então os valores preenchidos seguem disponíveis e o indicador identifica a etapa ativa.
  - Dada uma tentativa recusada ou um rascunho recém-restaurado, quando o conteúdo da etapa for apresentado, então o efeito não é reproduzido pela recusa ou restauração.
- **Definição de pronto** — Avanço e retorno, foco, recusa, rascunho, preservação dos dados e proteção contra envio duplicado verificados no fluxo de navegador.
- **Dependências** — Checkout em três etapas existente.
- **Fora do escopo desta spec** — Animações de campos, mensagens e resumo da estadia.

### Spec 03 — Destaque de confirmação

- **Fase** — Reserva.
- **Objetivo** — Destacar o primeiro sucesso da consulta de confirmação em cada visita.
- **Intenção** — Reforçar visualmente que a reserva simulada está disponível.
- **Contexto** — A confirmação consulta a reserva pelo identificador e apresenta um ícone, texto, número e resumo.
- **Atores** — Visitantes que concluem uma reserva simulada ou voltam para consultá-la.
- **Descrição do comportamento** — Na primeira consulta bem-sucedida da visita, o ícone aumenta de 94% a 100% em 220 ms. As informações da reserva são apresentadas assim que estiverem disponíveis.
- **Entradas e saídas** — Identificador e resultado da consulta de reserva. O sucesso exibe a confirmação e pode acionar o destaque do ícone.
- **Dados e entidades** — Reserva simulada e seu identificador.
- **Estados e transições** — Durante carregamento e erro, apresentar o feedback existente. Após o primeiro sucesso, reconsultas na mesma visita ficam sem destaque. Uma recarga ou uma nova visita permite repetir o efeito uma vez.
- **Regras de negócio** — A seção 7 se aplica. O texto continua identificando o caráter demonstrativo da reserva.
- **Validações** — A tela precisa ter recebido uma reserva válida para o identificador em consulta.
- **Fluxo do usuário**
  1. Concluir a reserva ou acessar a confirmação de uma reserva existente.
  2. Ler os detalhes imediatamente após o sucesso da consulta.
  3. Recarregar o endereço para consultar a mesma reserva novamente.
- **Casos de borda e erros** — Reserva inexistente e falha de consulta exibem feedback sem destaque. Se a primeira tentativa falhar e a recuperação tiver sucesso, o destaque pode ocorrer nesse primeiro sucesso.
- **Impacto no existente** — Somente a apresentação do ícone muda. O número e o resumo contratado podem ser consultados durante o efeito.
- **Critérios de aceite**
  - Dada uma consulta bem-sucedida, quando a confirmação aparecer pela primeira vez na visita, então apenas o ícone recebe o efeito.
  - Dada uma confirmação já exibida, quando uma reconsulta terminar na mesma visita, então o efeito não se repete.
  - Dada uma reserva inexistente, quando a API responder, então a interface exibe a mensagem atual sem ícone animado.
- **Definição de pronto** — Sucesso, recarga, reconsulta, reserva inexistente e modo de movimento reduzido verificados em navegador.
- **Dependências** — Tela e consulta de confirmação existentes.
- **Fora do escopo desta spec** — Animações do título, número, resumo e demais elementos de confirmação.

## 14. Ordem recomendada de implementação

Implementar Spec 01, Spec 02 e Spec 03, nessa ordem. Em seguida, verificar a jornada em desktop e mobile, inclusive com movimento reduzido. O recorte e o estilo foram confirmados. As durações e a amplitude documentam os padrões adotados para os três efeitos.
