/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, CheckCircle, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { parsePdfFile, parseDocxFile, parseImageFile } from '../services/documentParser';
import { getSampleDocumentsAsync } from '../services/sampleDocuments';
import { ParsedDocument } from '../types/document';

interface DocumentUploaderProps {
  onDocumentLoaded: (doc: ParsedDocument) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onDocumentLoaded,
  isProcessing,
  setIsProcessing,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      setProgressStep('Lecture du fichier source et sécurisation...');

      let parsed: ParsedDocument;

      if (ext === 'pdf') {
        setProgressStep('Analyse structurelle PDF & extraction du rendu haute définition...');
        parsed = await parsePdfFile(file);
      } else if (ext === 'docx' || ext === 'doc') {
        setProgressStep('Extraction des textes, tableaux et images d\'origine du document DOCX...');
        parsed = await parseDocxFile(file);
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
        setProgressStep('Analyse géométrique du document image et découpage fidèle...');
        parsed = await parseImageFile(file);
      } else {
        throw new Error('Format non supporté. Veuillez importer un fichier PDF, DOCX, JPG, JPEG ou PNG.');
      }

      setProgressStep('Verrouillage des logos, cachets et signatures d\'origine...');
      setTimeout(() => {
        setIsProcessing(false);
        onDocumentLoaded(parsed);
      }, 400);
    } catch (err: any) {
      console.error('Error importing document:', err);
      setErrorMessage(err.message || 'Impossible d\'analyser ce document. Vérifiez le format.');
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleLoadSample = async () => {
    setIsProcessing(true);
    setProgressStep('Chargement de la Lettre Officielle IRCC IMM5739...');
    try {
      const samples = await getSampleDocumentsAsync();
      if (samples.length > 0) {
        onDocumentLoaded(samples[0]);
      }
    } catch (err) {
      console.error('Error loading sample:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Intro hero banner */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
          Transformez vos documents en e-mails fidèles
        </h1>
        <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
          Compatible <span className="font-semibold text-slate-800">Gmail, Outlook, Kit & Apple Mail</span>. 
          Préserve scrupuleusement vos logos, signatures et mises en page d'origine, avec export PDF certifié.
        </p>

        {/* Guarantees bar */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <span className="flex items-center text-slate-700">
            <CheckCircle className="w-4 h-4 text-emerald-600 mr-1.5" />
            100% Traitement local (Confidentialité totale)
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center text-slate-700">
            <ShieldAlert className="w-4 h-4 text-blue-700 mr-1.5" />
            Zéro IA générative (Aucun logo ni signature inventé)
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center text-slate-700">
            <CheckCircle className="w-4 h-4 text-emerald-600 mr-1.5" />
            Export HTML Tableaux + PDF
          </span>
        </div>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-blue-600 bg-blue-50/70 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/50'
        } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleInputChange}
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="py-6 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-800 rounded-full animate-spin mb-4" />
            <p className="text-base font-semibold text-slate-900">{progressStep}</p>
            <p className="text-xs text-slate-500 mt-1">Analyse des structures, polices et éléments graphiques originaux...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Déposez votre document ici, ou cliquez pour parcourir
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              Prise en charge directe des formats <strong className="text-slate-800">PDF, DOCX, JPG, JPEG et PNG</strong> depuis votre ordinateur ou smartphone.
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded border border-slate-200">
                📄 PDF
              </span>
              <span className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded border border-slate-200">
                📝 DOCX / Word
              </span>
              <span className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded border border-slate-200">
                🖼️ JPG / PNG Scanné
              </span>
            </div>

            <button
              type="button"
              className="mt-6 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors"
            >
              Sélectionner un fichier sur mon appareil
            </button>
          </div>
        )}
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-red-600" />
          <div>
            <strong>Erreur d'importation : </strong> {errorMessage}
          </div>
        </div>
      )}

      {/* Instant sample button */}
      <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-left">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Document officiel de démonstration
            </h4>
            <p className="text-xs text-slate-500">
              Testez avec la Lettre Officielle IRCC Canada (IMM5739) : reproduction 100% fidèle, zéro IA, zéro faux élément.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLoadSample}
          disabled={isProcessing}
          className="w-full sm:w-auto shrink-0 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
        >
          Charger la Lettre IMM 5739
        </button>
      </div>
    </div>
  );
};
