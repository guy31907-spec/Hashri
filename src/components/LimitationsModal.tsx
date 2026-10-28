/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, AlertCircle, ShieldCheck, Mail, Database, Cpu } from 'lucide-react';

interface LimitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LimitationsModal: React.FC<LimitationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
              DF
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                DOCUFIDÈLE · Fonctions Opérationnelles & Limitations
              </h3>
              <p className="text-xs text-slate-500">
                Transparence complète sur le fonctionnement technique et les contraintes des messageries
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {/* Section 1: Fully operational features */}
          <div>
            <h4 className="text-sm font-bold text-emerald-800 flex items-center mb-3">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
              1. Fonctionnalités 100% Opérationnelles et Autonomes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <span className="font-bold text-slate-900 block mb-1">
                  Importation universelle
                </span>
                Lecture locale des fichiers PDF, DOCX (Word), JPG, JPEG et PNG depuis ordinateur et mobile.
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <span className="font-bold text-slate-900 block mb-1">
                  Zéro IA générative & Fidélité absolue
                </span>
                Interdiction absolue d'inventer des logos ou signatures. Les éléments graphiques proviennent exclusivement du fichier d'origine et sont verrouillés.
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <span className="font-bold text-slate-900 block mb-1">
                  Deux modes d'utilisation
                </span>
                Mode automatique (conversion instantanée) et Mode assisté (vérification bloc par bloc et verrouillage explicite).
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <span className="font-bold text-slate-900 block mb-1">
                  Comparaison Côte à Côte
                </span>
                Mise en parallèle du document source et du rendu e-mail avec zoom, aperçu bureau (620px) et mobile (380px).
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <span className="font-bold text-slate-900 block mb-1">
                  Export HTML multi-messageries
                </span>
                Génération en tableaux imbriqués avec styles inline compatibles Gmail, Outlook, Kit et Apple Mail.
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <span className="font-bold text-slate-900 block mb-1">
                  Export PDF double option
                </span>
                Téléchargement du PDF original bit-à-bit sans modification ou génération d'un PDF actualisé avec rapport de différences.
              </div>
            </div>
          </div>

          {/* Section 2: Technical limitations & Email clients */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center mb-3">
              <AlertCircle className="w-4 h-4 mr-2 text-amber-600" />
              2. Limitations Techniques & Particularités des Clients de Messagerie
            </h4>
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1 flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-blue-800" />
                  Particularité de Gmail (Coller le code vs Coller le contenu riche)
                </strong>
                <p className="leading-relaxed">
                  Gmail ne dispose pas nativement d'un bouton pour insérer du code source HTML brut. Si vous collez le code brut (<code>&lt;table...&gt;</code>), Gmail affichera le texte du code.
                  <strong>Solution intégrée :</strong> DOCUFIDÈLE intègre la fonction « Copier le contenu riche ». Elle copie le document sous forme d'objet visuel dans votre presse-papiers. Il vous suffit ensuite de faire un simple coller (Ctrl+V) dans la boîte de rédaction Gmail pour que la mise en page apparaisse immédiatement.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1 flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-blue-800" />
                  Moteur de rendu de Microsoft Outlook pour Windows
                </strong>
                <p className="leading-relaxed">
                  Outlook sur ordinateur utilise le moteur de rendu de Microsoft Word (et non un navigateur web moderne). Les flexbox et grilles CSS modernes y sont ignorées. C'est pourquoi DOCUFIDÈLE génère une structure rigoureuse en tableaux HTML (<code>&lt;table cellpadding="0"...&gt;</code>) et des commentaires conditionnels MSO spécifiques afin de garantir un affichage parfait.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1 flex items-center">
                  <Database className="w-3.5 h-3.5 mr-1.5 text-blue-800" />
                  Bouton de téléchargement externe & Hébergement
                </strong>
                <p className="leading-relaxed">
                  DOCUFIDÈLE refuse scrupuleusement de simuler des liens fictifs (pas de faux lien "exemple.com"). Pour que le bouton "Télécharger le PDF" fonctionne pour vos destinataires, vous devez renseigner une URL réelle hébergée sur votre propre stockage sécurisé (Google Drive, Cloud Storage, Nextcloud). Si vous n'avez pas de serveur de stockage configuré, utilisez la <strong>Solution 1 (Pièce jointe directe)</strong> qui est 100% autonome et ne nécessite aucun service externe.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1 flex items-center">
                  <Cpu className="w-3.5 h-3.5 mr-1.5 text-blue-800" />
                  Confidentialité et traitement 100% local dans le navigateur
                </strong>
                <p className="leading-relaxed">
                  Aucun document importé (facture, contrat, courrier confidentiel) n'est jamais envoyé sur un serveur tiers. Tout le traitement d'analyse, d'extraction des images et de génération s'exécute dans la mémoire vive de votre navigateur via WebAssembly et JavaScript.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
};
