"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  Printer,
  ExternalLink,
  ShieldCheck,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CertificateModalProps {
  requestId: string | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function CertificateModal({
  requestId,
  isOpen,
  onClose,
  title = "Официальная справка об обучении",
}: CertificateModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset loading state when requestId or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen, requestId]);

  if (!isOpen || !requestId) {
    return null;
  }

  const certificateUrl = `/api/requests/${requestId}/certificate`;

  const handlePrint = () => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
      } else {
        window.open(certificateUrl, "_blank");
      }
    } catch {
      window.open(certificateUrl, "_blank");
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = certificateUrl;
    link.download = `spravka_${requestId}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    window.open(certificateUrl, "_blank");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-card text-card-foreground rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-border flex items-center justify-between gap-3 bg-muted/50 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate leading-tight">
                {title}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                  Заверено ЭЦП • ИГУ (Концепт)
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PDF Viewer Body */}
        <div className="relative flex-1 w-full min-h-[420px] sm:min-h-[520px] bg-muted/20 flex flex-col items-center justify-center overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-xs">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div className="text-xs font-medium text-muted-foreground">
                Формирование бланка справки...
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={certificateUrl}
            title="Предпросмотр справки об обучении"
            className="w-full h-full min-h-[420px] sm:min-h-[520px] border-none"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3.5 sm:px-6 border-t border-border bg-card flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-muted-foreground font-medium hidden sm:block">
            A4 • Книжная ориентация • ГОСТ Р 7.0.97
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenNewTab}
              className="bg-card hover:bg-muted text-foreground border-border text-xs gap-1.5 h-9 font-medium shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              В новой вкладке
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="bg-card hover:bg-muted text-foreground border-border text-xs gap-1.5 h-9 font-medium shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-muted-foreground" />
              Печать
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleDownload}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5 h-9 px-4 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              Скачать PDF
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-9 text-foreground border-border sm:hidden"
            >
              Закрыть
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
