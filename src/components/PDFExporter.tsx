import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PageData, LayoutTemplate, ThemeConfig } from '../types';
import { PageRenderer } from './PageRenderer';

interface PDFExporterProps {
    pages: PageData[];
    customLayouts: LayoutTemplate[];
    theme: ThemeConfig;
    getImageDimsByUrl: (url: string) => { width: number; height: number } | undefined;
    onComplete: () => void;
    onError: (err: any) => void;
}

export default function PDFExporter({ pages, customLayouts, theme, getImageDimsByUrl, onComplete, onError }: PDFExporterProps) {
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
    const pdfRef = useRef<jsPDF | null>(null);

    useEffect(() => {
        // Prevent re-running if we already generated the preview
        if (previewUrl || progress > 0) return;

        const generatePdf = async () => {
            // Give all components ample time to mount and images to start loading
            await new Promise(resolve => setTimeout(resolve, 1500));

            try {
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                });
                pdfRef.current = pdf;

                // Adjust html2canvas scale based on length to manage memory for very large books
                const qualityScale = pages.length > 20 ? 2 : 3;

                for (let i = 0; i < pages.length; i++) {
                    const pageElement = containerRefs.current[i];
                    if (!pageElement) {
                        console.warn(`Element for page ${i} not found, skipping`);
                        continue;
                    }

                    const canvas = await html2canvas(pageElement, {
                        scale: qualityScale, // High resolution for print
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                    });

                    const imgData = canvas.toDataURL('image/jpeg', 0.95);

                    if (i > 0) {
                        pdf.addPage();
                    }

                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                    setProgress(Math.round(((i + 1) / pages.length) * 100));
                }

                // Generate Blob URL for preview rather than downloading immediately
                const blob = pdf.output('blob');
                const builtUrl = URL.createObjectURL(blob);
                setPreviewUrl(builtUrl);

            } catch (err) {
                console.error("Error generating PDF:", err);
                onError(err);
            }
        };

        generatePdf();

        // Cleanup Blob URL on unmount
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [pages, customLayouts, theme, getImageDimsByUrl, onError, previewUrl, progress]);

    if (previewUrl) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#0a0a0a]/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-4xl h-full flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Предпросмотр PDF</h2>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    URL.revokeObjectURL(previewUrl);
                                    onComplete();
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={() => {
                                    if (pdfRef.current) {
                                        pdfRef.current.save('photobook.pdf');
                                    }
                                    URL.revokeObjectURL(previewUrl);
                                    onComplete();
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                            >
                                Скачать файл
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 w-full bg-gray-100 p-4">
                        <iframe
                            src={`${previewUrl}#view=FitH`}
                            className="w-full h-full rounded shadow-sm border-none bg-transparent"
                            title="PDF Preview"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0a]/90 backdrop-blur-sm flex flex-col items-center justify-center text-white">
            <div className="animate-pulse mb-6">
                <div className="w-16 h-16 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-bold mb-2 tracking-wide">Подготовка PDF к печати...</h2>
            <p className="text-gray-400 mb-8 font-medium">Пожалуйста, не закрывайте вкладку</p>

            <div className="w-64 bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <span className="mt-3 text-sm font-bold text-gray-300">{progress}%</span>

            {/* Hidden container for rendering all pages to ensure they are in DOM at once */}
            <div className="fixed top-[-9999px] left-[-9999px] overflow-visible opacity-0 pointer-events-none" aria-hidden="true">
                <div className="flex flex-col gap-4">
                    {pages.map((page, index) => (
                        <div
                            key={index}
                            ref={el => containerRefs.current[index] = el}
                            style={{ width: '1200px', height: '1697px', backgroundColor: page.backgroundColor || theme.colors.background }}
                        >
                            <PageRenderer
                                pageData={page}
                                isSelected={false}
                                onSelect={() => { }}
                                theme={theme}
                                customLayouts={customLayouts}
                                getImageDimsByUrl={getImageDimsByUrl}
                                readOnly={true}
                                isExporting={true}
                                selectedSlotId={null}
                                onSelectSlot={() => { }}
                                onUpdateContent={() => { }}
                                onUpdateSettings={() => { }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}
