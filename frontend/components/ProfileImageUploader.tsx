'use client';

import { useEffect, useRef, useState } from 'react';

type ProfileImageUploaderProps = {
  storageKey: string;
  initials: string;
  label: string;
  defaultImage?: string;
};

export default function ProfileImageUploader({ storageKey, initials, label, defaultImage }: ProfileImageUploaderProps) {
  const [image, setImage] = useState(defaultImage ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) setImage(stored);
  }, [storageKey]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      setImage(result);
      window.localStorage.setItem(storageKey, result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
      <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-primary-container shadow-lg ring-2 ring-primary/20">
        {image ? (
          <img alt={label} src={image} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-headline-md font-bold text-primary">
            {initials}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-md ring-2 ring-white hover:opacity-90"
        aria-label={`Change ${label}`}
        title="Change profile image"
      >
        <span className="material-symbols-outlined text-[20px]">photo_camera</span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
    </div>
  );
}
