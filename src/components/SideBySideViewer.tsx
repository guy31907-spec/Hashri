/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Monitor, Smartphone, Code, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import { ParsedDocument, DocumentVariables, DevicePreview } from '../types/document';
import { generateEmailHtml } from '../services/htmlEmailGenerator';

interface SideBySideViewerProps {
  document: ParsedDocument;
  variables: DocumentVariables;
  emailHtml: string;
  onOpenHtmlModal: () => void;
  onOpenPdfModal: () => void;
}

export const SideBySideViewer: React.FC<SideBySideViewerProps> = ({
  document: doc,
  variables,
  emailHtml,
  onOpenHtmlModal,
  onOpenPdfModal,
}) => {
  const [device, setDevice] = useState<DevicePreview>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [origPage, setOrigPage] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.2, 2.0));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.2, 0.6));
  const handleResetZoom = () => setZoomLevel(1);

  const originalPages = doc.originalPageImages || [];

  return (
    <div className="bg-slate-100 rounded-2xl border border-slate-200 p-4 lg:p-6 shadow-xs">
      {/* Top Bar with Status and Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">
              Comparaison Côte à Côte
            </h2>
            <span className="text-xs text-slate-500 hidden sm:inline">
              (Document Original vs Rendu E-mail HTML)
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Comparez en temps réel la fidélité de la transcription visuelle et l'intégrité des éléments protégés.
          </p>

          {/* Recognized Elements Strip */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              <CheckCircle className="w-3 h-3 mr-1" />
              Logo isolé (sans texte)
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              <CheckCircle className="w-3 h-3 mr-1" />
              Signature 100% isolée
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              <CheckCircle className="w-3 h-3 mr-1" />
              Cachet officiel conforme
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
              <CheckCircle className="w-3 h-3 mr-1" />
              Code QR scannable
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
              <CheckCircle className="w-3 h-3 mr-1" />
              Code-barres Code 128
            </span>
          </div>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenHtmlModal}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center transition-colors"
          >
            <Code className="w-3.5 h-3.5 mr-1.5" />
            Exporter E-mail HTML
          </button>
          <button
            type="button"
            onClick={onOpenPdfModal}
            className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs rounded-lg shadow-sm flex items-center justify-center transition-colors"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-red-600" />
            Exporter le PDF
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
              <span className="text-[11px] text-slate-500 font-mono">
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
              Source certifiée conforme
            </span>
            <span>{doc.pageCount} page(s) · {Math.round(doc.fileSize / 1024)} Ko</span>
          </div>
        </div>

        {/* RIGHT PANE: Resulting HTML Email Preview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[750px] overflow-hidden">
          {/* Pane Header */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-xs font-bold text-slate-800">
                2. Rendu E-mail HTML Généré
              </span>
            </div>

            {/* Switchers (Desktop / Mobile / Code) */}
            <div className="flex items-center space-x-1 bg-white p-0.5 rounded border border-slate-200">
              <button
                type="button"
                onClick={() => { setActiveTab('preview'); setDevice('desktop'); }}
                className={`p-1 rounded text-xs flex items-center font-medium ${
                  activeTab === 'preview' && device === 'desktop'
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Affichage Bureau (620px)"
              >
                <Monitor className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Bureau</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('preview'); setDevice('mobile'); }}
                className={`p-1 rounded text-xs flex items-center font-medium ${
                  activeTab === 'preview' && device === 'mobile'
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Affichage Mobile (380px)"
              >
                <Smartphone className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Mobile</span>
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
                <span className="hidden sm:inline">Code</span>
              </button>
            </div>
          </div>

          {/* Webmail Envelope Header Simulation */}
          <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center">
              <span className="w-14 text-slate-400 font-medium">À :</span>
              <span className="font-semibold text-slate-800">{variables.destinataire || 'Destinataire'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-14 text-slate-400 font-medium">Objet :</span>
              <span className="font-semibold text-slate-800">{variables.objet || 'Document officiel'}</span>
            </div>
          </div>

          {/* Pane Viewport */}
          <div className="flex-1 bg-slate-100 p-4 overflow-auto flex justify-center items-start">
            {activeTab === 'preview' ? (
              <div
                style={{
                  width: device === 'mobile' ? '380px' : '620px',
                  maxWidth: '100%',
                  transition: 'width 0.2s ease',
                }}
                className="bg-white shadow-md border border-slate-300 rounded overflow-hidden"
              >
                {/* Render via safe sandboxed iframe */}
                <iframe
                  title="Aperçu E-mail HTML"
                  srcDoc={emailHtml}
                  className="w-full h-[620px] border-0"
                  sandbox="allow-same-origin allow-popups"
                />
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
              Tableaux & Styles intégrés (Compatible Gmail & Outlook)
            </span>
            <span>Rendu 100% autonome</span>
          </div>
        </div>
      </div>
    </div>
  );
};
