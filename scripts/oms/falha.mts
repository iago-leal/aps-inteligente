// O modo de falha único do gerador das tabelas da OMS.
//
// O contrato de aquisição §7 exige que o gerador diga **qual arquivo** e **em que
// verificação** parou. Uma classe só, compartilhada pela extração e pelas verificações,
// garante que nenhuma anomalia escape como exceção genérica — e que o mantenedor leia sempre
// a mesma forma de mensagem.
//
// Módulo DEV-TIME: nunca importado por código de aplicação (fronteira do roadmap §5).
// Feature 017-puericultura-crescimento.

export class FalhaDeVerificacao extends Error {
  /** Identificador da verificação do contrato §5 (`V1` a `V7`). */
  readonly verificacao: string;
  readonly arquivo: string;

  constructor(verificacao: string, arquivo: string, motivo: string) {
    super(`[${verificacao}] ${arquivo}: ${motivo}`);
    this.name = "FalhaDeVerificacao";
    this.verificacao = verificacao;
    this.arquivo = arquivo;
  }
}
