import React, { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { Loader2, AlertCircle } from 'lucide-react';

// Vite-friendly worker initialization for pdfjs-dist v4+
// Using a fallback strategy for worker loading
const getWorkerSrc = () => {
  try {
    return new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  } catch (e) {
    // Fallback to a CDN if local worker loading fails (rare but helpful for debugging)
    return `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;
  }
};

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = getWorkerSrc();
}

interface PdfPreviewProps {
  url: string;
  file?: File | Blob;
  className?: string;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ url, file, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: any = null;

    const renderThumbnail = async () => {
      try {
        console.log('[PdfPreview] Starting render for:', file ? 'File object' : url);
        setLoading(true);
        setError(null);

        let data: ArrayBuffer;

        if (file) {
          console.log('[PdfPreview] Using file object');
          data = await file.arrayBuffer();
        } else {
          console.log('[PdfPreview] Fetching URL:', url);
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Fetch failed with status: ${response.status}`);
          data = await response.arrayBuffer();
        }

        if (cancelled) return;

        console.log('[PdfPreview] Data loaded, size:', data.byteLength);

        loadingTask = pdfjs.getDocument({ 
          data: new Uint8Array(data),
          useSystemFonts: true,
          stopAtErrors: false,
        });

        const pdf = await loadingTask.promise;
        console.log('[PdfPreview] PDF loaded, pages:', pdf.numPages);
        
        const page = await pdf.getPage(1);
        console.log('[PdfPreview] Page 1 loaded');

        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) {
          console.error('[PdfPreview] Canvas ref is null');
          return;
        }

        const viewport = page.getViewport({ scale: 1.0 });
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get 2D context');

        // Calculate scale to fit the canvas (using a reasonable base size if container is unknown)
        const containerWidth = canvas.parentElement?.clientWidth || 300;
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale: scale * window.devicePixelRatio || 1 });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        console.log('[PdfPreview] Rendering to canvas:', canvas.width, 'x', canvas.height);

        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
          intent: 'display'
        }).promise;

        console.log('[PdfPreview] Render complete');
        if (!cancelled) setLoading(false);
      } catch (err: any) {
        console.error('[PdfPreview] Error during rendering:', err);
        if (!cancelled) {
          setError(err.message || 'Unknown error');
          setLoading(false);
        }
      }
    };

    renderThumbnail();

    return () => {
      cancelled = true;
      if (loadingTask) {
        loadingTask.destroy().catch(() => {});
      }
    };
  }, [url, file]);

  return (
    <div className={`relative w-full h-full bg-slate-900/10 flex items-center justify-center overflow-hidden min-h-[100px] ${className}`}>
      <canvas 
        ref={canvasRef} 
        className={`w-full h-full object-contain transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
      />
      
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/5 backdrop-blur-sm">
          <Loader2 className="animate-spin text-primary-400" size={24} />
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Chargement...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-1">
            <AlertCircle size={28} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-rose-400 font-black uppercase tracking-widest">Erreur PDF</span>
            <span className="text-[9px] text-slate-400 max-w-[120px] line-clamp-2">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfPreview;
