import React from 'react';
import jsPDF from 'jspdf';
import Share from '../../../assets/group_32/share.svg';
import { MapData } from '../../../interfaces/mapData';
import Tooltip from '@mui/material/Tooltip';

import './GenerateComparePDF.css';

const GenerateComparePDF = ({ player1, player2 }: { player1: MapData; player2: MapData; }) => {
    const saveReportAsPDF = async () => {
        const doc = new jsPDF({
            orientation: 'landscape', // Changed to landscape to have more horizontal space
            unit: 'mm',
            format: 'a4',
        });

        // Add a cover page
        addCoverPage(doc, player1.playerName, player2.playerName);

        // Calculate the middle of the page for the vertical separator line
        const middleOfPage = doc.internal.pageSize.getWidth() / 2;

        // Start positions for player details
        const columnPadding = 10; // Padding from the edge of the page or middle separator
        const player1StartX = columnPadding;
        const player2StartX = middleOfPage + columnPadding;

        // Y position to start the player details below any headings
        const startY = 20; // Adjust as necessary based on your layout

        // Draw a vertical line to separate the two players' details
        doc.setDrawColor(0); // Black color for the line
        doc.setLineWidth(0.2); // Line thickness
        doc.line(middleOfPage, 0, middleOfPage, doc.internal.pageSize.getHeight()); // Draw from top to bottom

        // Add player details for both players, including their names at the top
        addPlayerDetails(doc, player1, player1StartX, startY, middleOfPage - columnPadding);
        addPlayerDetails(doc, player2, player2StartX, startY, middleOfPage - columnPadding);

        // Save the PDF
        doc.save("ComparativePlayerReport.pdf");
    };

    const addPlayerDetails = (doc: jsPDF, player: MapData, startX: number, startY: number, halfPageWidth: number) => {
        // Set font for the player's name
        doc.setFont('Arial', 'bold');
        doc.setFontSize(36); // Larger font size for the name

        const nameMidpoint = startX + (halfPageWidth / 2);



        // Position player name at the top of their section
        doc.text(player.playerName, startX, startY);

        // Set font for the details
        doc.setFont('Arial', 'normal');
        doc.setFontSize(12);

        // Start Y position for the details below the player's name

        const detailsStartY = startY + 20; // Start Y position for the details below the player's name
        const details = [
            `Number of Clubs: ${player.numberClubs}`,
            `Start Date: ${player.startDate}`,
            `End Date: ${player.endDate}`,
            // Add other details as needed
        ];

        // Iterate over the details and print each one
        details.forEach((detail, index) => {
            doc.text(detail, startX, detailsStartY + (index * 6)); // Adjust line spacing as needed
        });
    };

    const addCoverPage = (doc: jsPDF, player1Name: string, player2Name: string) => {
        doc.setFillColor(240, 240, 240); // Light grey background
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(`${player1Name} vs. ${player2Name}`, doc.internal.pageSize.getWidth() / 2, 85, undefined, 'center');

        doc.setFontSize(16);
        doc.text("Comparative Player Analysis", doc.internal.pageSize.getWidth() / 2, 105, undefined, 'center');

        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, doc.internal.pageSize.getHeight() - 10);
        doc.text("Prepared by: Group 32", doc.internal.pageSize.getWidth() - 70, doc.internal.pageSize.getHeight() - 10);

        // Move to the next page for the rest of the report
        doc.addPage();
    };

    return (
        <Tooltip
            title={player1 && player2 ? "Click to export comparative PDF report of the top two players" : "Add another player to export compare pdf"}
            placement="top"
            arrow
            tabIndex={0}
        >
            <span>
            <button onClick={saveReportAsPDF} disabled={!player1 || !player2} className='pdf-style-button'>
                <img src={Share} alt="Save as PDF" className='pdf-style-img-compare' />
            </button>
            </span>
        </Tooltip>
    );
};

export default GenerateComparePDF;
