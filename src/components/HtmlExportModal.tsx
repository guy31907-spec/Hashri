/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Download, ExternalLink, Check, AlertCircle, Info, Sparkles, Mail } from 'lucide-react';
import { copyRichHtmlToClipboard, downloadHtmlFile } from '../services/htmlEmailGenerator';

interface HtmlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailHtml: string;
  fileName: string;
}

export const HtmlExportModal: React.FC<HtmlExportModalProps> = ({
  isOpen,
  onClose,
  emailHtml,
  fileName,
}) => {
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [copyRichSuccess, setCopyRichSuccess] = useState(false);
  const [activeGuide, setActiveGuide] = useState<'gmail' | 'outlook' | 'kit'>('gmail');

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
    const success = await copyRichHtmlToClipboard(emailHtml);
    setCopyRichSuccess(true);
    setTimeout(() => setCopyRichSuccess(false), 2500);
  };

  const handleDownloadFile = () => {
    const cleanName = fileName.replace(/\.[^/.]+$/, '') + '_email_modele';
    downloadHtmlFile(emailHtml, cleanName);
  };

  const handlePreviewNewWindow = () => {
    const blob = new Blob([emailHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Export & Intégration E-mail HTML
              </h3>
              <p className="text-xs text-slate-500">
                Mise en page par tableaux et styles intégrés (Gmail, Outlook, Kit, Thunderbird)
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
                  Recommandé pour Gmail
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
                Copier le contenu riche (Visuel formaté)
              </div>
              <p className="text-xs text-blue-100 mt-1">
                Permet de coller directement le document mis en forme dans la boîte de rédaction Gmail sans afficher le code.
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
                Copier le code HTML brut
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Copie le code source HTML complet avec structure de tableaux et styles inlinés.
              </p>
            </button>
          </div>

          {/* Secondary Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadFile}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs rounded-lg shadow-2xs flex items-center transition-colors"
            >
              <Download className="w-4 h-4 mr-2 text-slate-600" />
              Télécharger le fichier .html
            </button>
            <button
              type="button"
              onClick={handlePreviewNewWindow}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs rounded-lg shadow-2xs flex items-center transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2 text-slate-600" />
              Prévisualiser dans un nouvel onglet
            </button>
          </div>

          {/* CRITICAL GMAIL WARNING & GUIDE */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center text-amber-900 font-bold text-sm">
              <AlertCircle className="w-4 h-4 mr-2 text-amber-700 shrink-0" />
              Avertissement essentiel pour les utilisateurs de Gmail
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>Gmail ne permet pas de coller directement le code source HTML brut</strong> dans le corps d'un nouveau message (le texte brut serait affiché tel quel). 
              Pour envoyer votre modèle avec Gmail :
            </p>
            <ol className="text-xs text-amber-800 list-decimal list-inside space-y-1 pl-1">
              <li>Cliquez sur le bouton bleu ci-dessus <strong>« Copier le contenu riche »</strong>.</li>
              <li>Ouvrez votre boîte Gmail et cliquez sur <strong>Nouveau message</strong>.</li>
              <li>Faites simplement <strong>Ctrl + V</strong> (ou <strong>Cmd + V</strong> sur Mac) dans la zone de texte. Le document formaté avec logos et tableaux apparaît instantanément !</li>
            </ol>
          </div>

          {/* Client compatibility matrix */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Conformité technique aux messageries
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Gmail & Google Workspace</span>
                <span>Support complet des tableaux, polices de sécurité et images intégrées base64 authentiques.</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Microsoft Outlook</span>
                <span>Balises conditionnelles MSO (Vector Markup Language) incluses pour éviter les décalages.</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Kit / Mailchimp</span>
                <span>Collez le code HTML brut dans le bloc « Custom HTML / Code » de votre outil de diffusion.</span>
              </div>
            </div>
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
