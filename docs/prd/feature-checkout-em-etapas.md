# PRD — Checkout em etapas

> Tipo: PRD de feature · Data: 2026-11-18
> **Status:** Implementada

## 1. Visão geral

O checkout da Lumina Hotels conduz o titular da reserva por três etapas: hóspedes, pagamento simulado e revisão. A confirmação da mock API mantém o preço aceito e as informações da estadia.

## 2. Problema que resolve

O formulário original registra apenas o contato do titular. A nova jornada identifica cada hóspede, recupera o preenchimento após recarregar e esclarece a composição do total antes da confirmação.

## 3. Público-alvo

Visitantes brasileiros que simulam uma reserva de hospedagem e avaliadores do desafio frontend.

## 4. Objetivo do recorte atual

Entregar o fluxo completo com validações, recuperação do rascunho e compatibilidade com reservas anteriores.

## 5. Funcionalidades

**Essenciais:** cadastro por hóspede, CPF do titular, rascunho na mesma aba, cartão de teste, cupom, encargos simulados, termos e confirmação consultável.

**Desejáveis:** nenhuma adicional nesta entrega.

## 6. Fora do escopo

Cobrança ou verificação externa de identidade, regras fiscais reais, autenticação, persistência após reinício da API e combinação de tipos de quarto.

## 7. Regras de negócio

- O titular ocupa a primeira vaga adulta. Os demais hóspedes informam apenas o nome completo.
- A demonstração usa dados fictícios. CPF e cartão ficam em memória e são solicitados novamente ao recarregar.
- O cupom `LUMINA10` desconta 10% do subtotal. A taxa de serviço de 5% e o imposto de 3% incidem separadamente sobre a base descontada. Cada linha é arredondada para centavos.
- Apenas o cenário de aprovação permite revisar a reserva. A criação exige aceite dos termos e uma seleção ainda válida.
- A confirmação mostra o valor contratado. Reservas anteriores mantêm seus dados e o resumo original.

## 8. Fluxo principal

1. Selecionar uma acomodação, preencher os dados do titular e informar os nomes dos outros hóspedes.
2. Preencher os campos do cartão de teste e obter aprovação simulada.
3. Revisar a estadia e o total, aplicar ou remover cupom e aceitar os termos.
4. Confirmar a criação e consultar a reserva pelo identificador retornado.

## 9. Critérios de aceite

- Uma jornada com dois adultos e uma criança permite corrigir o CPF, recuperar-se de recusa, aplicar cupom e consultar a confirmação após recarregar.
- O rascunho recupera os campos permitidos e descarta dados de outra seleção. A aceitação de uma nova diária preserva os hóspedes digitados.
- Para R$ 600,00 de subtotal com cupom, as linhas são R$ 60,00 de desconto, R$ 27,00 de taxa, R$ 16,20 de imposto e R$ 583,20 de total.
- Alterações de diária e estoque são detectadas antes de criar a reserva. Um envio duplicado é bloqueado e uma falha incerta é informada ao titular.
- A jornada funciona em mobile e por teclado. O diálogo de termos recebe foco e devolve o foco ao fechar.

## 10. Stack

Next.js, React, TypeScript, Tailwind, shadcn/ui, React Hook Form, Zod, Zustand, TanStack Query e a mock API fornecida.

## 11. Justificativa da stack

A stack existente atende a validação de etapas, o armazenamento do rascunho na aba e o consumo da API de reservas sem novas dependências.

## 12. Fases de construção

1. **Preenchimento** — Specs 01 e 02.
2. **Revisão e criação** — Specs 03 e 04.

## 13. Specs funcionais detalhadas

### Spec 01 — Hóspedes e rascunho

- **Fase:** Preenchimento.
- **Objetivo:** coletar os dados da ocupação selecionada e recuperar o preenchimento na mesma aba.
- **Intenção:** reduzir retrabalho sem reter CPF ou cartão.
- **Contexto:** o checkout recebe a seleção do hotel e revalida a acomodação.
- **Atores:** titular da reserva.
- **Comportamento:** gerar um formulário por vaga, preservar a digitação ao voltar e recuperar nomes, contato, cupom e etapa de um rascunho da seleção atual.
- **Entradas e saídas:** ocupação, nomes, e-mail, telefone e CPF entram na etapa. A validação permite avançar ou mostra erros junto aos campos.
- **Dados e entidades:** titular, acompanhantes, seleção, rascunho e progresso.
- **Estados e transições:** preenchimento, erros, etapa válida e restauração. Após recarregar, a primeira etapa pendente é a de hóspedes por exigir CPF novamente.
- **Regras:** o titular ocupa a primeira vaga adulta. Trocar de seleção ou concluir a reserva encerra o rascunho. Aceitar nova diária para a mesma seleção preserva o preenchimento.
- **Validações:** nome completo, e-mail, telefone, dígitos verificadores do CPF, rejeição de CPF repetido e quantidade de hóspedes.
- **Fluxo:** informar dados, corrigir os campos apontados e avançar ao pagamento.
- **Casos de borda e erros:** rascunho inválido é descartado. Com armazenamento indisponível, a sessão atual funciona em memória.
- **Impacto no existente:** amplia o formulário do titular e as informações temporárias da seleção.
- **Critérios de aceite:** dado um rascunho válido, ao recarregar na mesma aba, os campos permitidos reaparecem e o CPF fica vazio. Dada outra seleção, o formulário começa vazio.
- **Definição de pronto:** restauração, troca, falhas de armazenamento e validações são verificáveis.
- **Dependências:** seleção de acomodação existente.
- **Fora do escopo:** contato ou documento dos acompanhantes.

### Spec 02 — Pagamento demonstrativo

- **Fase:** Preenchimento.
- **Objetivo:** demonstrar validação e recuperação de recusa.
- **Intenção:** permitir a experiência de pagamento em ambiente fictício.
- **Contexto:** entrada após validação dos hóspedes.
- **Atores:** titular da reserva.
- **Comportamento:** apresentar um número de teste para aprovar, outro para recusar e instruções de validade e código de segurança.
- **Entradas e saídas:** número, validade e código fictícios entram. A tentativa aprova, recusa ou aponta um campo inválido.
- **Dados e entidades:** cartão de teste e resultado temporário.
- **Estados e transições:** editando, inválido, recusado ou aprovado. Editar o cartão exige nova simulação.
- **Regras:** dados do cartão ficam em memória e fora da mock API.
- **Validações:** Luhn, número de teste conhecido, validade até o último dia do mês informado e código de três dígitos.
- **Fluxo:** preencher cartão fictício, simular, corrigir uma recusa se necessário e seguir para revisão.
- **Casos de borda e erros:** cartão vencido ou código inválido exibe erro individual. Ao recarregar, os campos voltam vazios.
- **Impacto no existente:** acrescenta etapa entre dados pessoais e revisão.
- **Critérios de aceite:** dado o cartão de recusa válido, ao simular, a etapa permanece aberta. Dado o cartão de aprovação válido, a revisão é exibida.
- **Definição de pronto:** aprovação, recusa, edição e validações são verificáveis.
- **Dependências:** Spec 01.
- **Fora do escopo:** gateway, cobrança e armazenamento de dados de cartão.

### Spec 03 — Preço, cupom e termos

- **Fase:** Revisão e criação.
- **Objetivo:** explicar o total e registrar o aceite das condições demonstrativas.
- **Intenção:** permitir uma confirmação informada após a revisão da estadia.
- **Contexto:** reutiliza diária, período e quantidade de quartos da seleção.
- **Atores:** titular da reserva.
- **Comportamento:** apresentar subtotal, desconto, taxa, imposto e total. Permitir consultar os termos completos e marcar o aceite.
- **Entradas e saídas:** diária, noites, quartos e cupom produzem a composição em reais. O aceite habilita a criação quando a seleção continua válida.
- **Dados e entidades:** cupom, composição de preço e versão dos termos.
- **Estados e transições:** sem cupom, aplicado, inválido ou removido. O aceite inicia desmarcado e é revogado após recarregar ou mudar o total.
- **Regras:** usar os percentuais da seção 7. Um código inválido não remove o cupom já aplicado.
- **Validações:** código único com normalização de caixa e espaços nas extremidades. Aceite obrigatório.
- **Fluxo:** revisar, aplicar ou remover cupom, ler os termos e aceitar.
- **Casos de borda e erros:** mostrar erro no código inválido e manter o último total válido.
- **Impacto no existente:** acrescenta encargos e desconto demonstrativos ao resumo original.
- **Critérios de aceite:** dado o exemplo de R$ 600,00, ao aplicar o cupom, o total é R$ 583,20. Dado aceite ausente, confirmar fica indisponível.
- **Definição de pronto:** valores, remoção do cupom e leitura dos termos por teclado são verificáveis.
- **Dependências:** Specs 01 e 02.
- **Fora do escopo:** regras fiscais reais, cupons cumulativos e promoções dinâmicas.

### Spec 04 — Criação e confirmação

- **Fase:** Revisão e criação.
- **Objetivo:** validar a seleção e recuperar a reserva com os valores aceitos.
- **Intenção:** manter a confirmação fiel ao que o usuário revisou.
- **Contexto:** a mock API cria e consulta reservas pelos endpoints existentes.
- **Atores:** titular da reserva.
- **Comportamento:** revalidar disponibilidade e diária antes de criar. Salvar nomes, contato do titular, composição de preço e registro do aceite. Exibir a composição salva após recarregar a confirmação.
- **Entradas e saídas:** seleção, hóspedes, composição e aceite se tornam uma reserva identificada ou um erro recuperável.
- **Dados e entidades:** reserva, resumo contratado, versão dos termos e data de aceite.
- **Estados e transições:** pronto, verificando, enviando, confirmado, seleção alterada ou falha.
- **Regras:** bloquear envios simultâneos e retry automático. O CPF e os dados do cartão ficam fora do registro. Reservas antigas seguem com o resumo original.
- **Validações:** estoque, capacidade, vínculo do quarto, diária e aceite válido.
- **Fluxo:** confirmar, aceitar novo total se necessário, reenviar explicitamente e consultar a confirmação.
- **Casos de borda e erros:** estoque insuficiente bloqueia criação. Falha preserva o rascunho. Resultado incerto informa risco de duplicidade.
- **Impacto no existente:** amplia os dados de reservas novas sem exigir alteração no comportamento da mock API.
- **Critérios de aceite:** dado duplo clique, apenas uma criação é enviada. Dada alteração de preço, a criação aguarda novo aceite. Dada uma reserva nova ou anterior, recarregar sua confirmação mantém o respectivo resumo.
- **Definição de pronto:** jornada em navegador e verificações de contratos e falhas cobrem os critérios de aceite.
- **Dependências:** Specs 01 a 03.
- **Fora do escopo:** garantias de disponibilidade real, baixa de estoque e idempotência no servidor.

## 14. Ordem recomendada de implementação

Implementar hóspedes e rascunho, pagamento, composição de preço com termos e, por fim, criação e confirmação. Essa ordem permite validar cada transição antes de depender dela na etapa seguinte.
