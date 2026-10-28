/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tag, Calendar, User, Hash, DollarSign, MessageSquare, Info, Copy, Check } from 'lucide-react';
import { DocumentVariables } from '../types/document';

interface VariableEditorProps {
  variables: DocumentVariables;
  onChange: (variables: DocumentVariables) => void;
  onReset: () => void;
  hasModifications: boolean;
}

export const VariableEditor: React.FC<VariableEditorProps> = ({
  variables,
  onChange,
  onReset,
  hasModifications,
}) => {
  const [copiedTag, setCopiedTag] = React.useState<string | null>(null);

  const handleFieldChange = (key: keyof DocumentVariables, value: string) => {
    onChange({
      ...variables,
      [key]: value,
    });
  };

  const copyVariableTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <Tag className="w-4 h-4 mr-2 text-blue-700" />
            Champs Variables & Données Clés
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Modifiez ces champs pour personnaliser l'e-mail sans toucher aux logos ni aux signatures verrouillés.
          </p>
        </div>
        {hasModifications && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
          >
            Réinitialiser les valeurs
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Destinataire */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
            <span className="flex items-center">
              <User className="w-3.5 h-3.5 mr-1.5 text-blue-800" />
              Nom du destinataire
            </span>
            <button
              type="button"
              onClick={() => copyVariableTag('{{destinataire}}')}
              className="text-[11px] text-blue-900 hover:text-blue-700 font-mono flex items-center"
              title="Copier la balise {{destinataire}}"
            >
              {copiedTag === '{{destinataire}}' ? (
                <Check className="w-3 h-3 text-emerald-600 mr-0.5" />
              ) : (
                <Copy className="w-3 h-3 mr-0.5" />
              )}
              {`{{destinataire}}`}
            </button>
          </label>
          <input
            type="text"
            value={variables.destinataire}
            onChange={(e) => handleFieldChange('destinataire', e.target.value)}
            placeholder="Ex : Cabinet Durand & Associés"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
          />
        </div>

        {/* Date */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-800" />
              Date d'émission
            </span>
            <button
              type="button"
              onClick={() => copyVariableTag('{{date}}')}
              className="text-[11px] text-blue-900 hover:text-blue-700 font-mono flex items-center"
              title="Copier la balise {{date}}"
            >
              {copiedTag === '{{date}}' ? (
                <Check className="w-3 h-3 text-emerald-600 mr-0.5" />
              ) : (
                <Copy className="w-3 h-3 mr-0.5" />
              )}
              {`{{date}}`}
            </button>
          </label>
          <input
            type="text"
            value={variables.date}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            placeholder="Ex : 27/10/2026"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
          />
        </div>

        {/* Référence */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
            <span className="flex items-center">
              <Hash className="w-3.5 h-3.5 mr-1.5 text-blue-800" />
              Référence / N° de pièce
            </span>
            <button
              type="button"
              onClick={() => copyVariableTag('{{reference}}')}
              className="text-[11px] text-blue-900 hover:text-blue-700 font-mono flex items-center"
              title="Copier la balise {{reference}}"
            >
              {copiedTag === '{{reference}}' ? (
                <Check className="w-3 h-3 text-emerald-600 mr-0.5" />
              ) : (
                <Copy className="w-3 h-3 mr-0.5" />
              )}
              {`{{reference}}`}
            </button>
          </label>
          <input
            type="text"
            value={variables.reference}
            onChange={(e) => handleFieldChange('reference', e.target.value)}
            placeholder="Ex : FC-2026-0842"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
          />
        </div>

        {/* Montant */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
            <span className="flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1.5 text-blue-800" />
              Montant total
            </span>
            <button
              type="button"
              onClick={() => copyVariableTag('{{montant}}')}
              className="text-[11px] text-blue-900 hover:text-blue-700 font-mono flex items-center"
              title="Copier la balise {{montant}}"
            >
              {copiedTag === '{{montant}}' ? (
                <Check className="w-3 h-3 text-emerald-600 mr-0.5" />
              ) : (
                <Copy className="w-3 h-3 mr-0.5" />
              )}
              {`{{montant}}`}
            </button>
          </label>
          <input
            type="text"
            value={variables.montant}
            onChange={(e) => handleFieldChange('montant', e.target.value)}
            placeholder="Ex : 4 680,00 € TTC"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
          />
        </div>

        {/* Objet */}
        <div className="md:col-span-2">
          <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
            <span className="flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-blue-800" />
              Objet du document
            </span>
            <button
              type="button"
              onClick={() => copyVariableTag('{{objet}}')}
              className="text-[11px] text-blue-900 hover:text-blue-700 font-mono flex items-center"
              title="Copier la balise {{objet}}"
            >
              {copiedTag === '{{objet}}' ? (
                <Check className="w-3 h-3 text-emerald-600 mr-0.5" />
              ) : (
                <Copy className="w-3 h-3 mr-0.5" />
              )}
              {`{{objet}}`}
            </button>
          </label>
          <input
            type="text"
            value={variables.objet}
            onChange={(e) => handleFieldChange('objet', e.target.value)}
            placeholder="Ex : Prestation d'audit de sécurité et refonte de l'infrastructure"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
          />
        </div>

        {/* Message */}
        <div className="md:col-span-2">
          <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
            <span className="flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-blue-800" />
              Message d'accompagnement
            </span>
            <button
              type="button"
              onClick={() => copyVariableTag('{{message}}')}
              className="text-[11px] text-blue-900 hover:text-blue-700 font-mono flex items-center"
              title="Copier la balise {{message}}"
            >
              {copiedTag === '{{message}}' ? (
                <Check className="w-3 h-3 text-emerald-600 mr-0.5" />
              ) : (
                <Copy className="w-3 h-3 mr-0.5" />
              )}
              {`{{message}}`}
            </button>
          </label>
          <textarea
            rows={2}
            value={variables.message}
            onChange={(e) => handleFieldChange('message', e.target.value)}
            placeholder="Ex : Nous vous remercions de votre confiance..."
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <Info className="w-4 h-4 mr-2 text-blue-700 shrink-0" />
        <span>
          Les balises sont synchronisées en direct dans l'e-mail HTML et dans l'export PDF. 
          Les images originales (logos, cachets, signatures) restent intactes et protégées.
        </span>
      </div>
    </div>
  );
};
