/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParsedDocument, ExtractedBlock } from '../types/document';

/**
 * Converts a Base64 data URL to a binary Blob
 */
export function dataUrlToBlob(dataUrl: string): { blob: Blob; ext: string } {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].replace('data:', '') || 'image/png';
  const raw = atob(parts[1] || '');
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  const ext = contentType.includes('jpeg') || contentType.includes('jpg')
    ? 'jpg'
    : contentType.includes('svg')
    ? 'svg'
    : contentType.includes('gif')
    ? 'gif'
    : contentType.includes('webp')
    ? 'webp'
    : 'png';

  return { blob: new Blob([uInt8Array], { type: contentType }), ext };
}

/**
 * Uploads an image to Catbox.moe (100% free, anonymous, permanent CDN)
 */
async function uploadToCatbox(blob: Blob, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', blob, filename);

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Catbox HTTP error: ${res.status}`);
  }

  const url = (await res.text()).trim();
  if (!url.startsWith('http')) {
    throw new Error(`Catbox invalid response: ${url}`);
  }

  return url;
}

/**
 * Uploads an image to ImgBB free anonymous endpoint
 */
async function uploadToImgBB(base64DataUrl: string): Promise<string> {
  const base64Clean = base64DataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
  const formData = new FormData();
  formData.append('image', base64Clean);

  // Free standard community API key
  const apiKey = '6d207e02198a847aa5fb3d0add30f699';
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`ImgBB HTTP error: ${res.status}`);
  }

  const json = await res.json();
  if (json && json.data && json.data.url) {
    return json.data.url;
  }

  throw new Error('ImgBB did not return a valid URL');
}

/**
 * Uploads an image to free hosting with automatic fallback
 */
export async function uploadImageToFreeHost(
  base64DataUrl: string,
  suggestedName = 'document_asset'
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!base64DataUrl || !base64DataUrl.startsWith('data:')) {
    return { success: false, error: 'Image invalide ou déjà hébergée' };
  }

  try {
    const { blob, ext } = dataUrlToBlob(base64DataUrl);
    const filename = `${suggestedName}_${Date.now()}.${ext}`;

    // Attempt Catbox first
    try {
      const url = await uploadToCatbox(blob, filename);
      return { success: true, url };
    } catch (catboxErr) {
      console.warn('Catbox upload fallback to ImgBB:', catboxErr);
    }

    // Fallback to ImgBB
    try {
      const url = await uploadToImgBB(base64DataUrl);
      return { success: true, url };
    } catch (imgbbErr) {
      console.warn('ImgBB upload error:', imgbbErr);
      throw new Error('Les serveurs d\'hébergement gratuits sont temporairement occupés.');
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Impossible d\'héberger cette image en ligne.',
    };
  }
}

/**
 * Uploads all images found in document blocks (logos, signatures, QR, etc.) to free hosting
 */
export async function uploadAllDocumentImages(
  doc: ParsedDocument,
  onProgress?: (current: number, total: number, lastUrl?: string) => void
): Promise<ParsedDocument> {
  const blocksToUpload = doc.blocks.filter(
    (b) => b.imageDataUrl && b.imageDataUrl.startsWith('data:') && !b.hostedUrl
  );

  const total = blocksToUpload.length;
  let current = 0;

  if (total === 0) {
    return {
      ...doc,
      preferHostedImages: true,
    };
  }

  const updatedBlocks = [...doc.blocks];

  for (let i = 0; i < updatedBlocks.length; i++) {
    const block = updatedBlocks[i];
    if (block.imageDataUrl && block.imageDataUrl.startsWith('data:') && !block.hostedUrl) {
      current++;
      const result = await uploadImageToFreeHost(
        block.imageDataUrl,
        block.label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
      );

      if (result.success && result.url) {
        updatedBlocks[i] = {
          ...block,
          hostedUrl: result.url,
        };
        onProgress?.(current, total, result.url);
      }
    }
  }

  return {
    ...doc,
    blocks: updatedBlocks,
    preferHostedImages: true,
  };
}

/**
 * Returns the effective image URL according to user preference (Hosted URL or Base64)
 */
export function getEffectiveImageUrl(block: ExtractedBlock, preferHosted = true): string {
  if (preferHosted && block.hostedUrl) {
    return block.hostedUrl;
  }
  return block.imageDataUrl || block.hostedUrl || '';
}
