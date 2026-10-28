/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Image as ImageIcon,
  Type,
  Table as TableIcon,
  Check,
  AlertTriangle,
  QrCode,
  Barcode,
  Palette,
  Maximize2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { ExtractedBlock, ParsedDocument, LayoutSection } from '../types/document';
import { generateBarcodeBase64, generateQrCodeBase64 } from '../services/codeGenerator';

interface AssistedModeWorkbenchProps {
  document: ParsedDocument;
  onUpdateBlock: (blockId: string, updatedBlock: Partial<ExtractedBlock>) => void;
  onLockAllImages: () => void;
  onApplyAndRender: () => void;
}

const SECTION_LABELS: Record<LayoutSection, string> = {
  header_left: 'En-tête Gauche (Logo & Émetteur)',
  header_right: 'En-tête Droite (Titre Facture & Dates)',
  recipient_box: 'Cadre Destinataire (Droite)',
  subject: 'Objet du document',
  table: 'Tableau des Prestations/Articles',
  payment_left: 'Paiement / IBAN / QR Code / Code-barres',
  totals_right: 'Totaux & TVA (Droite)',
  signature_left: 'Signature Manuscrite (Gauche)',
  stamp_right: 'Cachet Officiel / Tampon (Droite)',
  footer: 'Mentions Légales (Bas de page)',
  custom: 'Élément libre / Complémentaire',
};

const COLOR_PRESETS = [
  { label: 'Bleu Officiel', value: '#1e3a8a' },
  { label: 'Noir Texte', value: '#0f172a' },
  { label: 'Gris Métadonnée', value: '#475569' },
  { label: 'Gris Clair', value: '#64748b' },
  { label: 'Rouge Alerte', value: '#dc2626' },
  { label: 'Vert Succès', value: '#16a34a' },
];

export const AssistedModeWorkbench: React.FC<AssistedModeWorkbenchProps> = ({
  document: doc,
  onUpdateBlock,
  onLockAllImages,
  onApplyAndRender,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'graphics' | 'codes' | 'texts' | 'tables'>('all');
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  const filteredBlocks = doc.blocks.filter((b) => {
    if (selectedFilter === 'graphics') return b.type === 'image' || b.type === 'signature_stamp';
    if (selectedFilter === 'codes') return b.type === 'qr_code' || b.type === 'barcode';
    if (selectedFilter === 'texts') return b.type === 'paragraph' || b.type === 'header';
    if (selectedFilter === 'tables') return b.type === 'table';
    return true;
  });

  const originalAssetsCount = doc.blocks.filter((b) => b.isOriginalAsset).length;
  const lockedAssetsCount = doc.blocks.filter((b) => b.isOriginalAsset && b.isLocked).length;

  const handleRegenerateBarcode = (block: ExtractedBlock, newCode: string) => {
    const newBarcodeUrl = generateBarcodeBase64(newCode, 'CODE128', { height: 45 });
    onUpdateBlock(block.id, {
      barcodeData: newCode,
      imageDataUrl: newBarcodeUrl,
    });
  };

  const handleRegenerateQr = async (block: ExtractedBlock, newData: string) => {
    const newQrUrl = await generateQrCodeBase64(newData, { width: 140 });
    onUpdateBlock(block.id, {
      qrData: newData,
      imageDataUrl: newQrUrl,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-900 rounded-md">
              MODE ASSISTÉ · INSPECTION & CALIBRATION 2D
            </span>
            <span className="text-xs text-slate-500">
              Isolation des logos, signatures, QR codes & fidélité typographique
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Contrôle & Ajustement des Éléments Détectés
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Chaque élément graphique (logo, signature, cachet, code-barres, QR code) est isolé et verrouillé sans contamination textuelle.
          </p>
        </div>

        {/* Global Protection & Actions */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onLockAllImages}
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs rounded-lg flex items-center transition-colors"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
            Tout Verrouiller ({lockedAssetsCount}/{originalAssetsCount} protégés)
          </button>
          <button
            type="button"
            onClick={onApplyAndRender}
            className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center transition-colors"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Valider le Rendu Fidèle
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2">
        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            selectedFilter === 'all' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tous les éléments ({doc.blocks.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter('graphics')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center ${
            selectedFilter === 'graphics' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 mr-1" />
          Logos & Signatures
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter('codes')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center ${
            selectedFilter === 'codes' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 mr-1" />
          Codes QR & Barres
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter('texts')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center ${
            selectedFilter === 'texts' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Type className="w-3.5 h-3.5 mr-1" />
          Textes & Typographie
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter('tables')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center ${
            selectedFilter === 'tables' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TableIcon className="w-3.5 h-3.5 mr-1" />
          Tableaux
        </button>
      </div>

      {/* Block List */}
      <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
        {filteredBlocks.map((block, index) => {
          const isGraphic = block.type === 'image' || block.type === 'signature_stamp';
          const isCode = block.type === 'qr_code' || block.type === 'barcode';
          const isExpanded = activeEditingId === block.id;

          return (
            <div
              key={block.id}
              className={`p-4 rounded-xl border transition-all ${
                block.isLocked
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Top row of block card */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {block.label}
                  </span>

                  {/* Section Tag */}
                  <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 rounded border border-slate-200">
                    {(block.section && SECTION_LABELS[block.section]) || 'Général'}
                  </span>

                  {block.isOriginalAsset && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 rounded">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Élément isolé certifié
                    </span>
                  )}

                  {block.variableBinding && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-blue-800 bg-blue-100 rounded">
                      {`{{${block.variableBinding}}}`}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {/* Style fine-tuning toggle button */}
                  <button
                    type="button"
                    onClick={() => setActiveEditingId(isExpanded ? null : block.id)}
                    className="flex items-center px-2 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-medium"
                    title="Ajuster la typographie, taille et position"
                  >
                    <Sliders className="w-3.5 h-3.5 mr-1" />
                    {isExpanded ? 'Réduire' : 'Ajuster'}
                  </button>

                  {/* Lock toggle */}
                  <button
                    type="button"
                    onClick={() => onUpdateBlock(block.id, { isLocked: !block.isLocked })}
                    className={`flex items-center px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                      block.isLocked
                        ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {block.isLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                        Verrouillé
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        Déverrouillé
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Graphics preview (Logo / Signature / Stamp) */}
              {isGraphic && block.imageDataUrl && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="bg-white p-2 border border-slate-200 rounded shadow-2xs max-w-[260px] max-h-[120px] flex items-center justify-center overflow-hidden">
                    <img
                      src={block.imageDataUrl}
                      alt={block.label}
                      className="max-h-24 object-contain"
                    />
                  </div>
                  <div className="flex-1 text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">
                      Isolation pure garantie : aucun texte du document n'est inclus dans cette image.
                    </p>
                    <p className="text-slate-500">
                      {block.imageCaption || 'Élément graphique certifié conforme à l\'original.'}
                    </p>
                    {block.isLocked && (
                      <p className="text-emerald-700 font-medium flex items-center">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        Protégé : Ne sera jamais remplacé, effacé ni déformé.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* QR Code / Barcode preview & editing */}
              {isCode && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="bg-white p-2 border border-slate-200 rounded shadow-2xs flex items-center justify-center">
                    {block.imageDataUrl && (
                      <img
                        src={block.imageDataUrl}
                        alt={block.label}
                        className="max-h-24 object-contain"
                      />
                    )}
                  </div>
                  <div className="flex-1 text-xs space-y-2">
                    <p className="font-semibold text-slate-800">
                      {block.type === 'qr_code'
                        ? 'Code QR officiel scannable (SEPA / Virement instantané)'
                        : 'Code-barres Code 128 pour archivage & traçabilité'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={block.type === 'qr_code' ? (block.qrData || '') : (block.barcodeData || '')}
                        onChange={(e) => {
                          if (block.type === 'barcode') {
                            handleRegenerateBarcode(block, e.target.value);
                          } else {
                            handleRegenerateQr(block, e.target.value);
                          }
                        }}
                        placeholder="Contenu du code..."
                        className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded font-mono"
                      />
                      <span className="text-[11px] text-slate-500">
                        {block.type === 'qr_code' ? 'Données QR' : 'Code 128'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Text editing */}
              {!isGraphic && !isCode && block.type !== 'table' && (
                <div>
                  <textarea
                    rows={2}
                    value={block.currentText}
                    onChange={(e) => onUpdateBlock(block.id, { currentText: e.target.value })}
                    disabled={block.isLocked}
                    className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none transition-all ${
                      block.isLocked
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                    }`}
                  />
                  {block.originalText && block.originalText !== block.currentText && (
                    <p className="text-[11px] text-amber-700 mt-1 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Texte personnalisé par rapport à l'original.
                    </p>
                  )}
                </div>
              )}

              {/* Table preview */}
              {block.type === 'table' && block.tableData && (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead style={{ backgroundColor: block.tableData.headerBackground || '#1e3a8a', color: '#ffffff' }}>
                      <tr>
                        {block.tableData.headers.map((h, i) => (
                          <th key={i} className="px-3 py-2 text-left font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {block.tableData.rows.map((row, rI) => (
                        <tr key={rI} className={rI % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                          {row.map((cell, cI) => (
                            <td key={cI} className="px-3 py-2 text-slate-700">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* EXPANDED STYLE & LAYOUT CONTROLS */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-slate-200 bg-slate-50 p-3 rounded-lg space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center">
                    <Sliders className="w-3.5 h-3.5 mr-1.5 text-blue-800" />
                    Réglages précis de position 2D & Typographie
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Section Selector */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Emplacement / Colonne :
                      </label>
                      <select
                        value={block.section}
                        onChange={(e) => onUpdateBlock(block.id, { section: e.target.value as LayoutSection })}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                      >
                        {Object.entries(SECTION_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Font Size */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Taille du texte : {block.style?.fontSize || 13} px
                      </label>
                      <input
                        type="range"
                        min={9}
                        max={28}
                        value={block.style?.fontSize || 13}
                        onChange={(e) =>
                          onUpdateBlock(block.id, {
                            style: { ...block.style, fontSize: Number(e.target.value) },
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Text Alignment */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Alignement :
                      </label>
                      <div className="flex items-center space-x-1">
                        {(['left', 'center', 'right'] as const).map((al) => (
                          <button
                            key={al}
                            type="button"
                            onClick={() =>
                              onUpdateBlock(block.id, {
                                style: { ...block.style, align: al },
                              })
                            }
                            className={`flex-1 py-1 text-xs rounded border capitalize ${
                              (block.style?.align || 'left') === al
                                ? 'bg-blue-900 text-white border-blue-900'
                                : 'bg-white text-slate-700 border-slate-300'
                            }`}
                          >
                            {al === 'left' ? 'Gauche' : al === 'center' ? 'Centre' : 'Droite'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Color Presets */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Couleur du texte :
                    </label>
                    <div className="flex items-center space-x-2">
                      {COLOR_PRESETS.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() =>
                            onUpdateBlock(block.id, {
                              style: { ...block.style, color: p.value },
                            })
                          }
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            block.style?.color === p.value ? 'scale-110 border-blue-500 shadow-sm' : 'border-white'
                          }`}
                          style={{ backgroundColor: p.value }}
                          title={p.label}
                        />
                      ))}
                      <input
                        type="color"
                        value={block.style?.color || '#0f172a'}
                        onChange={(e) =>
                          onUpdateBlock(block.id, {
                            style: { ...block.style, color: e.target.value },
                          })
                        }
                        className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                        title="Couleur personnalisée"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
