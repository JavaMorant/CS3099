import React, { useState, useEffect } from 'react';

const LinkPreview = ({ url }: { url: string }) => {
    const [previewData, setPreviewData] = useState({ title: '', description: '', image: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const apiKey = 'bc49f03ac70ad5c746d095b68b1c50c4'; // Consider moving API keys out of the frontend code
                const response = await fetch(`https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`);

                if (!response.ok) throw new Error('Failed to fetch link preview');

                const data = await response.json();
                setPreviewData({
                    title: data.title || 'No Title Available',
                    description: data.description || 'No Description Available',
                    image: data.image || '' // You could also use a placeholder image URL here
                });
            } catch (error) {
                console.error("Failed to fetch link preview", error);
                // Optionally reset to empty state or handle differently
                // For example, you might want to show an error message in the preview
                setPreviewData({ title: 'Error', description: 'Failed to fetch link preview.', image: '' });
            } finally {
                setLoading(false);
            }

        };

        if (url) fetchData();
    }, [url]);

    if (loading) return <p>Loading...</p>;
    if (!previewData) return <p>No preview available.</p>;

    return (
        <div style={{ cursor: 'pointer' }}>
            <h3>{previewData.title}</h3>
            <p>{previewData.description}</p>
            {previewData.image && <img src={previewData.image} alt="Link preview" style={{ maxWidth: '200px' }} />}
        </div>
    );
};

export default LinkPreview;
