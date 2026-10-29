/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Monitor,
  Smartphone,
  Code,
  FileText,
  CheckCircle,
  ShieldCheck,
  Edit3,
  Plus,
  Trash2,
  Upload,
  Globe,
  Sliders,
  Type,
  Image as ImageIcon,
  Check,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { ParsedDocument, DocumentVariables, DevicePreview, ExtractedBlock, BlockType } from '../types/document';
import { uploadImageToFreeHost } from '../services/imageHostingService';
import { exportToWordDocx } from '../services/wordExporter';

interface SideBySideViewerProps {
  document: ParsedDocument;
  variables: DocumentVariables;
  emailHtml: string;
  onOpenHtmlModal: () => void;
  onOpenPdfModal: () => void;
  onUpdateBlock?: (blockId: string, updatedBlock: Partial<ExtractedBlock>) => void;
  onAddBlock?: (newBlock: ExtractedBlock) => void;
  onDeleteBlock?: (blockId: string) => void;
}

export const SideBySideViewer: React.FC<SideBySideViewerProps> = ({
  document: doc,
  variables,
  emailHtml,
  onOpenHtmlModal,
  onOpenPdfModal,
  onUpdateBlock,
  onAddBlock,
  onDeleteBlock,
}) => {
  const [device, setDevice] = useState<DevicePreview>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'visual_editor' | 'code'>('preview');
  const [origPage, setOrigPage] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingBlockIdForUpload, setPendingBlockIdForUpload] = useState<string | null>(null);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.2, 2.0));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.2, 0.6));
  const handleResetZoom = () => setZoomLevel(1);

  const originalPages = doc.originalPageImages || [];

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && pendingBlockIdForUpload) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onUpdateBlock?.(pendingBlockIdForUpload, {
          imageDataUrl: dataUrl,
          hostedUrl: undefined, // reset hosted URL on replacement
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadBlockImageToCDN = async (block: ExtractedBlock) => {
    if (!block.imageDataUrl) return;
    setIsUploadingImage(block.id);
    try {
      const res = await uploadImageToFreeHost(block.imageDataUrl, block.label);
      if (res.success && res.url) {
        onUpdateBlock?.(block.id, {
          hostedUrl: res.url,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingImage(null);
    }
  };

  const handleCreateNewBlock = (type: BlockType) => {
    const newId = `blk-custom-${Date.now()}`;
    const newBlock: ExtractedBlock = {
      id: newId,
      order: doc.blocks.length + 1,
      type,
      label: type === 'heading' ? 'Nouveau Titre' : type === 'image' ? 'Nouveau Logo / Image' : 'Nouveau Paragraphe',
      currentText: type === 'heading' ? 'Nouveau Titre de Section' : 'Texte du nouveau paragraphe...',
      isLocked: false,
      isOriginalAsset: false,
      style: {
        fontSize: type === 'heading' ? 15 : 13,
        fontWeight: type === 'heading' ? 'bold' : 'normal',
        color: '#000000',
        align: 'left',
        marginBottom: 12,
      },
    };
    onAddBlock?.(newBlock);
    setSelectedBlockId(newId);
    setShowAddMenu(false);
  };

  const handleDownloadWordQuick = async () => {
    await exportToWordDocx(doc, variables, doc.downloadConfig);
  };

  return (
    <div className="bg-slate-100 rounded-2xl border border-slate-200 p-4 lg:p-6 shadow-xs">
      <input
        type="file"
        ref={imageFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Top Bar with Status and Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">
              Comparaison Côte à Côte & Édition Visuelle Directe
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Comparez le document original avec le résultat, et modifiez directement les textes et logos.
          </p>

          {/* Recognized Elements Strip */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              <CheckCircle className="w-3 h-3 mr-1" />
              Texte 100% modifiable dans Gmail & Outlook
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
              <CheckCircle className="w-3 h-3 mr-1" />
              Logos & Signatures remplaçables
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              <CheckCircle className="w-3 h-3 mr-1" />
              Hébergement d'images gratuit supporté
            </span>
          </div>
        </div>

        {/* Global Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownloadWordQuick}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs rounded-lg shadow-2xs flex items-center justify-center transition-colors"
            title="Télécharger directement en format Word (.docx)"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-800" />
            Export Word (.docx)
          </button>
          <button
            type="button"
            onClick={onOpenHtmlModal}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center transition-colors"
          >
            <Code className="w-3.5 h-3.5 mr-1.5" />
            Exporter HTML / Copier Gmail
          </button>
          <button
            type="button"
            onClick={onOpenPdfModal}
            className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs rounded-lg shadow-sm flex items-center justify-center transition-colors"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-red-600" />
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Two Panes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT PANE: Original Document */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[750px] overflow-hidden">
          {/* Pane Header */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-xs font-bold text-slate-800">
                1. Document Source Original
              </span>
              <span className="text-[11px] text-slate-500 font-mono truncate max-w-[140px]">
                {doc.fileName}
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 hover:bg-slate-200 rounded text-slate-600"
                title="Dézoomer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-slate-600 font-mono px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 hover:bg-slate-200 rounded text-slate-600"
                title="Zoomer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 hover:bg-slate-200 rounded text-slate-600 ml-1"
                title="Réinitialiser le zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Page Selector if multiple pages */}
          {originalPages.length > 1 && (
            <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Page :</span>
              {originalPages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setOrigPage(i)}
                  className={`px-2 py-0.5 rounded font-mono font-bold ${
                    origPage === i ? 'bg-blue-900 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Pane Viewport */}
          <div className="flex-1 bg-slate-200/60 p-4 overflow-auto flex justify-center items-start">
            {originalPages.length > 0 ? (
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.1s ease',
                }}
                className="shadow-md bg-white border border-slate-300 rounded overflow-hidden max-w-full"
              >
                <img
                  src={originalPages[origPage] || originalPages[0]}
                  alt="Aperçu original"
                  className="w-full h-auto block select-none pointer-events-none"
                />
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                Aucun rendu visuel disponible pour ce document.
              </div>
            )}
          </div>

          {/* Pane Footer Info */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Document source certifié
            </span>
            <span>{doc.pageCount} page(s)</span>
          </div>
        </div>

        {/* RIGHT PANE: Resulting HTML / Visual WYSIWYG Editor */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[750px] overflow-hidden">
          {/* Pane Header */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-xs font-bold text-slate-800">
                2. Rendu E-mail & Édition Visuelle
              </span>
            </div>

            {/* Switchers (Preview / Visual Editor / Code) */}
            <div className="flex items-center space-x-1 bg-white p-0.5 rounded border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`p-1 rounded text-xs flex items-center font-medium ${
                  activeTab === 'preview'
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Aperçu du rendu final de l'e-mail"
              >
                <Monitor className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Aperçu</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('visual_editor')}
                className={`p-1 rounded text-xs flex items-center font-medium ${
                  activeTab === 'visual_editor'
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Modifier directement les textes, remplacer les logos et ajouter des éléments"
              >
                <Edit3 className="w-3.5 h-3.5 sm:mr-1 text-emerald-600" />
                <span className="hidden sm:inline">Éditeur Visuel</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`p-1 rounded text-xs flex items-center font-medium ${
                  activeTab === 'code'
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Afficher le code source HTML"
              >
                <Code className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Code HTML</span>
              </button>
            </div>
          </div>

          {/* Subheader bar when in Visual Editor */}
          {activeTab === 'visual_editor' && (
            <div className="px-3 py-2 bg-blue-50/70 border-b border-blue-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-950 flex items-center">
                <Edit3 className="w-3.5 h-3.5 mr-1 text-blue-700" />
                Cliquez sur n'importe quel texte ou image ci-dessous pour modifier
              </span>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] rounded flex items-center shadow-2xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Ajouter un élément
                </button>

                {showAddMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-300 rounded-lg shadow-lg py-1 z-30 text-xs">
                    <button
                      type="button"
                      onClick={() => handleCreateNewBlock('paragraph')}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center"
                    >
                      <Type className="w-3.5 h-3.5 mr-2 text-slate-500" />
                      Paragraphe de texte
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateNewBlock('heading')}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center font-bold"
                    >
                      <Type className="w-3.5 h-3.5 mr-2 text-blue-800" />
                      Titre / En-tête
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateNewBlock('image')}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center"
                    >
                      <ImageIcon className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                      Logo ou Image
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateNewBlock('watermark')}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-500" />
                      Filigrane (Watermark)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pane Viewport */}
          <div className="flex-1 bg-slate-100 p-4 overflow-auto flex justify-center items-start">
            {activeTab === 'preview' ? (
              <div
                style={{
                  width: device === 'mobile' ? '380px' : '650px',
                  maxWidth: '100%',
                  transition: 'width 0.2s ease',
                }}
                className="bg-white shadow-md border border-slate-300 rounded overflow-hidden"
              >
                <iframe
                  title="Aperçu E-mail HTML"
                  srcDoc={emailHtml}
                  className="w-full h-[620px] border-0"
                  sandbox="allow-same-origin allow-popups"
                />
              </div>
            ) : activeTab === 'visual_editor' ? (
              <div className="w-full max-w-[650px] bg-white rounded-lg shadow-sm border border-slate-300 p-6 space-y-4">
                {doc.blocks.map((block) => {
                  const isSelected = selectedBlockId === block.id;
                  const isGraphic = block.type === 'image' || block.type === 'signature_stamp' || block.type === 'qr_code' || block.type === 'barcode';

                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`relative p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/20'
                          : 'border-transparent hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Top actions if selected */}
                      {isSelected && (
                        <div className="absolute -top-3 right-2 flex items-center space-x-1 bg-white border border-slate-300 rounded shadow-xs px-2 py-0.5 z-10 text-[11px]">
                          <span className="font-bold text-slate-700">{block.label}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteBlock?.(block.id);
                              setSelectedBlockId(null);
                            }}
                            className="text-red-600 hover:text-red-800 p-0.5"
                            title="Supprimer cet élément"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Graphic Block Rendering (Logo, Signature, QR, Barcode) */}
                      {isGraphic && (
                        <div className="space-y-3">
                          <div className={`flex ${block.imageAlignment === 'center' ? 'justify-center' : block.imageAlignment === 'right' ? 'justify-end' : 'justify-start'}`}>
                            {block.imageDataUrl ? (
                              <img
                                src={block.imageDataUrl}
                                alt={block.label}
                                style={{ maxWidth: block.imageWidth ? `${block.imageWidth}px` : '200px' }}
                                className="block h-auto object-contain border border-slate-200 rounded p-1 bg-white"
                              />
                            ) : (
                              <div className="p-4 border-2 border-dashed border-slate-300 rounded text-center text-xs text-slate-500">
                                Aucune image sélectionnée
                              </div>
                            )}
                          </div>

                          {/* Image Edit Controls if selected */}
                          {isSelected && (
                            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Replace Image Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPendingBlockIdForUpload(block.id);
                                    imageFileInputRef.current?.click();
                                  }}
                                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded flex items-center shadow-2xs"
                                >
                                  <Upload className="w-3 h-3 mr-1.5" />
                                  Remplacer l'image
                                </button>

                                {/* Free Hosting Button */}
                                <button
                                  type="button"
                                  onClick={() => handleUploadBlockImageToCDN(block)}
                                  disabled={isUploadingImage === block.id}
                                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold rounded flex items-center"
                                >
                                  <Globe className="w-3 h-3 mr-1.5 text-blue-700" />
                                  {isUploadingImage === block.id ? 'Hébergement...' : block.hostedUrl ? 'Déjà hébergé en HTTPS' : 'Héberger en ligne gratuitement'}
                                </button>
                              </div>

                              {block.hostedUrl && (
                                <div className="text-[10px] text-emerald-800 font-mono break-all bg-emerald-50 p-1.5 rounded border border-emerald-200">
                                  URL publique CDN : {block.hostedUrl}
                                </div>
                              )}

                              {/* Width Slider & Alignment */}
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                                    Largeur : {block.imageWidth || 200} px
                                  </label>
                                  <input
                                    type="range"
                                    min={60}
                                    max={600}
                                    value={block.imageWidth || 200}
                                    onChange={(e) =>
                                      onUpdateBlock?.(block.id, { imageWidth: Number(e.target.value) })
                                    }
                                    className="w-full"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                                    Alignement :
                                  </label>
                                  <div className="flex space-x-1">
                                    {(['left', 'center', 'right'] as const).map((al) => (
                                      <button
                                        key={al}
                                        type="button"
                                        onClick={() =>
                                          onUpdateBlock?.(block.id, { imageAlignment: al })
                                        }
                                        className={`flex-1 py-0.5 text-[10px] rounded border ${
                                          (block.imageAlignment || 'left') === al
                                            ? 'bg-blue-900 text-white border-blue-900'
                                            : 'bg-white text-slate-700 border-slate-200'
                                        }`}
                                      >
                                        {al === 'left' ? 'G' : al === 'center' ? 'C' : 'D'}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Watermark Rendering */}
                      {block.type === 'watermark' && (
                        <div className="p-3 text-center border border-dashed border-amber-300 bg-amber-50/40 rounded">
                          <input
                            type="text"
                            value={block.currentText}
                            onChange={(e) => onUpdateBlock?.(block.id, { currentText: e.target.value })}
                            className="w-full text-center font-bold text-lg text-slate-400 uppercase tracking-widest bg-transparent border-0 focus:outline-none"
                            placeholder="FILIGRANE (EX: CONFIDENTIEL)"
                          />
                        </div>
                      )}

                      {/* Text Blocks (Heading, Paragraph, Metadata, Salutation) */}
                      {!isGraphic && block.type !== 'watermark' && (
                        <div>
                          {isSelected ? (
                            <div className="space-y-2">
                              <textarea
                                rows={Math.max(2, Math.ceil(block.currentText.length / 60))}
                                value={block.currentText}
                                onChange={(e) =>
                                  onUpdateBlock?.(block.id, { currentText: e.target.value })
                                }
                                className="w-full p-2 text-sm bg-white border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                              />

                              {/* Typography Controls */}
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <label className="text-[11px] text-slate-600 flex items-center space-x-1">
                                  <span>Taille:</span>
                                  <input
                                    type="number"
                                    min={10}
                                    max={28}
                                    value={block.style?.fontSize || 13}
                                    onChange={(e) =>
                                      onUpdateBlock?.(block.id, {
                                        style: { ...block.style, fontSize: Number(e.target.value) },
                                      })
                                    }
                                    className="w-14 px-1 py-0.5 border border-slate-300 rounded text-xs"
                                  />
                                  <span>px</span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateBlock?.(block.id, {
                                      style: {
                                        ...block.style,
                                        fontWeight: block.style?.fontWeight === 'bold' ? 'normal' : 'bold',
                                      },
                                    })
                                  }
                                  className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                    block.style?.fontWeight === 'bold'
                                      ? 'bg-blue-900 text-white border-blue-900'
                                      : 'bg-white text-slate-700 border-slate-300'
                                  }`}
                                >
                                  Gras
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateBlock?.(block.id, {
                                      style: {
                                        ...block.style,
                                        fontStyle: block.style?.fontStyle === 'italic' ? 'normal' : 'italic',
                                      },
                                    })
                                  }
                                  className={`px-2 py-0.5 rounded text-xs italic border ${
                                    block.style?.fontStyle === 'italic'
                                      ? 'bg-blue-900 text-white border-blue-900'
                                      : 'bg-white text-slate-700 border-slate-300'
                                  }`}
                                >
                                  Italique
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{
                                fontSize: `${block.style?.fontSize || 13}px`,
                                fontWeight: block.style?.fontWeight || 'normal',
                                fontStyle: block.style?.fontStyle || 'normal',
                                color: block.style?.color || '#000000',
                                textAlign: block.style?.align || 'left',
                                lineHeight: block.style?.lineHeight || 1.45,
                              }}
                              className="cursor-pointer select-text"
                            >
                              {block.currentText}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-full bg-slate-900 rounded-lg p-3 overflow-auto">
                <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap select-all">
                  {emailHtml}
                </pre>
              </div>
            )}
          </div>

          {/* Pane Footer Info */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center text-blue-900 font-medium">
              <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Rendu responsive (Bureau 650px & Mobile)
            </span>
            <span>Compatible Gmail, Outlook, Kit & Apple Mail</span>
          </div>
        </div>
      </div>
    </div>
  );
};
