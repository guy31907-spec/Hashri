/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParsedDocument } from '../types/document';
import { parsePdfFile } from './documentParser';

/**
 * Loads the user's exact sample file from public assets: 20_imm5739_9ff1b988.pdf
 */
export async function loadSampleImm5739(): Promise<ParsedDocument | null> {
  try {
    const res = await fetch('/assets/aistudio/20_imm5739_9ff1b988.pdf');
    if (!res.ok) throw new Error('File not found');
    const blob = await res.blob();
    const file = new File([blob], '20_imm5739.pdf', { type: 'application/pdf' });
    const parsed = await parsePdfFile(file);
    return parsed;
  } catch (err) {
    console.warn('Could not fetch local imm5739 file:', err);
    return null;
  }
}

export async function getSampleDocumentsAsync(): Promise<ParsedDocument[]> {
  const sample = await loadSampleImm5739();
  return sample ? [sample] : [];
}

export function getSampleDocuments(): ParsedDocument[] {
  return [];
}
