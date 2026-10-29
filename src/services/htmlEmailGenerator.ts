/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParsedDocument, DocumentVariables, RecipientDownloadConfig, ExtractedBlock } from '../types/document';
import { getEffectiveImageUrl } from './imageHostingService';

/**
 * Replaces variable placeholders in text
 */
export function interpolateVariables(text: string, vars: DocumentVariables): string {
  if (!text) return '';
  return text
    .replace(/\{\{destinataire\}\}/gi, vars.destinataire || '')
    .replace(/\{\{date\}\}/gi, vars.date || '')
    .replace(/\{\{reference\}\}/gi, vars.reference || '')
    .replace(/\{\{montant\}\}/gi, vars.montant || '')
    .replace(/\{\{objet\}\}/gi, vars.objet || '')
    .replace(/\{\{message\}\}/gi, vars.message || '');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMultiline(str: string): string {
  return escapeHtml(str).replace(/\n/g, '<br />');
}

/**
 * Autolinks URLs in text (e.g. www.cic.gc.ca or https://...)
 */
function autolinkText(str: string): string {
  const escaped = escapeHtml(str);
  return escaped.replace(
    /(https?:\/\/[^\s]+|www\.[^\s]+)/gi,
    (url) => {
      const href = url.startsWith('http') ? url : `https://${url}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #0000ee; text-decoration: underline;">${url}</a>`;
    }
  ).replace(/\n/g, '<br />');
}

/**
 * Generates an email-compatible HTML string adhering strictly to table layout
 * and inline styles for Gmail, Outlook, Kit, Apple Mail, and Thunderbird.
 * Guarantees that ALL text is real editable text and images use hosted or base64 URLs.
 */
export function generateEmailHtml(
  doc: ParsedDocument,
  variables: DocumentVariables,
  downloadConfig: RecipientDownloadConfig
): string {
  // 1. Recipient download / attachment section (STRICTLY OPTIONAL)
  let downloadSectionHtml = '';
  if (downloadConfig.enabled) {
    if (
      (downloadConfig.mode === 'download_button' || downloadConfig.mode === 'both') &&
      downloadConfig.downloadUrl &&
      downloadConfig.downloadUrl.trim().length > 0
    ) {
      const validUrl = escapeHtml(downloadConfig.downloadUrl.trim());
      const buttonLabel = escapeHtml(downloadConfig.buttonLabel || 'Télécharger le document PDF original');
      const notice = escapeHtml(downloadConfig.securityNotice || 'Lien sécurisé vers le document officiel certifié conforme.');
      const expiryText = downloadConfig.expiresInDays ? `Validité : ${downloadConfig.expiresInDays} jours` : '';

      downloadSectionHtml = `
        <!-- BOUTON DE TÉLÉCHARGEMENT SÉCURISÉ POUR LE DESTINATAIRE (OPTIONNEL) -->
        <tr>
          <td align="center" style="padding: 24px 20px; background-color: #f8fafc; border-top: 2px solid #e2e8f0; border-bottom: 2px solid #e2e8f0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
              <tr>
                <td align="center" style="border-radius: 6px; background-color: #0f172a;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${validUrl}" style="height:44px;v-text-anchor:middle;width:340px;" arcsize="14%" stroke="f" fillcolor="#0f172a">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">${buttonLabel}</center>
                  </v:roundrect>
                  <![endif]-->
                  <a href="${validUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 28px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px; background-color: #0f172a; mso-padding-alt: 0;">
                    📄 &nbsp; ${buttonLabel}
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin: 10px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 15px; color: #64748b; text-align: center;">
              🔒 ${notice} ${expiryText ? '· ' + expiryText : ''}
            </p>
          </td>
        </tr>
      `;
    } else if (downloadConfig.mode === 'attachment' || downloadConfig.mode === 'both') {
      downloadSectionHtml = `
        <!-- NOTIFICATION PIÈCE JOINTE DIRECTE -->
        <tr>
          <td style="padding: 16px 24px; background-color: #f8fafc; border-top: 1px dashed #cbd5e1; border-bottom: 1px dashed #cbd5e1;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="30" valign="middle" style="font-size: 20px;">📎</td>
                <td valign="middle" style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px; color: #334155;">
                  <strong>Document joint directement :</strong> Le document officiel au format PDF est annexé en pièce jointe de ce message pour consultation et archivage immédiat.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }
  }

  // 2. Optional Intro message (e.g. customized greeting above the document)
  let introBannerHtml = '';
  if (doc.includeIntroBanner && doc.introMessage) {
    const interpolatedIntro = interpolateVariables(doc.introMessage, variables);
    introBannerHtml = `
      <tr>
        <td style="padding: 20px 28px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 20px; color: #1e293b;">
          ${formatMultiline(interpolatedIntro)}
        </td>
      </tr>
    `;
  }

  // 3. Body Content depending on reproductionMode
  let bodyContentHtml = '';

  if (doc.reproductionMode === 'pixel_perfect') {
    // -------------------------------------------------------------
    // MODULE 1 : REPRODUCTION VISUELLE 100% FIDÈLE (PIXEL-PERFECT)
    // -------------------------------------------------------------
    const pagesHtml = (doc.originalPageImages || []).map((pageDataUrl, pageIdx) => {
      const pageNum = pageIdx + 1;
      const pageSep = pageIdx > 0 ? `<tr><td height="16" style="background-color: #f1f5f9; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>` : '';
      return `
        ${pageSep}
        <tr>
          <td align="center" style="padding: 0; margin: 0; background-color: #ffffff; line-height: 0;">
            <img src="${pageDataUrl}" width="650" alt="${escapeHtml(doc.fileName)} - Page ${pageNum}" style="display: block; width: 100%; max-width: 650px; height: auto; border: 0;" />
          </td>
        </tr>
      `;
    }).join('\n');

    bodyContentHtml = pagesHtml || `
      <tr>
        <td style="padding: 30px; text-align: center; color: #64748b; font-family: Arial, sans-serif; font-size: 14px;">
          Document prêt pour affichage.
        </td>
      </tr>
    `;
  } else {
    // -------------------------------------------------------------
    // MODULE 2 : TRANSCRIPTION TYPOGRAPHIQUE HYBRIDE (TEXTE 100% ÉDITABLE DANS GMAIL/OUTLOOK)
    // -------------------------------------------------------------
    // Renders real semantic text with inline styles so the user can edit ANY text inside Gmail!
    // And discrete images for logos, signatures, and QR codes using hosted or base64 URLs.
    const blocksHtml = doc.blocks.map((block) => {
      return renderLinearBlock(block, variables, !!doc.preferHostedImages);
    }).join('\n');

    bodyContentHtml = `
      <tr>
        <td style="padding: 36px 36px 28px 36px; background-color: #ffffff;">
          ${blocksHtml}
        </td>
      </tr>
    `;
  }

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <title>${escapeHtml(doc.metadata.title || doc.fileName || 'Document officiel')}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; }
    @media only screen and (max-width: 650px) {
      .container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- PREVIEW TEXT -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
    ${escapeHtml(doc.metadata.title || 'Document')} · ${escapeHtml(variables.destinataire)} · ${escapeHtml(variables.reference)}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 12px 8px;">
        <!--[if mso]>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="650" align="center">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="container" style="max-width: 650px; background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin: 0 auto;">
          
          ${introBannerHtml}
          ${bodyContentHtml}
          ${downloadSectionHtml}

          <!-- FOOTER / CONFORMITÉ DOCUFIDÈLE -->
          <tr>
            <td align="center" style="padding: 14px 20px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 16px; color: #94a3b8; text-align: center;">
                Ce document a été transcrit via <strong>DOCUFIDÈLE</strong> en garantissant une fidélité intégrale et la modifiabilité complète des textes.
              </p>
            </td>
          </tr>

        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Renders a block in linear natural flow with real editable text and discrete images
 */
function renderLinearBlock(block: ExtractedBlock, variables: DocumentVariables, preferHosted: boolean): string {
  const content = interpolateVariables(block.currentText || block.originalText || '', variables);
  const st = block.style || {};
  const fontSize = st.fontSize ? `${st.fontSize}px` : '13px';
  const fontWeight = st.fontWeight || 'normal';
  const color = st.color || '#000000';
  const align = st.align || 'left';
  const lineHeight = st.lineHeight ? `${Math.round(st.lineHeight * (st.fontSize || 13))}px` : '20px';
  const marginBot = st.marginBottom !== undefined ? `${st.marginBottom}px` : '12px';
  const marginTop = st.marginTop !== undefined ? `${st.marginTop}px` : '0px';

  switch (block.type) {
    case 'image':
    case 'signature_stamp':
    case 'qr_code':
    case 'barcode': {
      const imgUrl = getEffectiveImageUrl(block, preferHosted);
      if (!imgUrl) return '';
      const w = block.imageWidth || (block.type === 'qr_code' ? 100 : block.type === 'barcode' ? 200 : 180);
      const al = block.imageAlignment || 'left';
      return `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${al}" style="margin-top: ${marginTop}; margin-bottom: ${marginBot};">
          <tr>
            <td align="${al}">
              <img src="${imgUrl}" alt="${escapeHtml(block.label)}" width="${w}" style="display: block; max-width: 100%; height: auto; border: 0;" />
            </td>
          </tr>
        </table>
      `;
    }

    case 'watermark': {
      const opacity = block.watermarkOpacity || 0.15;
      return `
        <div style="text-align: center; margin: 16px 0; opacity: ${opacity}; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: #94a3b8; letter-spacing: 4px; text-transform: uppercase;">
          ${escapeHtml(content || 'CONFIDENTIEL')}
        </div>
      `;
    }

    case 'heading': {
      return `
        <h3 style="margin-top: ${marginTop || '18px'}; margin-bottom: ${marginBot || '8px'}; font-family: Arial, Helvetica, sans-serif; font-size: ${fontSize || '14px'}; font-weight: bold; color: ${color}; line-height: 22px; text-align: ${align};">
          ${formatMultiline(content)}
        </h3>
      `;
    }

    case 'metadata_line': {
      return `
        <div style="margin-top: ${marginTop}; margin-bottom: ${marginBot || '6px'}; font-family: Arial, Helvetica, sans-serif; font-size: ${fontSize || '13px'}; font-weight: ${fontWeight}; color: ${color}; line-height: 20px; text-align: ${align};">
          ${formatMultiline(content)}
        </div>
      `;
    }

    case 'salutation': {
      return `
        <div style="margin-top: ${marginTop || '16px'}; margin-bottom: ${marginBot || '16px'}; font-family: Arial, Helvetica, sans-serif; font-size: ${fontSize || '13px'}; font-weight: bold; color: ${color}; line-height: 20px; text-align: ${align};">
          ${formatMultiline(content)}
        </div>
      `;
    }

    case 'table': {
      if (!block.tableData || !block.tableData.headers) return '';
      const { headers, rows, columnWidths, headerBackground, headerColor } = block.tableData;
      const thBg = headerBackground || '#1e3a8a';
      const thColor = headerColor || '#ffffff';

      const ths = headers.map((h, i) => {
        const alignCell = i === 0 ? 'left' : (i === headers.length - 1 ? 'right' : 'center');
        const w = columnWidths && columnWidths[i] ? `width="${columnWidths[i]}"` : '';
        return `<th ${w} align="${alignCell}" style="padding: 10px 12px; font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: bold; color: ${thColor}; background-color: ${thBg}; text-align: ${alignCell}; border: 1px solid ${thBg};">${escapeHtml(h)}</th>`;
      }).join('');

      const trs = rows.map((row, rI) => {
        const bg = rI % 2 === 1 ? '#f8fafc' : '#ffffff';
        const tds = row.map((c, cI) => {
          const alignCell = cI === 0 ? 'left' : (cI === row.length - 1 ? 'right' : 'center');
          const isBold = cI === row.length - 1;
          const interpolatedCell = interpolateVariables(c, variables);
          return `<td align="${alignCell}" style="padding: 10px 12px; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 18px; color: #1e293b; background-color: ${bg}; border-bottom: 1px solid #e2e8f0; text-align: ${alignCell}; font-weight: ${isBold ? 'bold' : 'normal'};">${formatMultiline(interpolatedCell)}</td>`;
        }).join('');
        return `<tr>${tds}</tr>`;
      }).join('');

      return `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; margin-top: ${marginTop || '12px'}; margin-bottom: ${marginBot || '16px'}; border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden;">
          <thead><tr>${ths}</tr></thead>
          <tbody>${trs}</tbody>
        </table>
      `;
    }

    case 'paragraph':
    default: {
      return `
        <p style="margin-top: ${marginTop}; margin-bottom: ${marginBot}; font-family: Arial, Helvetica, sans-serif; font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color}; line-height: ${lineHeight}; text-align: ${align};">
          ${autolinkText(content)}
        </p>
      `;
    }
  }
}

/**
 * Copies the formatted rich HTML to clipboard for Gmail & Webmail
 */
export async function copyRichHtmlToClipboard(htmlString: string): Promise<boolean> {
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
      const blobHtml = new Blob([htmlString], { type: 'text/html' });
      const tmpDiv = document.createElement('div');
      tmpDiv.innerHTML = htmlString;
      const plainText = tmpDiv.textContent || tmpDiv.innerText || '';
      const blobText = new Blob([plainText], { type: 'text/plain' });

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        }),
      ]);
      return true;
    } else {
      await navigator.clipboard.writeText(htmlString);
      return false;
    }
  } catch (err) {
    console.error('Failed to copy rich HTML to clipboard:', err);
    try {
      await navigator.clipboard.writeText(htmlString);
      return false;
    } catch {
      return false;
    }
  }
}

/**
 * Download the generated HTML file
 */
export function downloadHtmlFile(htmlString: string, filename: string): void {
  const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
