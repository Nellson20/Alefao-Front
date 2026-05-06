import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PdfPreview from './PdfPreview';
import * as pdfjs from 'pdfjs-dist';

describe('PdfPreview Component', () => {
  const mockUrl = 'https://example.com/test.pdf';

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock global fetch
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    }));
  });

  it('shows loading state initially', () => {
    render(<PdfPreview url={mockUrl} />);
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }));

    render(<PdfPreview url={mockUrl} />);

    await waitFor(() => {
      expect(screen.getByText(/erreur pdf/i)).toBeInTheDocument();
      expect(screen.getByText(/fetch failed with status: 404/i)).toBeInTheDocument();
    });
  });

  it('renders canvas after successful PDF load', async () => {
    const mockPage = {
      getViewport: vi.fn().mockReturnValue({ width: 100, height: 100 }),
      render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
    };
    
    const mockPdf = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue(mockPage),
    };

    (pdfjs.getDocument as any).mockReturnValue({
      promise: Promise.resolve(mockPdf),
    });

    render(<PdfPreview url={mockUrl} />);

    await waitFor(() => {
      expect(pdfjs.getDocument).toHaveBeenCalled();
    });
    
    // Check if loading spinner is gone
    await waitFor(() => {
      expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
    });
  });

  it('uses File object directly if provided', async () => {
    const mockFile = new File(['fake content'], 'test.pdf', { type: 'application/pdf' });
    const arrayBufferSpy = vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(8));

    const mockPage = {
      getViewport: vi.fn().mockReturnValue({ width: 100, height: 100 }),
      render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
    };
    
    const mockPdf = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue(mockPage),
    };

    (pdfjs.getDocument as any).mockReturnValue({
      promise: Promise.resolve(mockPdf),
    });

    render(<PdfPreview url={mockUrl} file={mockFile} />);

    await waitFor(() => {
      expect(arrayBufferSpy).toHaveBeenCalled();
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });
});
