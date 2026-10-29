/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Document, Paragraph, TextRun, Packer, Table, TableRow, TableCell, ImageRun, AlignmentType, WidthType, BorderStyle } from 'docx';
import { ParsedDocument, DocumentVariables, RecipientDownloadConfig } from '../types/document';
import { interpolateVariables } from './htmlEmailGenerator';
import { dataUrlToBlob } from './imageHostingService';

/**
 * Converts a base64 data URL to an ArrayBuffer or Uint8Array for docx ImageRun
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const parts = dataUrl.split(';base64,');
  const raw = atob(parts[1] || '');
  const uInt8Array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return uInt8Array;
}

/**
 * Exports the reconstructed document to a genuine Microsoft Word (.docx) file
 */
export async function exportToWordDocx(
  doc: ParsedDocument,
  variables: DocumentVariables,
  downloadConfig: RecipientDownloadConfig
): Promise<void> {
  const docxChildren: any[] = [];

  // Optional Intro Message
  if (doc.includeIntroBanner && doc.introMessage) {
    const interpolatedIntro = interpolateVariables(doc.introMessage, variables);
    docxChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: interpolatedIntro,
            italics: true,
            color: '475569',
            size: 22, // 11pt
          }),
        ],
        spacing: { after: 240 },
      })
    );
  }

  // Iterate over document blocks in order
  for (const block of doc.blocks) {
    const content = interpolateVariables(block.currentText || block.originalText || '', variables);

    switch (block.type) {
      case 'image':
      case 'signature_stamp':
      case 'qr_code':
      case 'barcode': {
        if (block.imageDataUrl && block.imageDataUrl.startsWith('data:')) {
          try {
            const imgData = dataUrlToUint8Array(block.imageDataUrl);
            const w = block.imageWidth || (block.type === 'qr_code' ? 100 : block.type === 'barcode' ? 200 : 180);
            const h = block.type === 'qr_code' ? w : Math.round(w * 0.4);

            docxChildren.push(
              new Paragraph({
                alignment:
                  block.imageAlignment === 'center'
                    ? AlignmentType.CENTER
                    : block.imageAlignment === 'right'
                    ? AlignmentType.RIGHT
                    : AlignmentType.LEFT,
                children: [
                  new ImageRun({
                    data: imgData,
                    transformation: {
                      width: Math.min(w, 480),
                      height: Math.min(h, 240),
                    },
                  } as any),
                ],
                spacing: { before: 120, after: 120 },
              })
            );
          } catch (imgErr) {
            console.warn('Word image embed warning:', imgErr);
          }
        }
        break;
      }

      case 'heading': {
        docxChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: content,
                bold: true,
                size: (block.style?.fontSize ? block.style.fontSize * 2 : 28), // 14pt
                color: block.style?.color?.replace('#', '') || '000000',
              }),
            ],
            spacing: { before: 240, after: 120 },
          })
        );
        break;
      }

      case 'salutation':
      case 'metadata_line': {
        docxChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: content,
                bold: block.type === 'salutation' || block.style?.fontWeight === 'bold',
                italics: block.style?.fontStyle === 'italic',
                size: (block.style?.fontSize ? block.style.fontSize * 2 : 24), // 12-13pt
                color: block.style?.color?.replace('#', '') || '000000',
              }),
            ],
            spacing: { after: 120 },
          })
        );
        break;
      }

      case 'table': {
        if (block.tableData && block.tableData.headers) {
          const { headers, rows } = block.tableData;

          const headerRow = new TableRow({
            children: headers.map((h) => {
              return new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: h,
                        bold: true,
                        color: 'FFFFFF',
                        size: 22,
                      }),
                    ],
                  }),
                ],
                shading: { fill: '1E3A8A' },
              });
            }),
          });

          const tableRows = [headerRow];

          rows.forEach((row, rI) => {
            const tableCellList = row.map((c) => {
              const cellText = interpolateVariables(c, variables);
              return new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cellText,
                        size: 22,
                        color: '1E293B',
                      }),
                    ],
                  }),
                ],
                shading: rI % 2 === 1 ? { fill: 'F8FAFC' } : undefined,
              });
            });
            tableRows.push(new TableRow({ children: tableCellList }));
          });

          docxChildren.push(
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          );
        }
        break;
      }

      case 'paragraph':
      default: {
        if (content.trim()) {
          const lines = content.split('\n');
          lines.forEach((line) => {
            if (line.trim()) {
              docxChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      bold: block.style?.fontWeight === 'bold',
                      italics: block.style?.fontStyle === 'italic',
                      size: (block.style?.fontSize ? block.style.fontSize * 2 : 24),
                      color: block.style?.color?.replace('#', '') || '000000',
                    }),
                  ],
                  spacing: { after: 160 },
                })
              );
            }
          });
        }
        break;
      }
    }
  }

  // Optional Recipient download notice
  if (downloadConfig.enabled) {
    docxChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Document PDF officiel joint / disponible : ${downloadConfig.downloadUrl || 'en pièce jointe'}`,
            italics: true,
            size: 20,
            color: '64748B',
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );
  }

  // Create docx document
  const wordDocument = new Document({
    sections: [
      {
        properties: {},
        children: docxChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(wordDocument);
  const cleanName = (doc.fileName || 'document').replace(/\.[^/.]+$/, '') + '_reproduit.docx';

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = cleanName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Alternative export: Word HTML / MIME document (.doc) that opens directly in Microsoft Word
 */
export function exportToWordHtmlDoc(doc: ParsedDocument, emailHtml: string): void {
  const cleanName = (doc.fileName || 'document').replace(/\.[^/.]+$/, '') + '_reproduit.doc';

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${doc.metadata.title || 'Document'}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; color: #000000; }
        table { border-collapse: collapse; }
      </style>
    </head>
    <body>
      ${emailHtml}
    </body>
    </html>
  `;

  const blob = new Blob([wordHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = cleanName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
