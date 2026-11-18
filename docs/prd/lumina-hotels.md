# PRD — Lumina Hotels

> Tipo: PRD inicial · Data: 2026-11-16
> **Status:** Implementada
>
> Valores possíveis: “Aguardando implementação” e “Implementada”. Atualizar após validar todas as specs.

## 1. Visão geral

Aplicação web de busca e reserva simulada de hotéis. O visitante pesquisa um destino, informa período e ocupação, compara hotéis pela listagem, escolhe um tipo de quarto e confirma uma reserva. A entrega deve integrar a mock-api fornecida e oferecer responsividade, acessibilidade e recuperação dos principais erros.

## 2. Problema que resolve

Reunir hotéis, quartos, preços e condições em um fluxo consistente, reduzindo o esforço para escolher hospedagem. Este recorte demonstra a experiência: o backend não possui garantias para operar reservas reais.

## 3. Público-alvo

Viajantes brasileiros a lazer ou trabalho procurando hospedagem nos destinos nacionais disponíveis, com clareza de preço e facilidade de reserva. Não haverá diferenciação funcional entre esses grupos.

## 4. Objetivo do recorte atual

Entregar pesquisa, catálogo, detalhes e seleção, checkout e confirmação recuperável. Janela de referência: 8–12 horas, priorizando o fluxo funcional completo e sua confiabilidade.

## 5. Funcionalidades

**Essenciais:** autocomplete; datas e ocupação validadas; busca reconstruída pela URL; paginação de dez hotéis; filtros por preço e avaliação; ordenação por preço, avaliação e popularidade; detalhes, imagens, comodidades e condições; seleção de um tipo de quarto; capacidade e estoque; dados mínimos do titular; criação e consulta da reserva; recuperação da seleção na mesma aba; estados de carregamento, vazio, erro e recuperação; interface acessível e responsiva; API incluída no projeto; testes e documentação.

**Desejáveis:** galeria ampliada operável por teclado e antecipação de detalhes quando houver benefício comprovado. Não podem comprometer os essenciais.

## 6. Fora do escopo

Comparador dedicado; mistura de tipos de quarto; autenticação; favoritos e histórico; dados individuais de todos os hóspedes; CPF e passaporte; idade de crianças; pagamento; cupons e fidelidade; taxas inventadas; mapa e distância; filtros por comodidades e propriedade; reviews e similares; cancelamento e edição; e-mail, QR code e calendário; disponibilidade por data e baixa de estoque; persistência após reinício da API; deploy e infraestrutura.

## 7. Regras de negócio

### Pesquisa e ocupação

- Destino deve corresponder a uma sugestão da API; editar seu texto invalida a seleção até nova escolha.
- Check-in não pode estar no passado; check-out deve ser posterior; estadia de uma a trinta noites.
- Datas são dias de calendário, sem deslocamentos por fuso.
- Adultos e quartos são inteiros positivos; crianças, inteiro não negativo.
- Pelo menos um adulto por quarto; crianças contam na capacidade total sem regras de gratuidade ou idade.

### Seleção e preço

- Uma reserva contém um hotel e um tipo de quarto, na quantidade pedida na pesquisa.
- Quantidade não pode superar o estoque; hóspedes não podem superar capacidade por quarto × quantidade.
- Esgotados podem ser consultados, mas não reservados.
- Diária de hotel na listagem é “a partir de”; total = diária do quarto × noites × quantidade.
- Valores em reais; nenhuma taxa, desconto ou condição inexistente será adicionada.

### Checkout e confirmação

- Exigir seleção válida e nome completo, e-mail e telefone do titular.
- Não persistir dados pessoais do formulário no navegador.
- Recuperar seleção e busca na mesma aba durante a sessão; revalidar preço e estoque no retorno e antes de concluir.
- Mudança de preço exige aceitação do novo total; falta de estoque ou capacidade bloqueia o envio.
- Bloquear submissões simultâneas e nunca repetir automaticamente a criação.
- Confirmação deve recuperar a reserva da API e mostrar seu identificador real.
- Salvar na reserva o resumo da contratação, preservando os preços e as condições confirmadas.

### Limitações da simulação

A disponibilidade é estática e ignora datas. Criar reserva não reduz estoque. A API aceita dados sem validação e perde reservas ao reiniciar. Não há idempotência no servidor: proteção na interface não garante unicidade em falha de comunicação. A aplicação identifica a demonstração e não promete pagamento, bloqueio de quarto ou comunicação com o hotel.

## 8. Fluxos principais

### Buscar e comparar

1. Digitar e selecionar destino.
2. Informar período e ocupação.
3. Corrigir validações e pesquisar.
4. Consultar os resultados com contexto na URL.
5. Filtrar, ordenar, paginar e abrir um hotel.

### Selecionar e reservar

1. Consultar informações e quartos.
2. Selecionar um tipo compatível com a quantidade e ocupação.
3. Conferir seleção, período e preço no checkout.
4. Informar os dados do titular.
5. Revalidar preço e disponibilidade; aceitar mudanças de preço se houver.
6. Criar a reserva simulada e abrir sua confirmação.

### Recuperar contexto

1. Reconstruir busca pela URL após refresh.
2. Recuperar e revalidar seleção no checkout na mesma aba.
3. Recuperar confirmação pela API.
4. Se seleção ou reserva não existir mais, orientar a recuperação.

## 9. Critérios de aceite

- As cinco rotas obrigatórias estão disponíveis e integradas à API.
- Catálogo e reservas não são substituídos por dados inventados nos componentes.
- URL válida reconstrói a pesquisa; entradas incoerentes oferecem correção.
- Filtros e ordenação ocorrem antes da paginação.
- Quartos incompatíveis são bloqueados e o total corresponde à fórmula aprovada.
- Cliques repetidos durante envio geram uma única solicitação da interface.
- Confirmação funciona após refresh enquanto a reserva existir.
- Jornada principal funciona em mobile e por teclado.
- TypeScript, lint, build e testes críticos passam.
- README explica configuração, execução e limitações.

## 10. Stack

Base existente: Next.js 16.4.6 com App Router, React 19.3, TypeScript estrito, Tailwind CSS 4 e ESLint. Complementos: Zustand, TanStack Query v5, React Hook Form, Zod, Prettier, Vitest, Testing Library e Playwright. Componentes de formulário seguem o shadcn/ui exigido pelas regras locais.

Backend: mock-api fornecida baseada em json-server 0.17, incluída no projeto. Endereço da integração configurável por variável de ambiente. Utilizar sugestões, hotéis, detalhes, quartos e criação/consulta de reservas. Não criar novos endpoints nem alterar o comportamento do backend. O armazenamento flexível da reserva permite o resumo da contratação sem exigir CPF ou pagamento.

## 11. Justificativa da stack

Aproveitar a base existente evita trocas desnecessárias. TanStack Query cuida dos dados remotos, Zustand da seleção temporária, URL dos critérios de pesquisa e formulário dos dados em edição. A API acompanha o projeto para uma execução reproduzível sem depender do ZIP em Downloads.

## 12. Fases de construção

1. **Experiência base:** Spec 01 — Navegação e experiência compartilhada.
2. **Descoberta de hospedagem:** Specs 02 — Pesquisa; 03 — Catálogo; 04 — Detalhes e seleção.
3. **Reserva simulada:** Specs 05 — Checkout e criação; 06 — Confirmação recuperável.
4. **Validação da entrega:** Spec 07 — Qualificação integrada e documentação.

## 13. Specs funcionais detalhadas

### Spec 01 — Navegação e experiência compartilhada

- **Fase:** 1.
- **Objetivo (o quê):** conectar as cinco etapas com experiência coerente.
- **Intenção (por quê):** orientar a próxima ação e a recuperação de falhas.
- **Contexto:** página padrão do Next.js e referências Lumina existentes em docs.
- **Atores:** visitante.
- **Descrição do comportamento:** apresentar marca, navegação para busca e padrões de carregamento, vazio, erro e sucesso; adaptar ao espaço e ao teclado; não oferecer ações de recursos excluídos.
- **Entradas e saídas:** navegação → tela solicitada ou recuperação.
- **Dados/entidades envolvidos (conceitual):** etapa, busca e estado de carregamento/falha.
- **Estados e transições:** carregando → conteúdo, vazio ou erro; erro → tentativa ou busca.
- **Regras de negócio:** português brasileiro, reais, demonstração identificada e nenhuma alegação de serviço inexistente.
- **Validações:** ações visíveis devem funcionar ou indicar indisponibilidade.
- **Fluxo do usuário (passo a passo):** acessar etapa; compreender conteúdo; continuar ou recuperar.
- **Casos de borda e erros:** rota ausente, tela pequena, imagem indisponível e erro não impedem navegação.
- **Impacto no existente:** substituir a experiência padrão.
- **Critérios de aceite (Dado/Quando/Então):** dado mobile, quando abrir uma etapa, então o essencial é legível sem rolagem horizontal; dado teclado, quando navegar, então controles funcionam e foco é visível; dada falha, quando apresentada, então há recuperação.
- **Definição de pronto:** padrões aplicados e verificados em desktop, mobile e teclado.
- **Dependências:** nenhuma.
- **Fora do escopo desta spec:** regras específicas de pesquisa, seleção e reserva.

### Spec 02 — Pesquisa de destino, período e ocupação

- **Fase:** 2.
- **Objetivo (o quê):** produzir uma busca válida e reproduzível.
- **Intenção (por quê):** impedir incoerências e preservar contexto.
- **Contexto:** sugestões são fornecidas pela API; pesquisa alimenta o catálogo.
- **Atores:** visitante.
- **Descrição do comportamento:** consultar sugestões após 300 ms sem digitação; selecionar por mouse ou teclado; coletar período e ocupação; impedir respostas antigas de substituir atuais; navegar apenas com dados válidos registrados na URL.
- **Entradas e saídas:** texto, sugestão, datas e quantidades → contexto ou erros associados aos campos.
- **Dados/entidades envolvidos (conceitual):** destino com identificação e nome oficial, período e ocupação.
- **Estados e transições:** edição → consultando → sugestões, vazio ou erro; válido → resultados.
- **Regras de negócio:** aplicar as regras da seção 7 e consultar hotéis pelo nome oficial do destino.
- **Validações:** destino selecionado, datas reais e permitidas, uma a trinta noites, quantidades inteiras e pelo menos um adulto por quarto.
- **Fluxo do usuário (passo a passo):** selecionar destino; informar período e ocupação; corrigir erros; pesquisar.
- **Casos de borda e erros:** ausência de sugestões, API indisponível, alteração do destino e URL inválida permitem correção sem resultados fabricados.
- **Impacto no existente:** página inicial passa a oferecer pesquisa funcional.
- **Critérios de aceite (Dado/Quando/Então):** dado “sao”, quando consultar, então destinos correspondentes são encontrados sem acentos; dado check-out igual ao check-in, quando pesquisar, então bloquear; dadas trinta noites válidas, quando pesquisar, então aceitar; dadas trinta e uma, então bloquear.
- **Definição de pronto:** pesquisa integrada e acessível, com testes das regras e reconstrução pela URL.
- **Dependências:** Spec 01.
- **Fora do escopo desta spec:** histórico, filtros e disponibilidade por data.

### Spec 03 — Catálogo com filtros e paginação

- **Fase:** 2.
- **Objetivo (o quê):** listar e permitir comparar hotéis.
- **Intenção (por quê):** facilitar a escolha por preço e avaliação.
- **Contexto:** API oferece filtros, ordenação, paginação e total separado da lista.
- **Atores:** visitante.
- **Descrição do comportamento:** reconstruir contexto da URL; apresentar nome, imagem, destino, avaliação, diária inicial e esgotamento; permitir faixa de preço, avaliação mínima, ordenação e páginas de dez itens; mudanças de filtros ou ordem voltam à primeira página.
- **Entradas e saídas:** pesquisa, filtros, ordem e página → hotéis, total ou vazio.
- **Dados/entidades envolvidos (conceitual):** hotel, diária inicial, avaliação, número de avaliações, estoque agregado e página.
- **Estados e transições:** carregando → resultados, vazio ou erro; critérios alterados → nova consulta.
- **Regras de negócio:** filtrar e ordenar antes de paginar; menor preço inicialmente; popularidade pelo número de avaliações; contexto preservado ao abrir hotel.
- **Validações:** preços não negativos, faixa coerente, avaliação entre zero e cinco, página inteira positiva e ordenação reconhecida.
- **Fluxo do usuário (passo a passo):** consultar cards; filtrar e ordenar; paginar; abrir detalhes.
- **Casos de borda e erros:** destino ou filtros sem resultados, imagem indisponível e API falhando; página além do total retorna à primeira página válida.
- **Impacto no existente:** novo catálogo integrado.
- **Critérios de aceite (Dado/Quando/Então):** dado destino com mais de dez hotéis, quando listar, então paginar conforme total; dado Bonito, MS, quando pesquisar, então mostrar vazio com recuperação; dada URL compartilhada, quando abrir, então aplicar mesmos critérios; dado filtro alterado em outra página, então retornar à primeira.
- **Definição de pronto:** catálogo e controles integrados, estados e navegação verificados.
- **Dependências:** Specs 01 e 02.
- **Fora do escopo desta spec:** comparador dedicado, infinite scroll, mapa e filtros por comodidades ou propriedade.

### Spec 04 — Detalhes e seleção de quartos

- **Fase:** 2.
- **Objetivo (o quê):** apresentar hotel e selecionar acomodação compatível.
- **Intenção (por quê):** informar a escolha e impedir seleção inválida.
- **Contexto:** hotel e quartos vêm de consultas distintas.
- **Atores:** visitante.
- **Descrição do comportamento:** exibir galeria, descrição, endereço, comodidades, horários, cancelamento e quartos; apresentar capacidade, características, diária e estoque; selecionar a quantidade pedida de um tipo elegível e guardar seleção/contexto para o checkout na mesma aba.
- **Entradas e saídas:** hotel, pesquisa e tipo escolhido → detalhes e seleção ou impedimento explicado.
- **Dados/entidades envolvidos (conceitual):** hotel, quarto, capacidade, estoque, diária, período e ocupação.
- **Estados e transições:** carregando → detalhes ou erro; sem seleção → seleção válida → checkout; contexto alterado → revalidação.
- **Regras de negócio:** um tipo, quantidade dentro do estoque, ocupação dentro da capacidade e um adulto por quarto; não inventar multas ou prazos de cancelamento.
- **Validações:** hotel existente, quarto pertencente ao hotel, contexto válido, estoque e capacidade.
- **Fluxo do usuário (passo a passo):** consultar detalhes; conferir condições; escolher tipo; avançar.
- **Casos de borda e erros:** hotel ausente, quartos ausentes ou incompatíveis, imagem ausente e acesso direto sem período; neste último caso permitir consulta e solicitar contexto antes de reservar.
- **Impacto no existente:** novo detalhe integrado ao catálogo e checkout.
- **Critérios de aceite (Dado/Quando/Então):** dado estoque zero, quando consultar, então seleção fica indisponível; dados dois quartos pedidos e uma unidade disponível, então bloquear; dada capacidade insuficiente incluindo crianças, então explicar; dado acesso sem período, quando reservar, então solicitar completar pesquisa.
- **Definição de pronto:** detalhes integrados e seleção elegível recuperável.
- **Dependências:** Specs 01 e 02; Spec 03 para jornada pelo catálogo.
- **Fora do escopo desta spec:** tipos combinados, calendário de estoque, reviews e comparador.

### Spec 05 — Checkout e criação de reserva

- **Fase:** 3.
- **Objetivo (o quê):** revalidar seleção, coletar dados mínimos e criar reserva.
- **Intenção (por quê):** concluir com preço transparente e falhas explícitas.
- **Contexto:** seleção vem dos detalhes; backend armazena sem validar regras.
- **Atores:** titular.
- **Descrição do comportamento:** recuperar seleção e consultar hotel/quarto; apresentar datas, hóspedes, quantidade, diária, noites e total; coletar nome, e-mail e telefone; revalidar antes de concluir; enviar uma solicitação por vez e navegar pela identificação retornada.
- **Entradas e saídas:** seleção, contexto e titular → reserva criada, validações ou erro recuperável.
- **Dados/entidades envolvidos (conceitual):** titular, hotel, quarto, período, ocupação, quantidade, composição do preço, condições contratadas, identificação e momento de criação.
- **Estados e transições:** recuperando → pronto, inválido ou erro; pronto → validando → enviando → sucesso ou falha; preço alterado → nova aceitação.
- **Regras de negócio:** fórmula da seção 7; sem pagamento; sem persistir dados pessoais; bloquear simultaneidade e retry automático de criação.
- **Validações:** nome e sobrenome, e-mail válido, telefone brasileiro com DDD e dez ou onze dígitos, aceitando formatação e +55; contexto, vínculo, estoque e capacidade válidos.
- **Fluxo do usuário (passo a passo):** conferir; preencher; solicitar confirmação; aceitar alteração se necessária; receber sucesso ou recuperação.
- **Casos de borda e erros:** sem seleção, voltar à busca; seleção inválida conhecida, voltar aos quartos; erro de revalidação mantém formulário em memória; timeout informa resultado incerto e risco de duplicidade, sem afirmar sucesso ou cancelamento.
- **Impacto no existente:** conectar seleção à criação da reserva.
- **Critérios de aceite (Dado/Quando/Então):** dados dois quartos de R$ 200 por três noites, então totalizar R$ 1.200; dado refresh na aba, então revalidar seleção e solicitar novamente dados pessoais; dado preço novo, então exigir aceitação; dado envio ativo, então bloquear outro; dado sucesso, então abrir a confirmação retornada.
- **Definição de pronto:** criação real na mock-api e testes das regras críticas e falhas.
- **Dependências:** Specs 01, 02 e 04.
- **Fora do escopo desta spec:** pagamento, CPF, titulares múltiplos, descontos e idempotência no backend.

### Spec 06 — Confirmação recuperável

- **Fase:** 3.
- **Objetivo (o quê):** consultar uma reserva sem depender da seleção temporária.
- **Intenção (por quê):** preservar consulta após refresh ou navegação.
- **Contexto:** API busca por identificação e perde dados ao reiniciar.
- **Atores:** visitante com endereço da confirmação.
- **Descrição do comportamento:** consultar por identificação e mostrar número, hotel, quarto, datas, ocupação, quantidade, titular e preço contratado; usar resumo salvo, oferecer nova busca e identificar a simulação.
- **Entradas e saídas:** identificação → confirmação, não encontrado ou erro.
- **Dados/entidades envolvidos (conceitual):** reserva e resumo contratado.
- **Estados e transições:** carregando → confirmada, ausente ou erro; erro → tentativa; confirmada → nova busca.
- **Regras de negócio:** sem sucesso antes de consultar; sem recalcular por preço atual; sem promessa de cobrança, e-mail ou garantia real.
- **Validações:** identificação presente e informações suficientes na resposta.
- **Fluxo do usuário (passo a passo):** acessar; aguardar; conferir ou recuperar; iniciar outra busca.
- **Casos de borda e erros:** identificação ausente, reserva apagada, resposta incompleta e indisponibilidade têm tratamento distinto de sucesso.
- **Impacto no existente:** concluir o fluxo.
- **Critérios de aceite (Dado/Quando/Então):** dada reserva existente, quando atualizar sem seleção no navegador, então exibir; dada identificação inexistente, então informar e oferecer busca; dado preço atual alterado, então preservar preço contratado.
- **Definição de pronto:** consulta independente, refresh e erros verificados.
- **Dependências:** Specs 01 e 05.
- **Fora do escopo desta spec:** cancelamento, edição, autenticação, nota fiscal e exportação.

### Spec 07 — Qualificação integrada e documentação

- **Fase:** 4.
- **Objetivo (o quê):** demonstrar funcionamento e execução por outra pessoa.
- **Intenção (por quê):** evitar entrega apenas visual ou dependente de arquivos externos.
- **Contexto:** API e frontend acompanham o projeto; API simula falhas e lentidão.
- **Atores:** desenvolvedor e avaliador.
- **Descrição do comportamento:** incluir API preservada, configurar conexão e documentar requisitos, execução, testes, decisões e limitações; validar regras críticas, jornada, acessibilidade, mobile e falhas simuladas.
- **Entradas e saídas:** projeto, configuração e cenários → execução reproduzível e evidências de validação.
- **Dados/entidades envolvidos (conceitual):** dados iniciais, conexão e reservas de teste.
- **Estados e transições:** API disponível, lenta ou indisponível; interface carregando, funcionando ou recuperando.
- **Regras de negócio:** catálogo vem da API; conexão configurável; banco transitório não substitui dados iniciais versionados.
- **Validações:** TypeScript sem erros e sem any no código desenvolvido; lint, build e testes críticos aprovados.
- **Fluxo do usuário (passo a passo):** obter projeto; configurar; executar frontend/API; concluir e consultar reserva; executar verificações.
- **Casos de borda e erros:** configuração ausente, API desligada, resposta inválida, lentidão e falha oferecem orientação sem dados pessoais em logs.
- **Impacto no existente:** incluir backend e expandir README.
- **Critérios de aceite (Dado/Quando/Então):** dado checkout limpo, quando seguir README, então executar sem ZIP; dada lentidão, então mostrar carregamento; dada falha, então permitir recuperar contexto; dada jornada completa, então criar e recuperar reserva após refresh.
- **Definição de pronto:** documentação reproduzível e verificações concluídas.
- **Dependências:** Specs 01 a 06.
- **Fora do escopo desta spec:** deploy, infraestrutura e garantias adicionais do backend.

## 14. Ordem recomendada de implementação

1. Navegação e experiência compartilhada.
2. Pesquisa de destino, período e ocupação.
3. Catálogo com filtros e paginação.
4. Detalhes e seleção de quartos.
5. Checkout e criação.
6. Confirmação recuperável.
7. Qualificação e documentação.

Incluir a API antes das integrações. Acompanhar cada etapa com testes e documentação; a última spec consolida a entrega. A ordem respeita dependências e evita partes fora de contexto.

**Decisões confirmadas:** PRD inicial; essenciais primeiro; API dentro do projeto sem ampliar comportamento; um tipo por reserva; comparação pela listagem; identidade Lumina simplificada; português brasileiro e reais; titular com dados mínimos; seleção recuperável na mesma aba.

**Padrões adotados:** dez hotéis por página; menor preço inicialmente; filtros de preço e avaliação; dados pessoais não persistidos no navegador; sem implantação.

## Validação da implementação

- Specs 01 a 07 implementadas.
- TypeScript, ESLint, Prettier e build de produção aprovados.
- 23 testes unitários e de integração aprovados.
- Cinco testes Playwright aprovados: jornada com refresh e duplo clique; vazio e hotel inexistente; mobile sem overflow; filtros e paginação; autocomplete por teclado e recuperação de falha simulada.
- Revisão independente concluída. A validação das datas recebidas na confirmação foi corrigida com testes de regressão, mantendo reservas passadas consultáveis.
- Código do servidor e dados iniciais conferidos com o ZIP original por SHA-256, sem alterações.
- Sem publicação, processamento financeiro ou novas garantias do backend.
