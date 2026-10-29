/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DocumentType = 'pdf' | 'docx' | 'image';

export type BlockType = 
  | 'header'
  | 'paragraph'
  | 'heading'
  | 'metadata_line'
  | 'salutation'
  | 'link'
  | 'table'
  | 'image'
  | 'watermark'
  | 'signature_stamp'
  | 'qr_code'
  | 'barcode'
  | 'footer'
  | 'separator';

export type LayoutSection = 
  | 'header_left'
  | 'header_right'
  | 'recipient_box'
  | 'subject'
  | 'table'
  | 'payment_left'
  | 'totals_right'
  | 'signature_left'
  | 'stamp_right'
  | 'footer'
  | 'custom';

export type ReproductionMode = 'pixel_perfect' | 'flow_text';

export interface BlockStyle {
  fontSize?: number; // in px, e.g. 10, 12, 13, 14, 16, 20
  fontWeight?: 'normal' | '500' | '600' | 'bold' | '800';
  fontStyle?: 'normal' | 'italic';
  color?: string; // e.g. #000000, #1e3a8a, #475569
  backgroundColor?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number; // e.g. 1.3, 1.45, 1.6
  marginBottom?: number; // in px
  marginTop?: number; // in px
  padding?: string;
  border?: string;
  borderRadius?: string;
  opacity?: number;
}

export interface ExtractedBlock {
  id: string;
  type: BlockType;
  label: string;
  order: number;
  section?: LayoutSection;
  originalText?: string;
  currentText: string;
  linkUrl?: string;
  imageDataUrl?: string; // Local Base64
  hostedUrl?: string; // Public free hosted HTTPS URL (Catbox, ImgBB, etc.)
  imageCaption?: string;
  imageWidth?: number; // max width in px
  imageAlignment?: 'left' | 'center' | 'right';
  isLocked: boolean; // Protects genuine logos and signatures against tampering
  isOriginalAsset: boolean;
  isWatermark?: boolean;
  watermarkOpacity?: number;
  qrData?: string;
  barcodeData?: string;
  tableData?: {
    headers: string[];
    rows: string[][];
    columnWidths?: string[];
    headerBackground?: string;
    headerColor?: string;
  };
  style?: BlockStyle;
  variableBinding?: 'destinataire' | 'date' | 'reference' | 'montant' | 'objet' | 'message';
}

export interface DocumentVariables {
  destinataire: string;
  date: string;
  reference: string;
  montant: string;
  objet: string;
  message: string;
}

export interface RecipientDownloadConfig {
  enabled: boolean; // Strictly optional, user chooses whether to include or not!
  mode: 'attachment' | 'download_button' | 'both';
  downloadUrl: string; // Required if mode includes download_button
  buttonLabel: string;
  securityNotice: string;
  expiresInDays?: number;
}

export interface ParsedDocument {
  id: string;
  fileName: string;
  fileType: DocumentType;
  fileSize: number;
  originalFileBlob?: Blob;
  originalFileArrayBuffer?: ArrayBuffer;
  pageCount: number;
  originalPageImages: string[]; // High-res canvas render of original pages
  reproductionMode: ReproductionMode;
  preferHostedImages?: boolean; // Toggle between hosted URLs and Base64 in exported email
  includeIntroBanner: boolean;
  introMessage: string;
  blocks: ExtractedBlock[];
  variables: DocumentVariables;
  metadata: {
    title?: string;
    detectedType: 'courrier' | 'formulaire' | 'facture' | 'devis' | 'autre';
    hasDigitalText: boolean; // True if PDF had selectable text, False if pure scanned bitmap
    extractedImagesCount: number;
    hasOriginalSignature: boolean;
    hasOriginalStamp: boolean;
    hasWatermark?: boolean;
    hasQrCode: boolean;
    hasBarcode: boolean;
    dominantColor?: string;
    backgroundColor?: string;
    parsingDate: string;
  };
  downloadConfig: RecipientDownloadConfig;
}

export type ProcessingMode = 'automatic' | 'assisted';
export type ViewMode = 'side_by_side' | 'email_preview' | 'original_preview' | 'code';
export type DevicePreview = 'desktop' | 'mobile';
