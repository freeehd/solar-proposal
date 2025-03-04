"use client"

import MetallicPaint, { parseLogoImage } from "@/components/ui/MetallicPaint";
import { useState, useEffect } from 'react';

const MetallicEffect = () => {
    const [imageData, setImageData] = useState<ImageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadDefaultImage() {
            try {
                setLoading(true);

                // 1. Add cache busting for development
                const response = await fetch('/icon.svg?t=' + Date.now());
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                // 2. Verify SVG MIME type
                const type = response.headers.get('Content-Type');
                if (!type?.includes('image/svg+xml')) {
                    throw new Error('Invalid MIME type for SVG');
                }

                const blob = await response.blob();
                const file = new File([blob], "icon.svg", { type: 'image/svg+xml' });

                // 3. Add timeout for image processing
                const { imageData } = await Promise.race([
                    parseLogoImage(file),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('Image processing timeout')), 5000)
                    )
                ]);

                if (isMounted) {
                    setImageData(imageData);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load metallic effect');
                    setLoading(false);
                }
                console.error("Metallic effect error:", err);
            }
        }

        loadDefaultImage();

        return () => {
            isMounted = false;
        };
    }, []);

    if (error) {
        return (
            <div className="error-fallback">
                ⚠️ {error} - Please ensure your SVG meets the requirements
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            background: loading ? '#1a1a1a' : 'none',
            display: 'grid',
            placeItems: 'center'
        }}>
            {loading && <div className="loading-spinner" />}

            {imageData && (
                <MetallicPaint
                    imageData={imageData}
                    params={{
                        edge: 0.01,
                        patternBlur: 0.005,
                        patternScale: 2,
                        refraction: 0.015,
                        speed: 0.3,
                        liquid: 0.07
                    }}
                />
            )}
        </div>
    );
}

export default MetallicEffect;