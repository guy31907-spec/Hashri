/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Download, ExternalLink, Check, AlertCircle, Info, Sparkles, Mail, FileText, Globe, CloudUpload, RefreshCw } from 'lucide-react';
import { copyRichHtmlToClipboard, downloadHtmlFile } from '../services/htmlEmailGenerator';
import { exportToWordDocx } from '../services/wordExporter';
import { uploadAllDocumentImages } from '../services/imageHostingService';
import { ParsedDocument, DocumentVariables, RecipientDownloadConfig } from '../types/document';

interface HtmlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailHtml: string;
  document: ParsedDocument;
  variables: DocumentVariables;
  downloadConfig: RecipientDownloadConfig;
  onUpdateDocument?: (doc: ParsedDocument) => void;
}

export const HtmlExportModal: React.FC<HtmlExportModalProps> = ({
  isOpen,
  onClose,
  emailHtml,
  document: doc,
  variables,
  downloadConfig,
  onUpdateDocument,
}) => {
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [copyRichSuccess, setCopyRichSuccess] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isHostingImages, setIsHostingImages] = useState(false);
  const [hostingMessage, setHostingMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyRawCode = async () => {
    try {
      await navigator.clipboard.writeText(emailHtml);
      setCopyCodeSuccess(true);
      setTimeout(() => setCopyCodeSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyRichText = async () => {
    await copyRichHtmlToClipboard(emailHtml);
    setCopyRichSuccess(true);
    setTimeout(() => setCopyRichSuccess(false), 2500);
  };

  const handleDownloadFile = () => {
    const cleanName = (doc.fileName || 'document').replace(/\.[^/.]+$/, '') + '_email_modele';
    downloadHtmlFile(emailHtml, cleanName);
  };

  const handleDownloadWord = async () => {
    setIsExportingWord(true);
    try {
      await exportToWordDocx(doc, variables, downloadConfig);
    } catch (err) {
      console.error('Word export error:', err);
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleHostImagesOnline = async () => {
    setIsHostingImages(true);
    setHostingMessage('Hébergement gratuit en cours sur CDN public sécurisé...');
    try {
      const updated = await uploadAllDocumentImages(doc, (curr, tot) => {
        setHostingMessage(`Téléversement de l'image ${curr}/${tot}...`);
      });
      onUpdateDocument?.(updated);
      setHostingMessage('Toutes les images sont hébergées en ligne avec succès ! Vos destinataires les verront sans blocage.');
      setTimeout(() => setHostingMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setHostingMessage(err.message || 'Erreur lors de l\'hébergement.');
    } finally {
      setIsHostingImages(false);
    }
  };

  const handlePreviewNewWindow = () => {
    const blob = new Blob([emailHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const hostedCount = doc.blocks.filter((b) => !!b.hostedUrl).length;
  const imageBlocksCount = doc.blocks.filter((b) => !!b.imageDataUrl).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Centre d'Exportation Multi-Formats & E-mail
              </h3>
              <p className="text-xs text-slate-500">
                Texte 100% modifiable dans Gmail / Outlook, export Word (.docx), PDF et HTML
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {hostingMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center">
              <Check className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
              {hostingMessage}
            </div>
          )}

          {/* Main Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Copy Rich (Recommended for Gmail & Webmail) */}
            <button
              type="button"
              onClick={handleCopyRichText}
              className="p-4 bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-sm text-left transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-blue-200">
                  Coller directement dans Gmail / Webmail
                </span>
                {copyRichSuccess ? (
                  <span className="inline-flex items-center text-xs text-emerald-300 font-bold">
                    <Check className="w-4 h-4 mr-1" /> Copié !
                  </span>
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
              </div>
              <div className="text-sm font-bold">
                Copier le contenu enrichi (Texte & Graphismes)
              </div>
              <p className="text-xs text-blue-100 mt-1">
                Collez (Ctrl+V) dans Gmail ou Outlook : tout le texte reste sélectionnable et modifiable directement dans votre fenêtre de messagerie !
              </p>
            </button>

            {/* Copy Raw HTML Code */}
            <button
              type="button"
              onClick={handleCopyRawCode}
              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 rounded-xl shadow-2xs text-left transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                  Pour Kit, Mailchimp & CRM
                </span>
                {copyCodeSuccess && (
                  <span className="inline-flex items-center text-xs text-emerald-600 font-bold">
                    <Check className="w-4 h-4 mr-1" /> Code copié !
                  </span>
                )}
              </div>
              <div className="text-sm font-bold flex items-center">
                <Copy className="w-4 h-4 mr-1.5 text-blue-800" />
                Copier le code HTML source brut
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Code HTML pur avec tables, styles inline et balises compatibles pour gabarits d'e-mailing.
              </p>
            </button>
          </div>

          {/* Secondary Exports (Word docx, HTML, Preview) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Téléchargements de fichiers complets :
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Word Export (.docx) */}
              <button
                type="button"
                onClick={handleDownloadWord}
                disabled={isExportingWord}
                className="p-3 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 rounded-lg text-left transition-all flex items-center space-x-2.5"
              >
                <div className="w-8 h-8 rounded bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {isExportingWord ? 'Export Word...' : 'Format Word (.docx)'}
                  </span>
                  <span className="text-[10px] text-slate-500">Document Word éditable</span>
                </div>
              </button>

              {/* HTML Export */}
              <button
                type="button"
                onClick={handleDownloadFile}
                className="p-3 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 rounded-lg text-left transition-all flex items-center space-x-2.5"
              >
                <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Fichier HTML (.html)
                  </span>
                  <span className="text-[10px] text-slate-500">Pour intégration webmail</span>
                </div>
              </button>

              {/* Browser Preview */}
              <button
                type="button"
                onClick={handlePreviewNewWindow}
                className="p-3 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 rounded-lg text-left transition-all flex items-center space-x-2.5"
              >
                <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Aperçu Navigateur
                  </span>
                  <span className="text-[10px] text-slate-500">Ouvrir dans un onglet</span>
                </div>
              </button>
            </div>
          </div>

          {/* FREE ONLINE IMAGE HOSTING MODULE */}
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center">
                  <CloudUpload className="w-4 h-4 mr-1.5 text-blue-700" />
                  Hébergement en ligne gratuit des images & logos
                </h4>
                <p className="text-xs text-blue-900/80 mt-0.5">
                  Héberge gratuitement vos logos, signatures et images sur un CDN public sécurisé (Catbox / CDN) afin que chaque destinataire les voie immédiatement sans blocage de messagerie.
                </p>
              </div>

              <button
                type="button"
                onClick={handleHostImagesOnline}
                disabled={isHostingImages}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center justify-center shrink-0 transition-colors"
              >
                {isHostingImages ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Hébergement...
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                    Héberger en ligne (1 clic)
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-blue-100">
              <span className="font-semibold text-slate-800">
                Statut des images :
              </span>
              <span>
                {hostedCount > 0
                  ? `${hostedCount} image(s) hébergée(s) en HTTPS public`
                  : 'Images intégrées en Base64 (cliquez pour héberger en ligne)'}
              </span>
            </div>
          </div>

          {/* GMAIL EDITABILITY NOTICE */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center text-amber-900 font-bold text-sm">
              <AlertCircle className="w-4 h-4 mr-2 text-amber-700 shrink-0" />
              Comment modifier les textes et éléments après le collage dans Gmail
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Contrairement à une simple capture d'écran, <strong>DOCUFIDÈLE génère du vrai texte HTML</strong> :
            </p>
            <ol className="text-xs text-amber-800 list-decimal list-inside space-y-1 pl-1">
              <li>Cliquez sur <strong>« Copier le contenu enrichi »</strong> ci-dessus.</li>
              <li>Ouvrez votre boîte Gmail et appuyez sur <strong>Ctrl+V</strong> (ou <strong>Cmd+V</strong>).</li>
              <li>Vous pouvez <strong>cliquer sur n'importe quel mot pour le modifier, remplacer le logo ou changer la signature</strong> directement dans Gmail avant l'envoi !</li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
