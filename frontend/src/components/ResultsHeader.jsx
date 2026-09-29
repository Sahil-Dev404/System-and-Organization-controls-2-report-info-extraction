import React from 'react';

export default function ResultsHeader({ org, processingSeconds, resultId }) {
  const handleDownload = (format) => {
    if (!resultId) return;
    const url = `/api/export/${resultId}.${format}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="results-header-row">
      <div className="results-heading-group">
        <h2 className="results-title">Results</h2>
        <div className="results-subline">
          {org || 'Service Organization'} · Processed in {processingSeconds ? `${processingSeconds} s` : '0.0 s'}
        </div>
      </div>
      <div className="results-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => handleDownload('json')}
          disabled={!resultId}
        >
          Download JSON
        </button>
        <button
          type="button"
          className="btn btn-black"
          onClick={() => handleDownload('xlsx')}
          disabled={!resultId}
        >
          Download Excel
        </button>
      </div>
    </div>
  );
}
