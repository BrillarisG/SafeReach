'use client';

import { useEffect, useMemo, useState } from 'react';
import MainAdminShell from '@/components/MainAdminShell';
import { defaultTermsState, readTermsState, saveTermsState, termsSummary, type TermsSection, type TermsState } from '@/lib/terms';

function cloneTerms(terms: TermsState): TermsState {
  return {
    ...terms,
    sections: terms.sections.map(section => ({ ...section })),
  };
}

export default function MainAdminTermsPage() {
  const [terms, setTerms] = useState<TermsState>(() => cloneTerms(defaultTermsState));
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    setTerms(cloneTerms(readTermsState()));
  }, []);

  const emptySections = useMemo(
    () => terms.sections.filter(section => !section.title.trim() || !section.body.trim()).length,
    [terms.sections],
  );

  function updateSection(index: number, field: keyof TermsSection, value: string) {
    setTerms(current => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) => (
        sectionIndex === index ? { ...section, [field]: value } : section
      )),
    }));
    setSavedMessage('');
  }

  function saveTerms() {
    const nextTerms: TermsState = {
      ...terms,
      updatedAt: new Date().toLocaleString(),
      updatedBy: 'SafeReach Main Admin',
      sections: terms.sections.map((section, index) => ({
        ...section,
        id: section.id || `custom-${index + 1}`,
      })),
    };
    saveTermsState(nextTerms);
    setTerms(nextTerms);
    setSavedMessage('Terms and conditions saved for the registration page.');
  }

  function resetTerms() {
    const nextTerms = cloneTerms(defaultTermsState);
    saveTermsState(nextTerms);
    setTerms(nextTerms);
    setSavedMessage('Default SafeReach terms restored.');
  }

  return (
    <MainAdminShell active="terms" title="Terms & Conditions" subtitle="Edit the frontend registration agreement">
      <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-6">
        <section className="rounded-xl border border-outline-variant/60 bg-white p-stack-md shadow-sm">
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary">Registration Policy Control</h2>
              <p className="text-body-md text-on-surface-variant mt-1 max-w-3xl">
                Main admin can edit the SafeReach terms shown on the school registration page. The text should explain app purpose, data use, privacy rights, user responsibilities, and security commitments without exposing internal protection methods.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={resetTerms} className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-outline-variant text-on-surface font-bold hover:bg-surface-container">
                <span className="material-symbols-outlined text-[20px]">restart_alt</span>
                Reset Default
              </button>
              <button type="button" onClick={saveTerms} disabled={emptySections > 0} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined text-[20px]">save</span>
                Save Terms
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <label className="space-y-1.5">
              <span className="text-label-md text-on-surface-variant font-medium">Policy Version</span>
              <input
                value={terms.version}
                onChange={event => {
                  setTerms(current => ({ ...current, version: event.target.value }));
                  setSavedMessage('');
                }}
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </label>
            <div className="rounded-xl bg-surface-container p-4">
              <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">Last Update</p>
              <p className="font-bold text-on-surface mt-1">{terms.updatedAt}</p>
            </div>
            <div className="rounded-xl bg-surface-container p-4">
              <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">Frontend Summary</p>
              <p className="font-bold text-on-surface mt-1">{termsSummary(terms)}</p>
            </div>
          </div>

          {savedMessage && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 font-semibold">
              {savedMessage}
            </div>
          )}
          {emptySections > 0 && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-error font-semibold">
              Fill every section title and description before saving.
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          <div className="space-y-4">
            {terms.sections.map((section, index) => (
              <article key={section.id} className="rounded-xl border border-outline-variant/60 bg-white p-stack-md shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="font-bold text-primary">Section {index + 1}</h3>
                  <span className="status-chip bg-primary/10 text-primary">{section.id}</span>
                </div>
                <label className="block space-y-1.5">
                  <span className="text-label-md text-on-surface-variant font-medium">Section Title</span>
                  <input
                    value={section.title}
                    onChange={event => updateSection(index, 'title', event.target.value)}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </label>
                <label className="block space-y-1.5 mt-4">
                  <span className="text-label-md text-on-surface-variant font-medium">Policy Description</span>
                  <textarea
                    value={section.body}
                    onChange={event => updateSection(index, 'body', event.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y"
                  />
                </label>
              </article>
            ))}
          </div>

          <aside className="xl:sticky xl:top-24 rounded-xl border border-outline-variant/60 bg-white p-stack-md shadow-sm">
            <h3 className="font-bold text-primary mb-3">Registration Preview</h3>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {terms.sections.map(section => (
                <div key={section.id} className="rounded-lg bg-surface-container-low border border-outline-variant/40 p-3">
                  <p className="font-semibold text-on-surface">{section.title || 'Untitled section'}</p>
                  <p className="text-label-md text-on-surface-variant mt-1">{section.body || 'No description entered.'}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </MainAdminShell>
  );
}
