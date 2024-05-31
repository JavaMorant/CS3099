import React, { useState, useEffect } from 'react';
import "./Controls.css";

/**
 * High Contrast Toggle Component
 * @returns High Contrast Toggle Component for changing the contrast of the page.
 */
const HighContrastToggle = () => {
    const [highContrast, setHighContrast] = useState(false);

    useEffect(() => {
        // Check for saved user preference on component mount
        const isHighContrast = localStorage.getItem('highContrastEnabled') === 'true';
        setHighContrast(isHighContrast);
        document.body.classList.toggle('high-contrast', isHighContrast);
    }, []);

    const toggleHighContrast = () => {
        const newHighContrastState = !highContrast;
        setHighContrast(newHighContrastState);
        document.body.classList.toggle('high-contrast', newHighContrastState);
        localStorage.setItem('highContrastEnabled', newHighContrastState.toString());

        // Refresh the page to apply changes
        window.location.reload();
    };

    return (
        <div className="high-contrast-toggle">
            <label className="toggle-label">
            High Contrast
                <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={toggleHighContrast}
                    className="toggle-checkbox"
                />
                <span className="toggle-slider"></span>
            </label>
        </div>
    );
};

export default HighContrastToggle;
