# Lumina Hotels — Visão do produto

Atualizado em 19 de novembro de 2026.

A Lumina Hotels é uma demonstração de busca e reserva de hotéis em português brasileiro e inglês americano. O catálogo usa dados da mock API fornecida para o desafio. A jornada permite pesquisar uma estadia, escolher uma acomodação e recuperar a confirmação pelo número da reserva. Os preços são apresentados em reais (BRL) nos dois idiomas.

## Jornada de reserva

| Etapa       | O que o visitante faz                                                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Início      | Escolhe um destino sugerido, informa check-in, check-out e quantidade de adultos, crianças e quartos.                                                                                            |
| Busca       | Compara as hospedagens em páginas de dez resultados. Pode combinar filtros de diária, avaliação mínima, comodidades e tipo de propriedade, escolher a ordenação e compartilhar a busca pela URL. |
| Detalhes    | Consulta galeria, endereço, comodidades, horários e política de cancelamento. Escolhe um tipo de quarto compatível com a ocupação e a quantidade pedida.                                         |
| Checkout    | Preenche os dados dos hóspedes, simula o pagamento, revisa o preço e aceita os termos. A seleção e parte do preenchimento podem ser recuperadas na mesma aba.                                    |
| Confirmação | Consulta a reserva pelo identificador. O resumo preserva a composição do preço aceita no checkout.                                                                                               |

## Regras da estadia e do checkout

- A estadia tem de uma a trinta noites, com check-in a partir de hoje. É preciso pelo menos um adulto por quarto, e crianças contam na capacidade.
- Uma reserva contém um tipo de quarto e pode incluir várias unidades desse tipo, de acordo com o estoque informado.
- O titular ocupa a primeira vaga adulta e informa nome completo, e-mail, telefone brasileiro com DDD e CPF. O código do país `+55` é opcional. Os demais hóspedes informam o nome completo.
- O checkout usa cartões fictícios para demonstrar aprovação e recusa. O rascunho restaura os nomes, o contato e o cupom aplicado na mesma aba. CPF, cartão e aceite dos termos são solicitados novamente após recarregar.
- Ao confirmar a troca de idioma no checkout, o visitante volta à etapa de hóspedes com a seleção, os nomes, o contato e o cupom recuperados. O fluxo solicita novamente o CPF, o cartão de teste e o aceite dos termos.
- O subtotal é a diária multiplicada pelas noites e pela quantidade de quartos. O cupom `LUMINA10` dá 10% de desconto. A taxa de serviço de 5% e o imposto de 3% são simulados e incidem sobre o subtotal após o desconto.
- A criação revalida a disponibilidade, a capacidade e a diária. Se o preço mudar, o visitante precisa aceitar o novo total e os termos antes de confirmar.

## Limites da demonstração

Use dados fictícios. A simulação não realiza cobranças, bloqueios de quartos ou envio de e-mails. O estoque é estático, e a mock API reinicia a partir dos dados iniciais, apagando as reservas criadas desde a última inicialização.

Para rodar o projeto, consulte o [README](../README.md). Para detalhes técnicos, veja a [arquitetura](architecture.md).
