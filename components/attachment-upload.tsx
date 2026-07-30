"use client";

import { useRef, type ReactNode } from "react";
import type { Attachment } from "@/lib/orders-store";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = "image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx";

interface Props {
  onAttach: (att: Attachment) => void;
  children: ReactNode;
}

let _counter = 0;

export default function AttachmentUpload({ onAttach, children }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > MAX_SIZE_BYTES) {
        alert(`${file.name} dépasse 5 Mo et ne peut pas être envoyé.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        const att: Attachment = {
          id: `att-${Date.now()}-${++_counter}`,
          name: file.name,
          type: file.type,
          size: file.size,
          data,
          uploadedAt: new Date().toISOString(),
          uploadedBy: "client", // overridden by caller when admin
        };
        onAttach(att);
      };
      reader.readAsDataURL(file);
    });
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div onClick={() => inputRef.current?.click()} className="cursor-pointer">
        {children}
      </div>
    </>
  );
}
