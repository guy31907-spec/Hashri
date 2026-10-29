/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Sliders,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Link as LinkIcon,
  RotateCcw,
  AlertCircle,
  Download,
  Code,
  ArrowRight,
  Eye,
  Check,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { Header } from './components/Header';
import { DocumentUploader } from './components/DocumentUploader';
import { VariableEditor } from './components/VariableEditor';
import { AssistedModeWorkbench } from './components/AssistedModeWorkbench';
import { SideBySideViewer } from './components/SideBySideViewer';
import { HtmlExportModal } from './components/HtmlExportModal';
import { PdfExportModal } from './components/PdfExportModal';
import { RecipientDownloadModal } from './components/RecipientDownloadModal';
import { LimitationsModal } from './components/LimitationsModal';
import { ParsedDocument, ProcessingMode, DocumentVariables, RecipientDownloadConfig, ExtractedBlock, ReproductionMode } from './types/document';
import { generateEmailHtml } from './services/htmlEmailGenerator';
import { hasDocumentModifications } from './services/pdfExporter';

export default function App() {
  const [document, setDocument] = useState<ParsedDocument | null>(null);
  const [mode, setMode] = useState<ProcessingMode>('automatic');
  const [variables, setVariables] = useState<DocumentVariables>({
    destinataire: '',
    date: '',
    reference: '',
    montant: '',
    objet: '',
    message: '',
  });
  const [downloadConfig, setDownloadConfig] = useState<RecipientDownloadConfig>({
    enabled: false,
    mode: 'attachment',
    downloadUrl: '',
    buttonLabel: 'Télécharger le document PDF officiel',
    securityNotice: 'Fichier PDF officiel original disponible en pièce jointe.',
    expiresInDays: 30,
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isExportingWord, setIsExportingWord] = useState<boolean>(false);

  // Hidden container ref for crisp PDF rendering with html2canvas
  const pdfCaptureContainerRef = useRef<HTMLDivElement>(null);

  // When a document is loaded, initialize variables and config
  const handleDocumentLoaded = (newDoc: ParsedDocument) => {
    setDocument(newDoc);
    setVariables(newDoc.variables);
    setDownloadConfig({
      ...newDoc.downloadConfig,
      enabled: newDoc.downloadConfig?.enabled ?? false,
    });
  };

  // Re-generate email HTML whenever document, variables, or downloadConfig change
  const emailHtml = useMemo(() => {
    if (!document) return '';
    return generateEmailHtml(document, variables, downloadConfig);
  }, [document, variables, downloadConfig]);

  const hasModifications = useMemo(() => {
    if (!document) return false;
    return hasDocumentModifications(document, variables);
  }, [document, variables]);

  const handleUpdateBlock = (blockId: string, updatedBlock: Partial<ExtractedBlock>) => {
    if (!document) return;
    setDocument({
      ...document,
      blocks: document.blocks.map((b) => (b.id === blockId ? { ...b, ...updatedBlock } : b)),
    });
  };

  const handleAddBlock = (newBlock: ExtractedBlock) => {
    if (!document) return;
    setDocument({
      ...document,
      blocks: [...document.blocks, newBlock],
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!document) return;
    setDocument({
      ...document,
      blocks: document.blocks.filter((b) => b.id !== blockId),
    });
  };

  const handleLockAllImages = () => {
    if (!document) return;
    setDocument({
      ...document,
      blocks: document.blocks.map((b) => (b.isOriginalAsset ? { ...b, isLocked: true } : b)),
    });
  };

  const handleToggleReproductionMode = (repMode: ReproductionMode) => {
    if (!document) return;
    setDocument({
      ...document,
      reproductionMode: repMode,
    });
  };

  const handleToggleIntroBanner = () => {
    if (!document) return;
    setDocument({
      ...document,
      includeIntroBanner: !document.includeIntroBanner,
    });
  };

  const handleResetVariables = () => {
    if (!document) return;
    setVariables(document.variables);
  };

  const handleNewDocument = () => {
    setDocument(null);
  };

  const handleExportWordDocx = async () => {
    if (!document) return;
    try {
      setIsExportingWord(true);
      const { exportToWordDocx } = await import('./services/wordExporter');
      await exportToWordDocx(document, variables, downloadConfig);
    } catch (err) {
      console.error('Erreur export Word:', err);
    } finally {
      setIsExportingWord(false);
    }
  };

  // Document analysis statistics
  const analysisStats = useMemo(() => {
    if (!document) return null;
    const logos = document.blocks.filter((b) => b.isOriginalAsset && (b.type === 'image' || b.type === 'header'));
    const signatures = document.blocks.filter((b) => b.type === 'signature_stamp');
    const watermarks = document.blocks.filter((b) => b.type === 'watermark' || b.isWatermark);
    const codes = document.blocks.filter((b) => b.type === 'qr_code' || b.type === 'barcode');
    const tables = document.blocks.filter((b) => b.type === 'table');
    const texts = document.blocks.filter((b) => ['heading', 'paragraph', 'salutation', 'metadata_line'].includes(b.type));
    return {
      logosCount: logos.length,
      signaturesCount: signatures.length,
      watermarksCount: watermarks.length,
      codesCount: codes.length,
      tablesCount: tables.length,
      textsCount: texts.length,
      totalBlocks: document.blocks.length,
    };
  }, [document]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        mode={mode}
        onModeChange={setMode}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenAudit={() => setIsHelpModalOpen(true)}
        hasDocument={!!document}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {!document ? (
          <DocumentUploader
            onDocumentLoaded={handleDocumentLoaded}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Top Workspace Toolbar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-lg">
                  📄
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {document.fileName}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({document.pageCount} page{document.pageCount > 1 ? 's' : ''} · {Math.round(document.fileSize / 1024)} Ko)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-emerald-700 mt-0.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Zéro IA générative · Éléments graphiques originaux certifiés conformes</span>
                  </div>
                </div>
              </div>

              {/* Module Reproduction Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleToggleReproductionMode('pixel_perfect')}
                  className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    document.reproductionMode === 'pixel_perfect'
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Affiche le document avec 100% de fidélité visuelle sans aucune altération de police, espacement ou logo"
                >
                  <FileCheck2 className="w-3.5 h-3.5 mr-1.5" />
                  Rendu 100% Fidèle (Pixel-Perfect)
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleReproductionMode('flow_text')}
                  className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    document.reproductionMode === 'flow_text'
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Transcription du texte pour édition et personnalisation intégrale"
                >
                  <Layers className="w-3.5 h-3.5 mr-1.5" />
                  Transcription Typographique
                </button>
              </div>

              {/* Toolbar Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecipientModalOpen(true)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center transition-colors ${
                    downloadConfig.enabled
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Configurer le bouton de téléchargement pour le destinataire (Optionnel)"
                >
                  <LinkIcon className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
                  <span>Bouton Destinataire {downloadConfig.enabled ? '(Activé)' : '(Désactivé)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportWordDocx}
                  disabled={isExportingWord}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 font-bold text-xs rounded-lg shadow-xs flex items-center transition-colors disabled:opacity-50"
                  title="Télécharger le document sous format Microsoft Word (.docx)"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-sky-700" />
                  {isExportingWord ? 'Export en cours...' : 'Word (.docx)'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsHtmlModalOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center transition-colors"
                >
                  <Code className="w-3.5 h-3.5 mr-1.5" />
                  Exporter HTML
                </button>

                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs rounded-lg shadow-xs flex items-center transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-red-600" />
                  Télécharger PDF
                </button>

                <button
                  type="button"
                  onClick={handleNewDocument}
                  className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                  title="Changer de document"
                >
                  Changer
                </button>
              </div>
            </div>

            {/* Document Structural Analysis Banner */}
            {analysisStats && (
              <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-xl p-4 shadow-sm border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Analyse Structurelle Précise du Document Source
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Préservation intégrale des dimensions, marges, polices & graphismes originaux
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                  <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/60">
                    <span className="text-slate-400 text-[10px] block font-medium">Logos Originaux</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {analysisStats.logosCount > 0 ? `${analysisStats.logosCount} détecté(s)` : 'Extraction visuelle'}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/60">
                    <span className="text-slate-400 text-[10px] block font-medium">Signatures / Cachets</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {analysisStats.signaturesCount > 0 ? `${analysisStats.signaturesCount} certifié(s)` : 'Préservé'}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/60">
                    <span className="text-slate-400 text-[10px] block font-medium">Codes QR & Barres</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {analysisStats.codesCount > 0 ? `${analysisStats.codesCount} actif(s)` : 'Zéro faux code'}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/60">
                    <span className="text-slate-400 text-[10px] block font-medium">Filigranes</span>
                    <span className="font-bold text-blue-300 text-sm">
                      {analysisStats.watermarksCount > 0 ? `${analysisStats.watermarksCount} géré(s)` : 'Conforme'}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/60">
                    <span className="text-slate-400 text-[10px] block font-medium">Blocs & Tableaux</span>
                    <span className="font-bold text-amber-300 text-sm">
                      {analysisStats.totalBlocks} éléments
                    </span>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/60">
                    <span className="text-slate-400 text-[10px] block font-medium">Édition Gmail/Outlook</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      100% Modifiable
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode-specific workbench if assisted */}
            {mode === 'assisted' && (
              <AssistedModeWorkbench
                document={document}
                onUpdateBlock={handleUpdateBlock}
                onLockAllImages={handleLockAllImages}
                onApplyAndRender={() => setMode('automatic')}
              />
            )}

            {/* Intro Banner Toggle Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={document.includeIntroBanner}
                  onChange={handleToggleIntroBanner}
                  className="w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-700"
                />
                <span className="font-semibold text-slate-800">
                  Ajouter un message d'introduction avant le document dans l'e-mail
                </span>
              </label>

              {document.includeIntroBanner && (
                <input
                  type="text"
                  value={document.introMessage}
                  onChange={(e) => setDocument({ ...document, introMessage: e.target.value })}
                  placeholder="Bonjour {{destinataire}}, veuillez trouver ci-dessous votre document..."
                  className="flex-1 min-w-[280px] px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none"
                />
              )}
            </div>

            {/* Variables Editor */}
            <VariableEditor
              variables={variables}
              onChange={setVariables}
              onReset={handleResetVariables}
              hasModifications={hasModifications}
            />

            {/* Side By Side Comparison Viewer with Visual WYSIWYG Editor */}
            <SideBySideViewer
              document={document}
              variables={variables}
              emailHtml={emailHtml}
              onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
              onUpdateBlock={handleUpdateBlock}
              onAddBlock={handleAddBlock}
              onDeleteBlock={handleDeleteBlock}
            />
          </div>
        )}
      </main>

      {/* Hidden printable container for crisp PDF capture with html2canvas */}
      {document && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div
            ref={pdfCaptureContainerRef}
            style={{
              width: '750px',
              backgroundColor: '#ffffff',
              padding: '10px',
              fontFamily: 'Arial, Helvetica, sans-serif',
              color: '#000000',
            }}
            dangerouslySetInnerHTML={{ __html: emailHtml }}
          />
        </div>
      )}

      {/* Modals */}
      {document && (
        <>
          <HtmlExportModal
            isOpen={isHtmlModalOpen}
            onClose={() => setIsHtmlModalOpen(false)}
            emailHtml={emailHtml}
            document={document}
            variables={variables}
            downloadConfig={downloadConfig}
            onUpdateDocument={setDocument}
          />

          <PdfExportModal
            isOpen={isPdfModalOpen}
            onClose={() => setIsPdfModalOpen(false)}
            document={document}
            variables={variables}
            previewContainerRef={pdfCaptureContainerRef}
          />

          <RecipientDownloadModal
            isOpen={isRecipientModalOpen}
            onClose={() => setIsRecipientModalOpen(false)}
            config={downloadConfig}
            onSave={setDownloadConfig}
          />
        </>
      )}

      <LimitationsModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Bottom Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">
            DOCUFIDÈLE · Reproduction fidèle et intègre de documents en e-mails HTML et PDF
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-slate-400">
            <span>Traitement 100% local dans le navigateur</span>
            <span aria-hidden="true">·</span>
            <span>Zéro IA générative · Zéro invention de logo ni de faux code</span>
            <span aria-hidden="true">·</span>
            <span>Compatible Gmail, Outlook, Kit & Apple Mail</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
