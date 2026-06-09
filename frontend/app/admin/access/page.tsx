'use client';

export default function AdminAccessPage() {
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-stack-lg">
      <h1 className="font-headline-lg text-headline-lg text-primary">User Access</h1>
      <section className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-container"><tr>{['Role','Users','Access Level','Status'].map(h => <th key={h} className="px-4 py-3 text-label-md text-on-surface-variant">{h}</th>)}</tr></thead>
          <tbody>{[['Main Admin','1','Full system control','Active'],['Sub Admin','4','School operations','Active'],['Teacher','86','Class records','Active'],['Parent','1,942','Child records only','Active']].map(row => <tr key={row[0]} className="border-t border-outline-variant/20">{row.map(cell => <td key={cell} className="px-4 py-3 text-body-md">{cell}</td>)}</tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}
