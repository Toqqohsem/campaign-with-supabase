import { Campaign } from '../types';

export function generateCampaignPDF(campaign: Campaign) {
  // Create a new window for the PDF content
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow popups to generate the PDF');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Campaign Plan - ${campaign.name}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          margin: 40px;
          color: #333;
        }
        .header {
          border-bottom: 3px solid #3B82F6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .campaign-title {
          font-size: 32px;
          font-weight: bold;
          color: #1F2937;
          margin: 0;
        }
        .section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 24px;
          font-weight: bold;
          color: #3B82F6;
          margin-bottom: 15px;
          border-bottom: 2px solid #E5E7EB;
          padding-bottom: 5px;
        }
        .persona-section {
          page-break-before: always;
          margin-top: 40px;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .detail-item {
          padding: 15px;
          background: #F9FAFB;
          border-left: 4px solid #3B82F6;
        }
        .detail-label {
          font-weight: bold;
          color: #4B5563;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .detail-value {
          font-size: 18px;
          color: #1F2937;
          margin-top: 5px;
        }
        .persona-name {
          font-size: 28px;
          font-weight: bold;
          color: #1F2937;
          margin-bottom: 20px;
        }
        .content-block {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .content-title {
          font-weight: bold;
          color: #4B5563;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .content-text {
          white-space: pre-line;
          line-height: 1.8;
        }
        .assets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .asset-item {
          background: #F3F4F6;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border: 2px solid #E5E7EB;
        }
        .copy-item {
          background: #FEF7FF;
          border: 1px solid #E879F9;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
        }
        .copy-headline {
          font-weight: bold;
          font-size: 18px;
          color: #1F2937;
          margin-bottom: 8px;
        }
        .copy-description {
          color: #4B5563;
          line-height: 1.6;
        }
        @media print {
          body { margin: 20px; }
          .persona-section { page-break-before: always; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="campaign-title">${campaign.name}</h1>
        <p style="font-size: 18px; color: #6B7280; margin: 10px 0 0 0;">Campaign Plan & Strategy Document</p>
      </div>

      <div class="section">
        <h2 class="section-title">Campaign Overview</h2>
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">Project</div>
            <div class="detail-value">${campaign.project}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Objective</div>
            <div class="detail-value">${campaign.objective}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Budget</div>
            <div class="detail-value">RM ${campaign.budget.toLocaleString()}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Campaign Period</div>
            <div class="detail-value">${new Date(campaign.start_date).toLocaleDateString()} - ${new Date(campaign.end_date).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      ${campaign.personas.map((persona, index) => `
        <div class="persona-section">
          <h2 class="persona-name">Persona ${index + 1}: ${persona.name}</h2>
          
          <div class="content-block">
            <div class="content-title">Key Motivations</div>
            <div class="content-text">${persona.motivations}</div>
          </div>

          <div class="content-block">
            <div class="content-title">Pain Points</div>
            <div class="content-text">${persona.pain_points}</div>
          </div>

          ${persona.assets.length > 0 ? `
            <div class="content-block">
              <div class="content-title">Creative Assets (${persona.assets.length})</div>
              <div class="assets-grid">
                ${persona.assets.map(asset => `
                  <div class="asset-item">
                    <div style="font-weight: bold; margin-bottom: 5px;">${asset.name}</div>
                    <div style="color: #6B7280; font-size: 14px;">${asset.type.toUpperCase()}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${persona.adCopy.length > 0 ? `
            <div class="content-block">
              <div class="content-title">Ad Copy (${persona.ad_copy.length} variations)</div>
              ${persona.ad_copy.map(copy => `
                <div class="copy-item">
                  <div class="copy-headline">${copy.headline}</div>
                  <div class="copy-description">${copy.description}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}

      <div style="page-break-before: always; text-align: center; color: #6B7280; margin-top: 40px;">
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>Campaign Scaffolding Tool - Phase 1</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    printWindow.print();
  };
}