/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { ParsedDocument, DocumentVariables } from '../types/document';
import {
  downloadOriginalSourceFile,
  exportUpdatedPdfFromElement,
  getDifferencesList,
  hasDocumentModifications,
} from '../services/pdfExporter';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ParsedDocument;
  variables: DocumentVariables;
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  variables,
  previewContainerRef,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const differences = getDifferencesList(doc, variables);
  const isModified = hasDocumentModifications(doc, variables);
  const modifiedDiffs = differences.filter((d) => d.status === 'modified');
  const intactAssets = differences.filter((d) => d.status === 'verified_intact');

  const handleDownloadOriginal = () => {
    setIsExporting(true);
    setTimeout(() => {
      downloadOriginalSourceFile(doc);
      setIsExporting(false);
      setExportSuccess('Fichier original source téléchargé avec une fidélité 100% binaire intacte.');
      setTimeout(() => setExportSuccess(null), 3000);
    }, 300);
  };

  const handleDownloadUpdated = async () => {
    setIsExporting(true);
    try {
      if (previewContainerRef.current) {
        await exportUpdatedPdfFromElement(
          previewContainerRef.current,
          `${doc.fileName.replace(/\.[^/.]+$/, '')}_personnalise.pdf`
        );
        setExportSuccess('Nouveau PDF généré et téléchargé avec succès.');
      } else {
        // Fallback to original
        downloadOriginalSourceFile(doc);
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportSuccess(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-800 text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Exportation du Document PDF
              </h3>
              <p className="text-xs text-slate-500">
                Téléchargement du fichier original ou de la version personnalisée
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
          {exportSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
              {exportSuccess}
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Option 1: Original untouched file */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Copie Bit-à-Bit
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  PDF Source Original Non Modifié
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Télécharge exactement le fichier source importé avec ses métadonnées, polices et résolutions d'origine sans la moindre altération.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadOriginal}
                disabled={isExporting}
                className="mt-4 w-full py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs rounded-lg shadow-2xs flex items-center justify-center transition-colors"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Télécharger le PDF Source
              </button>
            </div>

            {/* Option 2: Updated modified PDF */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                  Version Personnalisée
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Générer le PDF avec Textes Mis à Jour
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Génère un nouveau fichier PDF haute définition intégrant vos variables modifiées tout en conservant les logos et signatures verrouillés.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadUpdated}
                disabled={isExporting}
                className="mt-4 w-full py-2.5 px-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center transition-colors"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Télécharger le PDF Modifié
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Differences and integrity audit */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-900" />
              Rapport d'Intégrité & Différences Constatées
            </h4>

            {isModified ? (
              <div className="space-y-2 mt-3">
                <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-start">
                  <AlertTriangle className="w-4 h-4 mr-2 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>{modifiedDiffs.length} modification(s) de texte détectée(s) :</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                      {modifiedDiffs.map((d, i) => (
                        <li key={i}>
                          <span className="font-semibold">{d.field}</span> : « {d.original.slice(0, 30)}... » remplacé par « {d.modified.slice(0, 30)}... »
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                Aucune modification textuelle apportée : la version générée est strictement identique au document source.
              </p>
            )}

            {/* Inviolable assets confirmation */}
            <div className="mt-3 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">
                Éléments graphiques inviolables contrôlés :
              </span>
              {intactAssets.map((asset, i) => (
                <div key={i} className="flex items-center text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
                  <span>{asset.field} : 100% conservé sans aucune retouche.</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
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
