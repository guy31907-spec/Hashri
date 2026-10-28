/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

/**
 * Generates a crisp QR code base64 image data URL
 */
export async function generateQrCodeBase64(
  text: string,
  options?: { width?: number; margin?: number; darkColor?: string; lightColor?: string }
): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: options?.width || 240,
      margin: options?.margin ?? 1,
      color: {
        dark: options?.darkColor || '#0f172a',
        light: options?.lightColor || '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return '';
  }
}

/**
 * Generates a crisp Code-128 or EAN barcode base64 image data URL
 */
export function generateBarcodeBase64(
  text: string,
  format: 'CODE128' | 'EAN13' = 'CODE128',
  options?: { height?: number; displayValue?: boolean; lineColor?: string }
): string {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, {
      format: format,
      width: 2,
      height: options?.height || 50,
      displayValue: options?.displayValue ?? true,
      font: 'monospace',
      fontSize: 11,
      textMargin: 3,
      lineColor: options?.lineColor || '#0f172a',
      background: '#ffffff',
      margin: 6,
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Failed to generate barcode:', err);
    return '';
  }
}

/**
 * Generates a European EPC SEPA Payment QR Code payload (BezahlCode / EPC standard)
 */
export function generateSepaQrPayload(
  iban: string,
  bic: string,
  recipient: string,
  amount: string,
  ref: string
): string {
  const cleanIban = iban.replace(/\s+/g, '');
  const cleanBic = bic.replace(/\s+/g, '');
  const cleanAmount = amount.replace(/[^\d,\.]/g, '').replace(',', '.');
  const numericAmount = parseFloat(cleanAmount) || 0;

  return [
    'BCD',
    '002',
    '1',
    'SCT',
    cleanBic,
    recipient.substring(0, 70),
    cleanIban,
    `EUR${numericAmount.toFixed(2)}`,
    '',
    ref.substring(0, 35),
    `Facture ${ref}`,
  ].join('\n');
}
