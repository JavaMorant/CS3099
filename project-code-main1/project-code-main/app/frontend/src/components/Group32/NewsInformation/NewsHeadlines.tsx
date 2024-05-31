import React, { useState, useEffect } from 'react';
import './NewsHeadlines.css';
import LinkPreview from './LinkPreview';

const NewsHeadlines: React.FC<{ playerId: string }> = ({ playerId }) => {
  const [newsArticles, setNewsArticles] = useState<{ Article_names: string[], article_links: string[] }>({ Article_names: [], article_links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null); // Track hovered link

  useEffect(() => {
    const fetchNewsArticles = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/newsArticles/${playerId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'An error occurred while fetching news articles.');
        setNewsArticles(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) fetchNewsArticles();
  }, [playerId]);

  if (loading) return <p>Loading news...</p>;
  if (error) return <p>Error fetching news: {error}</p>;

  return (
    <div>
      <h1 className='news-headings'>News Articles</h1>
      {newsArticles.Article_names.map((title, index) => (
        <div key={index} onMouseEnter={() => setHoveredLink(newsArticles.article_links[index])} onMouseLeave={() => setHoveredLink(null)}>
          <a href={newsArticles.article_links[index]} target="_blank" rel="noopener noreferrer">{title}</a>
          {hoveredLink === newsArticles.article_links[index] && <LinkPreview url={hoveredLink} />}
        </div>
      ))}
    </div>
  );
};

export default NewsHeadlines;
