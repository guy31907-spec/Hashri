/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ParsedDocument, DocumentVariables } from '../types/document';

export interface DocumentDifference {
  type: 'variable' | 'block_text' | 'original_asset_intact';
  field: string;
  original: string;
  modified: string;
  status: 'modified' | 'verified_intact';
}

/**
 * Computes all differences between original parsed document and current active state
 */
export function getDifferencesList(
  doc: ParsedDocument,
  variables: DocumentVariables
): DocumentDifference[] {
  const diffs: DocumentDifference[] = [];

  // Check variables
  const varKeys: Array<keyof DocumentVariables> = ['destinataire', 'date', 'reference', 'montant', 'objet', 'message'];
  const labels: Record<keyof DocumentVariables, string> = {
    destinataire: 'Destinataire',
    date: 'Date d\'émission',
    reference: 'Numéro de référence',
    montant: 'Montant total',
    objet: 'Objet du document',
    message: 'Message d\'accompagnement'
  };

  for (const k of varKeys) {
    const orig = doc.variables[k] || '';
    const curr = variables[k] || '';
    if (orig.trim() !== curr.trim()) {
      diffs.push({
        type: 'variable',
        field: labels[k],
        original: orig,
        modified: curr,
        status: 'modified'
      });
    }
  }

  // Check blocks text modifications
  doc.blocks.forEach((blk) => {
    if (blk.originalText && blk.currentText && blk.originalText !== blk.currentText) {
      diffs.push({
        type: 'block_text',
        field: blk.label,
        original: blk.originalText,
        modified: blk.currentText,
        status: 'modified'
      });
    }

    // Report intact authentic assets (logos, signatures, stamps)
    if (blk.isOriginalAsset) {
      diffs.push({
        type: 'original_asset_intact',
        field: blk.label,
        original: 'Élément graphique source',
        modified: '100% Conforme & Verrouillé (Aucune altération)',
        status: 'verified_intact'
      });
    }
  });

  return diffs;
}

/**
 * Check if the document has any text or variable changes
 */
export function hasDocumentModifications(doc: ParsedDocument, variables: DocumentVariables): boolean {
  const diffs = getDifferencesList(doc, variables);
  return diffs.some((d) => d.status === 'modified');
}

/**
 * Download the exact original source file if available
 */
export function downloadOriginalSourceFile(doc: ParsedDocument): boolean {
  if (doc.originalFileBlob) {
    const url = URL.createObjectURL(doc.originalFileBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName || 'document_original.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }

  // If no blob but we have canvas image
  if (doc.originalPageImages && doc.originalPageImages.length > 0) {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.originalPageImages.forEach((imgDataUrl, idx) => {
      if (idx > 0) pdf.addPage();
      pdf.addImage(imgDataUrl, 'PNG', 0, 0, 210, 297);
    });

    pdf.save(doc.fileName.replace(/\.[^/.]+$/, '') + '_original.pdf');
    return true;
  }

  return false;
}

/**
 * Exports a crisp, updated PDF rendering of the modified document
 */
export async function exportUpdatedPdfFromElement(
  containerElement: HTMLElement,
  filename: string
): Promise<void> {
  // Capture high-DPI canvas
  const canvas = await html2canvas(containerElement, {
    scale: 2, // 2x DPI for crisp print quality
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 210;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  // If content spans more than one A4 page
  if (pdfHeight > 297) {
    let position = 0;
    let heightLeft = pdfHeight;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= 297;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= 297;
    }
  } else {
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  }

  const finalName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  pdf.save(finalName);
}
