/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, FileCheck, HelpCircle, Sparkles, Layers, Sliders } from 'lucide-react';
import { ProcessingMode } from '../types/document';

interface HeaderProps {
  mode: ProcessingMode;
  onModeChange: (mode: ProcessingMode) => void;
  onOpenHelp: () => void;
  onOpenAudit: () => void;
  hasDocument: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  onOpenHelp,
  onOpenAudit,
  hasDocument,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              DF
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-xl">
                  DOCUFIDÈLE
                </span>
                <span className="inline-flex items-center text-xs text-blue-900 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Reproduction Fidèle
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Convertisseur de PDF, DOCX & Images en e-mails HTML & PDF conformes
              </p>
            </div>
          </div>

          {/* Mode switch */}
          {hasDocument && (
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => onModeChange('automatic')}
                className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === 'automatic'
                    ? 'bg-white text-blue-950 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
                Mode Automatique
              </button>
              <button
                type="button"
                onClick={() => onModeChange('assisted')}
                className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === 'assisted'
                    ? 'bg-white text-blue-950 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
                Mode Assisté
              </button>
            </div>
          )}

          {/* Actions & info */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onOpenAudit}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
              title="Vérifier la garantie de non-altération des logos et signatures"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              <span className="hidden md:inline">Zéro IA Générative</span>
            </button>
            <button
              type="button"
              onClick={onOpenHelp}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
              title="Guide d'utilisation & Limitations des messageries"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-blue-800" />
              <span>Guide & Limitations</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
