// Import necessary dependencies
import React, { useState } from 'react'; 
import '../ComparePlayerList/ComparePlayerList.css'; 
import SpeechToText from '../SpeechToText/SpeechToText'; 
import { useDarkMode } from '../../../context/DarkModeContext'; 
import './AddNotes.css';

// Define props interface for AddNotes component
interface AddNotesProps {
    playerName: string; // Player's name
    playerNotes: string; // Player's notes
    updatePlayerNotes: (player: string, notes: string) => void; // Function to update player's notes
    closeNotes: () => void; // Function to close notes section
}

// Define AddNotes functional component
const AddNotes: React.FC<AddNotesProps> = ({
    playerName,
    playerNotes,
    updatePlayerNotes,
    closeNotes
}) => {
    // State to manage current player notes
    const [currentPlayerNotes, setPlayerNotes] = useState(playerNotes);
    
    // Function to handle changes in the notes textarea
    const handleNotesChange = (event: { target: { value: any; }; }) => {
        setPlayerNotes(event.target.value); // Update current notes state
        updatePlayerNotes(playerName, event.target.value); // Call function to update player's notes
    };

    const updatePlayerNotesFromSpeech = (playerNotes: string) => {
        updatePlayerNotes(playerName, playerNotes);
        setPlayerNotes(playerNotes)
    }
    // Get dark mode status using custom hook
    const { isDarkMode } = useDarkMode();

    // Render component
    return (
        <div className="add-notes-container">
            <div className={isDarkMode ? 'advanced-filters-container filters-dark' : 'advanced-filters-container filters-light'}>
                <div className="flex-container">
                    <SpeechToText setText={updatePlayerNotesFromSpeech} tooltip="Clear and record new note"/>
                    <h2 className="notes-title">Notes: {playerName}</h2>
                    <div className="close-button">
                        <button onClick={closeNotes}>Close</button>
                    </div>
                </div>
                <textarea
                    className={isDarkMode ? 'advanced-filters filters-dark background-dark notes-textarea' : 'advanced-filters filters-light background-white notes-textarea'}
                    value={currentPlayerNotes}
                    onChange={handleNotesChange}
                    maxLength={400}
                    placeholder="Enter your notes here..."
                />
            </div>
        </div>
    );
};

export default AddNotes; 
