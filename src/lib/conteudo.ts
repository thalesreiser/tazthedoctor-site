import { z } from 'astro/zod';
import dados from '../../content/site.json';
import { conteudoSchema, type Conteudo } from './schema.ts';

let carregado: Conteudo | undefined;

/** Loads and validates content/site.json; fails the build with a readable message. */
export function carregarConteudo(): Conteudo {
  if (carregado) return carregado;
  const resultado = conteudoSchema.safeParse(dados);
  if (!resultado.success) {
    throw new Error(`content/site.json inválido:\n${z.prettifyError(resultado.error)}`);
  }
  carregado = resultado.data;
  return carregado;
}
