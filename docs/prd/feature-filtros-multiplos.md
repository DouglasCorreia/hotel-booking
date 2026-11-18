# PRD — Filtros múltiplos de hospedagens

> Tipo: PRD de feature · Data: 2026-11-17
> **Status:** Implementada
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

Ampliar a seção “Encontre seu ideal” do catálogo Lumina Hotels para combinar faixa de preço, comodidades e tipos de propriedade. O visitante poderá ajustar a diária por um slider com dois controles e campos numéricos sincronizados, selecionar várias comodidades e escolher entre hotel, pousada e resort.

A aplicação continuará acontecendo pelo botão “Aplicar filtros”. Avaliação mínima, ordenação, paginação e compartilhamento da busca pela URL permanecem integrados aos novos critérios.

### Decisões confirmadas pelo usuário

- Entrega de uma feature sobre o catálogo existente.
- Exigir todas as comodidades selecionadas.
- Aceitar qualquer um dos tipos de propriedade selecionados.
- Combinar os grupos de filtros simultaneamente.
- Manter aplicação explícita pelo botão e usar slider com campos mínimo/máximo sincronizados.
- Oferecer uma lista enxuta de comodidades: Wi-Fi, piscina, estacionamento, café da manhã, ar-condicionado quando cadastrado, academia, spa e restaurante.
- Determinar os limites do slider pelos preços do destino, sem alterá-los ao marcar outros filtros.

### Premissas de detalhamento

As regras operacionais abaixo foram definidas neste PRD a partir do comportamento existente e da necessidade de tornar as specs completas; não representam respostas adicionais do usuário: limites de preço inclusivos; precisão de centavos; manutenção de entradas numéricas fora da escala do slider; limpeza dos filtros com preservação da pesquisa; redefinição da página ao aplicar; tratamento de URLs inválidas; acesso por teclado; e recuperação de falhas. Não há pendências de decisão para implementar o recorte aqui descrito.

## 2. Problema que resolve

Hoje o visitante consegue filtrar por preço e avaliação, mas precisa abrir hospedagens individualmente para conferir comodidades e tipo de propriedade. Os campos numéricos de preço também não oferecem uma forma visual de ajustar uma faixa.

A feature reduz esse trabalho ao permitir encontrar hospedagens que atendam simultaneamente ao orçamento, aos serviços desejados e aos tipos de acomodação aceitos.

## 3. Público-alvo

Viajantes brasileiros a lazer ou trabalho que pesquisam nos destinos nacionais do catálogo existente e precisam restringir opções por orçamento e características da hospedagem. Não haverá regras diferentes entre esses perfis.

## 4. Objetivo do recorte atual

Entregar filtros combináveis, compreensíveis e recuperáveis pela URL, com resultados, contagem e paginação coerentes. A mudança abrange a experiência de filtragem e os comportamentos necessários para sustentá-la nos dados demonstrativos existentes.

Este PRD passa a incluir comodidades e tipos de propriedade no escopo atual, substituindo exclusivamente a exclusão desses dois filtros no PRD inicial. As demais limitações do produto permanecem válidas.

## 5. Funcionalidades

**Essenciais:**

- Slider de preço com limites mínimo e máximo ajustáveis e valores visíveis em reais.
- Campos numéricos sincronizados com o slider, inclusive para acesso sem arraste.
- Escala baseada em todos os preços de hospedagens do destino, antes dos filtros e da paginação.
- Seleção múltipla das comodidades aprovadas e dos três tipos de propriedade.
- Combinação com avaliação mínima e ordenação existentes.
- Separação entre filtros em edição e filtros efetivamente aplicados.
- Aplicar, limpar, compartilhar, recarregar e navegar pelo histórico sem perder o estado aplicado.
- Filtros e ordenação sobre o conjunto completo, antes da contagem e paginação de dez itens.
- Estados de carregamento, ausência de resultados, validação e falha recuperável.
- Operação por teclado e toque, com adaptação à largura de tela.

**Desejáveis:**

Nenhuma funcionalidade adicional neste recorte. A entrega prioriza a combinação correta dos filtros e a consistência da experiência existente.

## 6. Fora do escopo

- Aplicação automática a cada alteração.
- Contadores por opção, histogramas, sugestões de flexibilização e grupos adicionais de filtros.
- Filtros de características exclusivas de quartos, como vista, cama, varanda ou banheira.
- Inferir comodidades pelos nomes, descrições ou quartos da hospedagem.
- Ampliar a lista aprovada para todas as comodidades do catálogo.
- Criar um painel administrativo para cadastrar comodidades ou propriedades.
- Disponibilidade real por data, bloqueio de estoque e reservas reais.
- Alterar regras de checkout, confirmação, preço contratado ou ocupação.
- Alterar os valores iniciais de datas da pesquisa, discutidos anteriormente no chat.
- Reformular toda a página de resultados ou introduzir uma nova stack.
- Implantação, autenticação, favoritos, mapas e pagamentos.

## 7. Regras de negócio

### Combinação e origem dos dados

1. Os grupos se combinam por E: destino E preço E avaliação E comodidades E tipo de propriedade.
2. Dentro de comodidades, a hospedagem deve possuir todas as selecionadas. Wi-Fi e piscina exclui uma hospedagem que só tenha uma delas.
3. Dentro de tipos de propriedade, basta corresponder a um dos selecionados. Hotel e pousada inclui ambos e exclui resort.
4. Nenhuma seleção em um grupo significa ausência de restrição naquele grupo. Todos os tipos selecionados equivalem a aceitar os três tipos.
5. Comodidades correspondem a características cadastradas na hospedagem. Não consultar os quartos para inferir que um hotel oferece determinada comodidade.
6. A lista permitida é Wi-Fi, piscina, estacionamento, café da manhã, academia, spa, restaurante e ar-condicionado quando existir registro dessa comodidade em alguma hospedagem do catálogo. Atualmente não há esse registro no nível da hospedagem; não inventar dados para disponibilizar a opção.
7. Uma opção selecionada em uma URL válida continua visível e removível mesmo que os dados atuais já não ofereçam correspondências. Ausência de correspondências não autoriza descartar o filtro.
8. Considerar todas as hospedagens do destino para filtrar e ordenar; calcular o total filtrado e só então separar páginas. Nunca restringir a filtragem aos dez itens visíveis.
9. A faixa utiliza a diária “a partir de” da hospedagem, já exibida no catálogo, e não o total da estadia nem o preço de todos os quartos. Não representa garantia de disponibilidade para as datas.

### Preço e escala

10. Preços devem ser números finitos, não negativos, com até duas casas decimais. Mínimo não pode superar máximo; valores iguais são permitidos. Limites são inclusivos.
11. Campo mínimo vazio significa sem limite inferior; campo máximo vazio significa sem limite superior. Não transformar um campo vazio em um filtro de preço ativo.
12. A escala do slider usa o menor e o maior preço de todas as hospedagens do destino, sem considerar preço selecionado, comodidades, tipos, avaliação, ordenação ou página. Não usar apenas a página corrente para calcular os extremos.
13. A escala permanece estável durante a edição e aplicação desses filtros para o mesmo catálogo e destino. Uma atualização real dos dados pode mudar a escala, mas nunca reescrever silenciosamente os filtros aplicados.
14. Slider e campos são duas formas de editar a mesma faixa. Arrastar ou usar o teclado atualiza o campo correspondente; digitar um valor válido atualiza o controle correspondente. Os controles não se cruzam.
15. Preservar a possibilidade existente de digitar valores fora da escala do destino. Não limitar ou arredondar silenciosamente esses valores: mostrar o controle na extremidade mais próxima e indicar que o valor digitado está fora da escala. O filtro efetivo continua sendo o valor numérico informado. Ao mover esse controle novamente, o novo valor passa a estar dentro da escala.
16. Sem filtros de preço, os controles aparecem nos extremos da escala, mas os campos continuam representando ausência de restrição. Operar um controle torna explícito apenas o limite editado. Limpar um campo remove esse limite.
17. Se houver um único preço no destino, informar a diária única e desabilitar o arraste sem impedir os campos numéricos. Sem hospedagens, não inventar extremos; informar que não há faixa disponível e manter a possibilidade de limpar ou editar filtros.
18. A edição numérica admite centavos e deve informar o formato aceito. No slider, a menor alteração de valor por teclado é de R$ 0,01. A formatação visível deve respeitar reais e convenções brasileiras.

### Aplicação, limpeza e navegação

19. Editar controles não muda resultados, total, URL ou paginação até “Aplicar filtros”. A interface deve distinguir alterações ainda não aplicadas.
20. Aplicar critérios válidos preserva destino, datas e ocupação, mantém a ordenação escolhida e retorna à página 1.
21. Aplicar critérios inválidos mantém a URL e os resultados anteriores, apresenta erro junto ao campo e permite correção. Não converter erro de validação em resultado vazio.
22. “Limpar filtros” remove preços, comodidades e tipos, restaura todas as avaliações, ordenação por menor preço e página 1. Preserva destino, datas e ocupação e descarta edições pendentes, seguindo a limpeza imediata já existente.
23. A URL representa somente o estado aplicado e permite reconstruí-lo integralmente em acesso direto, compartilhamento, recarregamento e voltar/avançar do navegador. Seleções repetidas não geram duplicatas funcionais.
24. URLs antigas sem os novos critérios continuam válidas. Valores desconhecidos, preços inválidos e faixas incoerentes oferecem a recuperação já existente para filtros inválidos, preservando a pesquisa válida; não realizar busca com esses critérios inválidos.
25. Ao mudar de página, preservar todos os filtros aplicados. Se a página solicitada deixar de existir, voltar à página 1 preservando esses filtros.
26. Submeter novamente o formulário principal de pesquisa continua iniciando uma busca sem filtros, como hoje. Recalcular os extremos para o novo destino; não transportar edições pendentes para essa nova busca.
27. Abrir uma hospedagem e usar “Voltar à busca” deve preservar os critérios aplicados que já acompanham a navegação existente.

### Estados e consistência

28. Ausência de resultados deve manter os filtros visíveis, permitir edição e oferecer limpeza. Não remover automaticamente restrições para produzir resultados.
29. Falha de consulta não significa zero resultados: mostrar erro e tentativa novamente preservando o estado aplicado. Uma resposta de busca anterior não pode substituir os resultados da busca mais recente.
30. Falha ao obter a escala de preço desabilita somente o slider e oferece recuperação; os campos numéricos continuam utilizáveis. Resultados disponíveis não devem ser ocultados somente por essa falha.

## 8. Fluxos principais

### Fluxo 1 — Combinar e aplicar

1. O visitante chega ao catálogo com destino, datas e ocupação válidos.
2. Consulta a escala de preço do destino e a seleção aplicada.
3. Ajusta a faixa no slider ou nos campos, marca comodidades, escolhe tipos e, se desejar, altera avaliação e ordenação.
4. Confere as alterações ainda não aplicadas e seleciona “Aplicar filtros”.
5. Se houver inconsistência, corrige o campo indicado sem perder as demais escolhas.
6. Com dados válidos, recebe resultados, contagem e primeira página correspondentes à combinação completa; a URL passa a representar essa combinação.

### Fluxo 2 — Compartilhar e retornar

1. O visitante aplica filtros e navega pelas páginas.
2. Compartilha a busca, recarrega ou abre uma hospedagem.
3. Ao abrir o link ou retornar à busca, encontra os mesmos critérios aplicados e a página correspondente, enquanto os dados permanecerem iguais.
4. Voltar/avançar restaura as seleções e resultados de cada endereço, descartando edições locais ainda não aplicadas.

### Fluxo 3 — Recuperar uma busca sem resultados ou com erro

1. Uma combinação não encontra hospedagens ou a consulta falha.
2. A interface distingue ausência de resultados de falha de carregamento.
3. No vazio, o visitante altera critérios ou limpa os filtros mantendo destino, datas e ocupação.
4. Na falha, pode tentar novamente sem remontar a seleção.
5. Se o endereço contiver filtros inválidos, recebe uma ação para removê-los e recuperar a pesquisa válida.

## 9. Critérios de aceite

- Selecionar Wi-Fi e piscina retorna somente hospedagens que possuam ambas.
- Selecionar hotel e pousada aceita qualquer um desses dois tipos, mantendo todas as demais restrições.
- Preço, avaliação, comodidades e propriedade atuam sobre o catálogo completo antes da contagem, ordenação e paginação.
- Slider e campos apresentam valores coerentes e não aplicam edições automaticamente.
- A escala corresponde aos extremos do destino completo e permanece igual ao alterar outros filtros ou páginas.
- Campos permitem preços válidos fora da escala, inclusive combinações que resultem em zero hospedagens.
- Aplicar retorna à primeira página; paginar conserva os critérios; limpar restaura os padrões sem apagar o contexto da pesquisa.
- URL, recarregamento, compartilhamento e histórico restauram todas as seleções aplicadas.
- Ar-condicionado não aparece como opção comum enquanto não houver cadastro na hospedagem; características de quartos não são usadas como substitutas.
- Há recuperação distinta para valores inválidos, vazio, falha de consulta e falha da escala.
- Todos os controles podem ser usados por teclado e toque, com rótulos, foco visível e mensagens compreensíveis.
- A interface funciona em tela estreita sem rolagem horizontal ou dependência exclusiva do arraste.

## 10. Stack

Reutilizar a stack existente: Next.js 16.4.6, React 19.3, TypeScript, Tailwind CSS, componentes de interface já adotados, React Hook Form, Zod, TanStack Query e API demonstrativa baseada em json-server 0.17.4. A base de validação existente inclui Vitest, Testing Library e Playwright.

Não há exigência de um novo serviço, banco, biblioteca ou framework neste PRD. Eventuais escolhas técnicas para o slider pertencem à implementação.

## 11. Justificativa da stack

O projeto já oferece consulta de hospedagens, formulários validados, estados de carregamento, cache de consultas e reconstrução pela URL. Os dados já incluem preços, comodidades e tipos de propriedade. A ampliação pode aproveitar essa base.

A documentação atual da API descreve múltiplas comodidades como alternativas: Wi-Fi OU piscina. A regra aprovada exige Wi-Fi E piscina. A implementação precisa garantir essa diferença sobre o conjunto completo, preservando contagens e páginas; adicionar opções na interface sem garantir essa regra não atende ao PRD. Este documento define o resultado necessário e deixa a solução técnica para a codificação.

## 12. Fases de construção

### Fase 1 — Regras da consulta combinada

Objetivo: garantir uma interpretação única dos critérios e resultados corretos antes da apresentação dos controles.

- Spec 01 — Consulta combinada e estado aplicado.

### Fase 2 — Controles de filtragem

Objetivo: permitir editar preço, comodidades e propriedades sem mudar prematuramente a busca.

- Spec 02 — Faixa de preço com escala por destino.
- Spec 03 — Seleção de comodidades e propriedades.

### Fase 3 — Jornada integrada e validação

Objetivo: integrar aplicação, recuperação e navegação e comprovar acessibilidade e consistência.

- Spec 04 — Aplicação, limpeza e navegação recuperável.
- Spec 05 — Qualificação da experiência completa.

## 13. Specs funcionais detalhadas

### Spec 01 — Consulta combinada e estado aplicado

- **Fase:** 1 — Regras da consulta combinada.
- **Objetivo (o quê):** obter resultados, total e páginas que respeitem simultaneamente preço, avaliação, comodidades e tipos de propriedade, com estado aplicado reconstruível pela URL.
- **Intenção (por quê):** impedir resultados que atendam apenas parte das preferências e evitar contagens incorretas causadas pela filtragem de uma única página.
- **Contexto:** o catálogo existente filtra preço e avaliação, ordena e pagina dez itens; hospedagens já possuem comodidades e um dos três tipos. A regra de múltiplas comodidades descrita para a API atual é OU e precisa resultar em E nesta experiência.
- **Atores:** visitante pesquisando; pessoa abrindo um link compartilhado.
- **Descrição do comportamento:** interpretar os critérios aplicados, validar seus valores e pesquisar no destino completo. Combinar todos os grupos por E, todas as comodidades por E e os tipos por OU. Ordenar o conjunto filtrado, calcular seu total e disponibilizar a página de dez itens. Ausência de seleção não restringe o grupo. Preservar o significado dos filtros antigos e permitir reconstruir os novos critérios pela URL.
- **Entradas e saídas:** entram pesquisa válida e critérios de preço, avaliação, ordenação, página, comodidades e propriedades; saem lista, total filtrado, página correspondente ou estado explícito de validação/falha.
- **Dados/entidades envolvidos (conceitual):** hospedagem com destino, diária inicial, avaliação, comodidades e tipo; pesquisa com período e ocupação; seleção aplicada e página.
- **Estados e transições:** critérios recebidos → validação → consulta → sucesso com itens, sucesso vazio ou falha; critérios inválidos → recuperação sem executar uma consulta inválida. Uma nova seleção aplicada substitui a anterior; respostas antigas não substituem resultados atuais.
- **Regras de negócio:** limites de preço inclusivos, finitos e não negativos; até duas casas decimais; mínimo menor ou igual ao máximo; usar somente comodidades da hospedagem; aceitar somente a lista aprovada e os três tipos; deduplicar seleções; filtrar antes de paginar; não alterar a disponibilidade simulada.
- **Validações:** pesquisa conforme regras existentes; preços e avaliação válidos; ordenação reconhecida; página inteira positiva; comodidades e propriedades reconhecidas. URLs anteriores sem os novos grupos representam grupos sem restrição.
- **Fluxo do usuário (passo a passo):**
  1. Abrir uma busca válida ou aplicar uma seleção.
  2. Aguardar a consulta com indicação de carregamento.
  3. Consultar lista, total e página consistentes.
  4. Se necessário, corrigir filtros inválidos ou repetir uma consulta que falhou.
- **Casos de borda e erros:** seleção sem correspondências retorna vazio legítimo; seleção duplicada não duplica resultados; tipo ou comodidade desconhecidos acionam recuperação de filtros inválidos; todos os tipos selecionados aceitam os três; comodidade válida sem oferta atual pode retornar vazio; falhas de rede não são tratadas como catálogo vazio.
- **Impacto no existente:** amplia a interpretação dos filtros e a consulta do catálogo. Mantém ordenações existentes, contexto de pesquisa e tamanho de página. O comportamento da combinação de comodidades precisa ser comprovado, sem depender da semântica OU atual.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dadas hospedagens com apenas Wi-Fi, apenas piscina e ambas, quando exigir as duas, então somente a que possui ambas é elegível.
  - Dados hotel, pousada e resort, quando marcar hotel e pousada, então os dois primeiros tipos são elegíveis e resort é excluído.
  - Dada uma seleção de preço, avaliação, comodidades e tipos, quando consultar, então cada item atende a todos os grupos.
  - Dada uma hospedagem compatível fora da primeira página original, quando aplicar filtros, então ela participa do conjunto e da contagem filtrados.
  - Dada uma URL antiga válida, quando abri-la, então os novos grupos não restringem os resultados.
  - Dada uma URL com opção desconhecida ou faixa invertida, quando abri-la, então a interface oferece recuperação e não executa consulta com esses critérios inválidos.
- **Definição de pronto:** combinação, validação, total, ordenação e paginação são verificáveis com casos positivos, negativos e hospedagens originalmente em páginas diferentes; o estado aplicado pode ser recuperado pelo endereço.
- **Dependências:** nenhuma spec desta feature; depende do catálogo e da pesquisa já existentes.
- **Fora do escopo desta spec:** controles visuais, algoritmo técnico de consulta, novos grupos de filtros e alterações na reserva.

### Spec 02 — Faixa de preço com escala por destino

- **Fase:** 2 — Controles de filtragem.
- **Objetivo (o quê):** oferecer edição da faixa por slider de dois controles e campos numéricos sincronizados, com escala derivada do destino completo.
- **Intenção (por quê):** facilitar a escolha visual do orçamento sem perder precisão nem restringir entradas numéricas já aceitas pelo catálogo.
- **Contexto:** a seção atual possui mínimo e máximo numéricos e usa a diária inicial da hospedagem; os novos controles devem editar os mesmos critérios da Spec 01.
- **Atores:** visitante usando mouse, toque, teclado ou tecnologia assistiva.
- **Descrição do comportamento:** obter menor e maior diária do destino antes dos filtros e páginas. Exibir esses extremos e manter a escala ao editar ou aplicar outros critérios. Mostrar controles com rótulos distintos para mínimo e máximo e valores visíveis em reais. Sincronizar campos e controles quando houver valores válidos. Durante uma entrada incompleta ou inválida, manter o texto em edição e indicar o problema sem propagar um valor incoerente ao slider. A edição não aplica a busca.
- **Entradas e saídas:** entram destino, diárias do conjunto completo, faixa aplicada e interações; saem escala, valores em edição e mensagens de validação ou indisponibilidade da escala.
- **Dados/entidades envolvidos (conceitual):** destino, extremos das diárias, limite inferior e superior opcionais, faixa aplicada e faixa em edição.
- **Estados e transições:** carregando escala → disponível, diária única, destino vazio ou falha; faixa aplicada → edição válida ou inválida → aplicação pela Spec 04 ou descarte. Trocar de destino inicia nova escala. Atualização de preços não reescreve filtros existentes.
- **Regras de negócio:** seguir as regras de preço 10 a 18 deste PRD. Extremos visuais sem campos preenchidos não ativam restrições. Valores numéricos fora da escala são preservados e sinalizados; o controle fica na extremidade correspondente sem modificar o filtro efetivo. Operar um controle altera somente seu limite. Não permitir cruzamento dos controles.
- **Validações:** valores finitos, não negativos, até duas casas decimais; mínimo menor ou igual ao máximo. Aceitar zero, igualdade e campos vazios. Informar o formato de entrada permitido e não corrigir silenciosamente um valor inválido.
- **Fluxo do usuário (passo a passo):**
  1. Abrir o catálogo e consultar os extremos do destino.
  2. Arrastar um controle ou usar teclado para definir um limite.
  3. Conferir a atualização do campo correspondente.
  4. Digitar no outro campo e conferir a atualização do outro controle.
  5. Corrigir eventuais erros e aplicar pela ação comum dos filtros.
- **Casos de borda e erros:** diária única desabilita o arraste e mantém os campos; destino sem hotéis não exibe escala inventada; falha da escala oferece nova tentativa e mantém os campos utilizáveis; preços fora da escala não são truncados; limpar um campo remove somente o limite; combinações fora da oferta podem produzir vazio legítimo.
- **Impacto no existente:** acrescenta uma forma de editar os preços e uma referência de escala; mantém a entrada manual e o significado de diária “a partir de”. Não modifica preço de quartos nem total da estadia.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um destino com preços distribuídos por várias páginas, quando carregar o slider, então a escala inclui o menor e o maior preço de todo o destino.
  - Dada uma escala carregada, quando marcar comodidades, mudar avaliação, ordenar ou paginar, então seus extremos permanecem iguais para os mesmos dados.
  - Dado um controle mínimo ajustado, quando seu valor mudar, então o campo mínimo mostra o mesmo valor e os resultados continuam inalterados antes de aplicar.
  - Dado um preço manual dentro da escala, quando a entrada ficar válida, então o controle correspondente representa esse preço.
  - Dado um mínimo superior à maior diária, quando aplicar, então o valor é preservado e pode resultar em vazio, sem ser reduzido à maior diária.
  - Dados campos vazios, quando apenas visualizar o slider, então nenhum filtro de preço é criado.
  - Dado acesso por teclado, quando ajustar um controle, então o valor é anunciado, há foco visível e a menor alteração é de um centavo.
- **Definição de pronto:** campos e slider permanecem coerentes nos casos normais e extremos; escala estável, precisão, teclado, falha, destino vazio e diária única são verificáveis.
- **Dependências:** Spec 01 para o significado e validação dos limites; a aplicação conjunta será concluída na Spec 04.
- **Fora do escopo desta spec:** histograma, contagem por faixa, limites fixos globais e aplicação automática.

### Spec 03 — Seleção de comodidades e propriedades

- **Fase:** 2 — Controles de filtragem.
- **Objetivo (o quê):** permitir seleção múltipla das comodidades aprovadas e de hotel, pousada e resort dentro da seção existente.
- **Intenção (por quê):** permitir que o visitante descreva requisitos de serviços e tipos aceitos sem consultar cada hospedagem individualmente.
- **Contexto:** hospedagens já possuem comodidades e tipo de propriedade. A página de detalhes já apresenta nomes em português; manter terminologia consistente. O catálogo atual não registra ar-condicionado na hospedagem, embora possa haver características de quartos.
- **Atores:** visitante editando filtros ou abrindo uma busca já filtrada.
- **Descrição do comportamento:** apresentar dois grupos claramente identificados, com opções marcáveis individualmente. Comodidades seguem a ordem Wi-Fi, piscina, estacionamento, café da manhã, ar-condicionado quando cadastrado, academia, spa e restaurante. Propriedades seguem hotel, pousada e resort. Informar que são exigidas todas as comodidades marcadas e aceito qualquer tipo marcado. Cada alteração atualiza apenas a seleção em edição; nenhum grupo tem seleção obrigatória.
- **Entradas e saídas:** entram critérios aplicados, opções reconhecidas e ações de marcar/desmarcar; saem seleção em edição e indicação de alterações pendentes.
- **Dados/entidades envolvidos (conceitual):** comodidades da hospedagem, tipo único de cada hospedagem, conjunto de comodidades exigidas e conjunto de tipos aceitos.
- **Estados e transições:** opção não selecionada ↔ selecionada; seleção aplicada → edição pendente → aplicação ou descarte. Abrir uma URL válida restaura a seleção aplicada. Ar-condicionado passa a ser oferecido quando houver cadastro na hospedagem.
- **Regras de negócio:** comodidades por E; propriedades por OU; grupos vazios sem restrição; sem escolha padrão de uma comodidade ou propriedade. Não derivar comodidades de quartos. Não ocultar automaticamente opções com zero correspondências durante a edição, nem remover escolhas válidas sem resultados. Seleção válida restaurada continua removível mesmo sem oferta atual.
- **Validações:** aceitar apenas as oito comodidades reconhecidas e os três tipos; evitar duplicatas; validar entradas externas antes de adotá-las. Rótulos acessíveis devem identificar cada opção e o grupo correspondente.
- **Fluxo do usuário (passo a passo):**
  1. Localizar o grupo de comodidades.
  2. Marcar uma ou mais exigências.
  3. Localizar tipos de propriedade e marcar os aceitos.
  4. Conferir e aplicar a seleção com os demais filtros.
- **Casos de borda e erros:** nenhuma opção marcada não bloqueia consulta; todos os tipos aceitam qualquer um dos três; seleção sem correspondência continua editável; opção desconhecida na URL segue a recuperação da Spec 01; a falta de ar-condicionado no cadastro não é preenchida com dados inventados nem inferência de quartos.
- **Impacto no existente:** amplia a seção de filtros, preservando avaliação, ordenação, ação de aplicação e identidade visual. Não acrescenta opções aos quartos nem cria cadastro administrativo.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado o catálogo atual, quando abrir os filtros sem seleção, então aparecem as sete comodidades cadastradas da lista enxuta e ar-condicionado não é oferecido como opção comum.
  - Dada uma hospedagem com ar-condicionado cadastrado nesse nível, quando as opções forem disponibilizadas, então ar-condicionado também pode ser selecionado.
  - Dado ar-condicionado somente em quartos, quando montar as opções comuns, então isso não habilita a opção da hospedagem.
  - Dadas várias opções marcadas, quando desmarcar uma, então as demais e os outros grupos mantêm seus valores em edição.
  - Dada uma URL válida com comodidades e tipos, quando abrir a busca, então as opções correspondentes aparecem marcadas.
  - Dado uso apenas de teclado, quando navegar pelos grupos, então todas as opções podem ser identificadas, marcadas e desmarcadas com foco visível.
- **Definição de pronto:** os dois grupos podem ser editados e restaurados de modo independente, acessível e fiel aos dados da hospedagem, sem disparar aplicação automática.
- **Dependências:** Spec 01 para as opções válidas, lógica de combinação e recuperação pela URL; aplicação completa na Spec 04.
- **Fora do escopo desta spec:** lista completa das 15 comodidades, Mostrar mais/menos, contadores por opção, características de quartos e administração do catálogo.

### Spec 04 — Aplicação, limpeza e navegação recuperável

- **Fase:** 3 — Jornada integrada e validação.
- **Objetivo (o quê):** integrar os novos controles à aplicação explícita, limpeza, paginação, compartilhamento, histórico e retorno dos detalhes.
- **Intenção (por quê):** evitar que a pessoa perca suas preferências ou veja resultados que não correspondem à seleção aplicada.
- **Contexto:** o catálogo atual já aplica filtros por botão, compartilha o endereço e preserva pesquisa na URL. Aplicar reinicia a página; limpar mantém destino, período e ocupação e restaura padrões.
- **Atores:** visitante filtrando, paginando, compartilhando ou retornando à busca; pessoa abrindo link recebido.
- **Descrição do comportamento:** carregar os controles a partir do estado aplicado. Manter alterações locais identificadas como pendentes até aplicar. Ao aplicar dados válidos, atualizar o endereço e consultar a página 1 com todos os critérios e a ordenação selecionada. Durante o carregamento, identificar a atualização, sem apresentar resultados anteriores como se fossem da nova combinação. Ao limpar, remover todos os critérios opcionais e restaurar menor preço e página 1 imediatamente. Paginação conserva a combinação aplicada. Recarregamento, histórico e compartilhamento reproduzem o endereço vigente, não edições pendentes.
- **Entradas e saídas:** entram edição dos filtros, ações de aplicar/limpar/paginar, endereço e histórico; saem URL aplicada, controles sincronizados, lista, total e estados de recuperação.
- **Dados/entidades envolvidos (conceitual):** contexto da pesquisa, filtros em edição e aplicados, ordenação, página, resultados e estado de carregamento.
- **Estados e transições:** aplicado → edição pendente → validação → carregamento → resultados, vazio ou falha; limpar → padrões aplicados; histórico → restauração do endereço; erro de campos → correção mantendo a seleção restante; erro de consulta → nova tentativa com os critérios aplicados.
- **Regras de negócio:** aplicar volta à página 1; limpar remove preços, avaliação, comodidades e tipos, restaura menor preço e página 1 e preserva pesquisa; compartilhar copia apenas o estado aplicado; histórico descarta edições pendentes; nova submissão da pesquisa principal inicia busca sem filtros. Abrir hotel e retornar conserva a busca aplicada. Respostas de consultas superadas não substituem as atuais.
- **Validações:** todos os filtros e a pesquisa devem ser válidos para aplicar; falha de cópia do link mantém a orientação existente para copiar o endereço manualmente; página fora do total retorna à primeira preservando a combinação.
- **Fluxo do usuário (passo a passo):**
  1. Editar vários grupos sem atualizar a listagem.
  2. Aplicar e acompanhar a atualização para a primeira página.
  3. Paginar ou compartilhar mantendo a combinação.
  4. Abrir detalhes e usar “Voltar à busca”.
  5. Limpar os filtros ou iniciar outra pesquisa quando desejar.
- **Casos de borda e erros:** vazio mantém controles e ação de limpeza; erro de consulta oferece tentativa sem apagar escolhas; falha da escala não invalida preços manuais; valores inválidos no formulário não mudam URL/resultados; URL inválida oferece remoção dos filtros; navegação pelo histórico reconcilia campos, seleções e resultados; dois pedidos sucessivos respeitam o endereço mais recente.
- **Impacto no existente:** estende os fluxos existentes de aplicação, limpeza e navegação a todos os critérios novos. Não muda o fluxo de reserva, as datas iniciais ou a semântica de iniciar uma nova pesquisa.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dada a página 2 com resultados aplicados, quando editar comodidades e preço sem aplicar, então endereço, página e resultados permanecem iguais e há indicação de alterações pendentes.
  - Dada uma edição válida, quando aplicar, então a página passa a 1 e URL, controles, total e resultados representam a mesma combinação.
  - Dada uma combinação aplicada, quando paginar, compartilhar ou recarregar, então todos os critérios são preservados.
  - Dado um hotel aberto a partir da lista filtrada, quando voltar à busca pela ação da página, então os critérios aplicados são restaurados.
  - Dados filtros aplicados e edições pendentes, quando limpar, então os dois estados voltam aos padrões e destino, datas e ocupação permanecem iguais.
  - Dada uma busca com filtros, quando submeter uma nova pesquisa no formulário principal, então os filtros são reiniciados e a escala corresponde ao destino pesquisado.
  - Dadas buscas A e B no histórico, quando voltar ou avançar, então campos, seleções e resultados correspondem ao respectivo endereço.
  - Dada uma consulta que falhou, quando tentar novamente, então os mesmos critérios são utilizados sem nova montagem da seleção.
- **Definição de pronto:** a jornada completa pode ser percorrida e retomada sem divergência entre estado aplicado, controles, endereço, total e páginas, com recuperação nos caminhos de erro.
- **Dependências:** Specs 01, 02 e 03 para consulta correta e controles de todos os grupos.
- **Fora do escopo desta spec:** atualização automática, filtros salvos em conta, novos mecanismos de compartilhamento e reformulação dos detalhes do hotel.

### Spec 05 — Qualificação da experiência completa

- **Fase:** 3 — Jornada integrada e validação.
- **Objetivo (o quê):** comprovar correção funcional, recuperação, acessibilidade e responsividade dos filtros múltiplos integrados ao catálogo.
- **Intenção (por quê):** evitar uma entrega visualmente completa que filtre apenas parte dos dados, perca seleções ou seja inacessível a quem não utiliza mouse.
- **Contexto:** o projeto possui validações automatizadas e jornada de navegador para filtros e paginação. A ampliação deve manter os cenários existentes e acrescentar evidências dos novos comportamentos.
- **Atores:** visitante em computador ou celular, usuário de teclado ou tecnologia assistiva e pessoa validando a entrega.
- **Descrição do comportamento:** verificar a experiência completa com exemplos de comodidades isoladas e combinadas, três propriedades, preços nos limites e fora da escala, resultados em múltiplas páginas e buscas vazias. Percorrer a jornada por mouse, teclado e tela estreita. Verificar recarregamento, compartilhamento, histórico, retorno dos detalhes e falhas distintas da escala e dos resultados.
- **Entradas e saídas:** entram cenários de catálogo e interações representativas; saem evidências verificáveis para os critérios de aceite e identificação de qualquer comportamento divergente antes de considerar a entrega concluída.
- **Dados/entidades envolvidos (conceitual):** as mesmas pesquisas, hospedagens e seleções das Specs 01 a 04. Cenários de validação podem representar diária única e ar-condicionado cadastrado sem modificar artificialmente o catálogo entregue.
- **Estados e transições:** cobrir aplicado, edição pendente, inválido, carregamento, sucesso, vazio, falha e recuperação definidos nas specs anteriores. Esta spec não cria novos estados de produto.
- **Regras de negócio:** validar o conjunto completo antes da paginação; testar explicitamente a diferença entre E e OU nas comodidades; preservar os padrões da busca; não declarar disponibilidade real; não ativar silenciosamente filtros de preço ao visualizar a escala.
- **Validações:** rótulos acessíveis dos controles, valores anunciados do slider, foco visível, operação dos grupos sem mouse, associação dos erros aos campos e apresentação distinta de falha/vazio. Mensagens de atualização e resultados devem ser perceptíveis sem deslocar o foco inesperadamente.
- **Fluxo do usuário (passo a passo):**
  1. Executar uma busca e combinar todos os grupos.
  2. Corrigir faixa inválida e aplicar uma faixa válida.
  3. Paginar, compartilhar, recarregar e retornar dos detalhes.
  4. Repetir edição e limpeza por teclado e em tela estreita.
  5. Exercitar vazio, diária única, ausência de escala e falhas com recuperação.
- **Casos de borda e erros:** incluir valores iguais, zero, campos vazios, centavos, valores negativos/não finitos, faixa invertida, limites fora da oferta, opções duplicadas/desconhecidas, página inexistente, destino vazio e respostas recebidas fora de ordem. Não é necessário acrescentar novas funcionalidades para montar esses cenários.
- **Impacto no existente:** amplia a cobertura dos filtros e protege pesquisa, paginação e navegação existentes. Corrigir divergências encontradas dentro do recorte antes de marcar a feature como implementada.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um hotel compatível fora da primeira página original, quando aplicar os novos filtros, então a listagem e o total o incluem corretamente.
  - Dado um visitante usando somente teclado, quando editar e aplicar todos os grupos, então consegue concluir sem arrastar controles e sem perder o foco visível.
  - Dada uma tela de 390 pixels de largura, quando abrir e operar os filtros, então rótulos, controles e ações permanecem utilizáveis sem rolagem horizontal.
  - Dada falha apenas da escala, quando a consulta de resultados funcionar, então os resultados e campos continuam utilizáveis e o slider oferece recuperação.
  - Dado o endereço compartilhado com todos os grupos, quando abrir uma nova visita e depois recarregar, então a seleção aplicada e o conjunto de resultados são equivalentes para os mesmos dados.
  - Dados os cenários existentes de pesquisa, filtro numérico fora da oferta, limpeza e paginação, quando repetir a jornada, então continuam válidos.
- **Definição de pronto:** Specs 01 a 04 e seus critérios estão comprovados; as verificações de qualidade existentes aplicáveis à implementação foram executadas; não há divergências conhecidas entre controles, URL e resultados nem barreiras de operação por teclado ou tela estreita.
- **Dependências:** Specs 01 a 04 integradas.
- **Fora do escopo desta spec:** auditoria geral de todo o produto, comparação com plataformas externas, métricas de conversão e testes de disponibilidade de produção.

## 14. Ordem recomendada de implementação

1. Spec 01 — Consulta combinada e estado aplicado.
2. Spec 02 — Faixa de preço com escala por destino.
3. Spec 03 — Seleção de comodidades e propriedades.
4. Spec 04 — Aplicação, limpeza e navegação recuperável.
5. Spec 05 — Qualificação da experiência completa.

Seguir essa ordem estabelece primeiro o significado e a correção dos resultados, depois os controles que editam os critérios e, por fim, a jornada integrada. Isso evita construir a interface sobre uma consulta que ainda combina comodidades como alternativas ou calcula os extremos usando somente uma página.

## Validação da implementação

- As cinco specs foram implementadas no catálogo existente, com slider e campos sincronizados, seleção múltipla, aplicação explícita e recuperação pela URL.
- 37 testes unitários e de integração aprovados, incluindo consulta à API real isolada, correspondência exata de comodidades, combinação antes da paginação, precisão monetária, sincronização por teclado, escala indisponível e aplicação de seleções equivalentes.
- Oito testes de navegador aprovados em execução com um worker, incluindo a jornada existente de reserva e confirmação, combinação dos filtros, retorno dos detalhes, histórico, recarregamento, operação do slider em tela estreita e recuperação da escala.
- TypeScript, ESLint, build de produção e verificação de formatação aprovados.
- Inspeção visual de desktop e mobile realizada; controles e ações permanecem utilizáveis sem rolagem horizontal.
- Revisão independente concluída. Um aviso pendente que persistia ao reaplicar a mesma seleção foi reproduzido em teste, corrigido e validado pela suíte completa.
- A escala usa uma consulta independente ao catálogo demonstrativo completo, validada e com cache de cinco minutos. Essa escolha é proporcional ao conjunto atual de 60 hospedagens; não representa uma estratégia para transferir catálogos de grande porte.
