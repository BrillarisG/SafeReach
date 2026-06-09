'use client';

export default function AdminSecurityPage() {
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-stack-lg">
      <h1 className="font-headline-lg text-headline-lg text-primary">Security</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {[
          ['MFA Coverage','94%','verified_user'],
          ['Blocked Attempts','12','gpp_bad'],
          ['Password Policy','Strong','password'],
        ].map(([label,value,icon]) => (
          <div key={label} className="bg-white rounded-xl border border-outline-variant/30 p-stack-md shadow-sm">
            <span className="material-symbols-outlined text-primary text-[30px]">{icon}</span>
            <p className="text-label-md text-on-surface-variant mt-2">{label}</p>
            <p className="font-headline-md text-primary">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
