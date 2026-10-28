/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Paperclip, Link as LinkIcon, ShieldCheck, AlertTriangle, Check, Info } from 'lucide-react';
import { RecipientDownloadConfig } from '../types/document';

interface RecipientDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RecipientDownloadConfig;
  onSave: (config: RecipientDownloadConfig) => void;
}

export const RecipientDownloadModal: React.FC<RecipientDownloadModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [mode, setMode] = useState<RecipientDownloadConfig['mode']>(config.mode);
  const [downloadUrl, setDownloadUrl] = useState<string>(config.downloadUrl);
  const [buttonLabel, setButtonLabel] = useState<string>(config.buttonLabel);
  const [expiresInDays, setExpiresInDays] = useState<number>(config.expiresInDays || 30);
  const [urlError, setUrlError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setUrlError(null);
    if ((mode === 'download_button' || mode === 'both') && (!downloadUrl || !downloadUrl.trim().startsWith('http'))) {
      setUrlError('Veuillez saisir une URL réelle et valide commençant par https:// ou choisir la solution "Pièce jointe directe".');
      return;
    }

    onSave({
      mode,
      downloadUrl: downloadUrl.trim(),
      buttonLabel: buttonLabel.trim() || 'Télécharger le document PDF officiel',
      securityNotice: 'Lien sécurisé vers le document officiel certifié conforme.',
      expiresInDays,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Configuration de Téléchargement Destinataire
              </h3>
              <p className="text-xs text-slate-500">
                Solutions conformes pour transmettre le PDF au destinataire
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

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Solution Selector */}
          <div>
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
              Choisissez la méthode de mise à disposition :
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Solution 1: Direct Attachment */}
              <div
                onClick={() => setMode('attachment')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  mode === 'attachment'
                    ? 'border-blue-900 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Recommandé & 100% Autonome
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Solution 1 : Pièce jointe directe
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Le PDF est joint directement à l'e-mail. Aucun serveur de stockage externe n'est requis et vos documents privés ne transitent nulle part.
                </p>
              </div>

              {/* Solution 2: Download Button */}
              <div
                onClick={() => setMode('download_button')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  mode === 'download_button'
                    ? 'border-blue-900 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Bouton dans l'e-mail
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Solution 2 : Bouton de téléchargement
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Affiche un bouton cliquable dans le corps de l'e-mail pointant vers une URL réelle et sécurisée fournie par vos soins.
                </p>
              </div>
            </div>
          </div>

          {/* Configuration if Download button or both */}
          {(mode === 'download_button' || mode === 'both') && (
            <div className="space-y-4 border border-blue-200 bg-blue-50/30 p-4 rounded-xl">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  URL réelle et sécurisée du document PDF (Google Drive, Cloud S3, Dropbox...)
                </label>
                <input
                  type="url"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="https://storage.mon-entreprise.fr/factures/FC-2026.pdf"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
                {urlError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    {urlError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Texte affiché sur le bouton
                  </label>
                  <input
                    type="text"
                    value={buttonLabel}
                    onChange={(e) => setButtonLabel(e.target.value)}
                    placeholder="Télécharger le document PDF officiel"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Durée de validité indicative du lien
                  </label>
                  <select
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  >
                    <option value={7}>7 jours</option>
                    <option value={15}>15 jours</option>
                    <option value={30}>30 jours</option>
                    <option value={90}>90 jours</option>
                  </select>
                </div>
              </div>

              {/* SECURITY & PRIVACY NOTICE */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Sécurité et confidentialité des données privées :</strong>
                  <p className="mt-0.5">
                    DOCUFIDÈLE ne crée jamais de faux liens ni de stockage public non autorisé. 
                    Si vous utilisez un bouton de téléchargement, assurez-vous que l'URL provient de votre propre infrastructure sécurisée avec droits d'accès ou mot de passe.
                  </p>
                </div>
              </div>
            </div>
          )}

          {mode === 'attachment' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start text-xs text-slate-600">
              <Info className="w-4 h-4 mr-2 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <strong>Comment procéder lors de l'envoi de votre e-mail :</strong>
                <ol className="list-decimal list-inside mt-1 space-y-0.5">
                  <li>Collez le modèle dans Gmail ou votre logiciel de messagerie.</li>
                  <li>Cliquez sur l'icône trombone (joindre un fichier) de votre messagerie.</li>
                  <li>Sélectionnez le fichier PDF exporté via DOCUFIDÈLE.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Enregistrer les paramètres
          </button>
        </div>
      </div>
    </div>
  );
};
