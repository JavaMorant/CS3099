import React from 'react';
import jsPDF from 'jspdf';
import Share from '../../../assets/group_32/share.svg';

const PDFGenerator = ({ playerName, playerPersonalDetails, playerCareerDetails, playerImageSrc, playerNotes, predictedTransfers }) => {

  const calculateAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    console.log(age);
    return age;
  };

  const addCoverPage = (doc) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Set the background color
    doc.setFillColor(240, 240, 240); // Light grey background
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

    const rightAlign = (pageWidth / 2) + 20; // Right align for the right side of the page

    // Add main title
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40); // Dark grey color
    doc.text(playerName, 105, 80); // Centered horizontally

    // Optional: Add subtitle
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprehensive Career Analysis', 105, 100);

    // Add the date
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 180);

    // Additional information, if any
    doc.text('Prepared by: Group 32', 105, 190);

    // Move to the next page for the rest of the report
    doc.addPage();
  };

  const addDetailsPages = (doc) => {
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text("Player Report", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 40; // Start a bit lower than the heading
  
    // Personal Details Section
    doc.setFontSize(26);
    doc.setFont('arial', 'normal');
    doc.text("Personal", 20, currentY);
  
    doc.setFontSize(12);
    currentY += 10; // Increment before to avoid overlap with the title
    for (const [key, value] of Object.entries(playerPersonalDetails)) {
      let text = `${key}: ${value}`;
      if (key === 'Date of Birth') {
        const age = calculateAge(value);
        text = `${key}: ${value} (Age: ${age})`; // Modify the text to include age
      }
      doc.text(text, 20, currentY);
      currentY += 10; // Move down for the next detail
    }
    
  
    // Horizontal line after Personal Details
    doc.line(20, currentY + 10, pageWidth - 20, currentY + 10); // Add line
    currentY += 20; // Some spacing after the line
  
    // Career Section
    doc.setFontSize(26);
    doc.text("Career", 20, currentY);
  
    doc.setFontSize(12);
    currentY += 10; // Increment before to avoid overlap with the title
  
    for (const [key, value] of Object.entries(playerCareerDetails)) {
      if (key !== 'tournamentHistory') { // Exclude tournamentHistory for separate handling
        doc.text(`${key}: ${value}`, 20, currentY);
        currentY += 10;
      }
    }
  
    // Tournament History
    if (playerCareerDetails.tournamentHistory) {
      currentY += 10; // Space before starting tournament history
      playerCareerDetails.tournamentHistory.forEach(tournament => {
        doc.text(`- ${tournament}`, 20, currentY);
        currentY += 10; // Move down for the next detail
      });
    }
  
    // Line after Career Section
    doc.line(20, currentY + 10, pageWidth - 20, currentY + 10); // Add line
    currentY += 20; // Some spacing after the line
  
    // Notes Section
    doc.setFontSize(26);
    doc.text("Notes", 20, currentY);
    doc.setFontSize(12);
    currentY += 10; // Adjust for title
    console.log(playerNotes.length);
    let notes = doc.splitTextToSize(playerNotes, (pageWidth / 2) - 40); // Half the page width - margins
    doc.text(notes, 20, currentY + 20); // Adjust currentY based on notes length
    
    if (playerNotes.length > 0) {
      let notes = doc.splitTextToSize(playerNotes, (pageWidth / 2) - 40); // Half the page width - margins
      doc.text(notes, 20, currentY + 20); // Adjust currentY based on notes length
    } else {
      doc.text("No notes available", 20, currentY + 20);
    }
  
    // Predicted Transfers Section
    doc.setFontSize(26);
    doc.text("Predicted Transfer", (pageWidth / 2) + 20, currentY - 10);    
  
    // Assuming predictionsData is structured as described above
    doc.setFontSize(16);
    doc.text("Next League Predictions", (pageWidth / 2) + 20, currentY);
    currentY += 20; // Adjust spacing for sub-headers and details
    doc.setFontSize(12);
  
    predictedTransfers.forEach((prediction, index) => {
      const league = prediction[0];
      const chance = prediction[1];
      doc.text(`${league}: ${chance}% chance`, (pageWidth / 2) + 20, currentY + (index * 6));
    });
  };
  

    const saveReportAsPDF = () => {
      const doc = new jsPDF();
      addCoverPage(doc);
      addDetailsPages(doc); // This now includes all three sections
      doc.save(`${playerName}_Report.pdf`);
    };

    return (
      <div>
        <button onClick={saveReportAsPDF} className='pdf-style-button'>
          <img src={Share} alt="Save as PDF" className='pdf-style-img' />
        </button>
      </div>
    );
  };

  export default PDFGenerator;