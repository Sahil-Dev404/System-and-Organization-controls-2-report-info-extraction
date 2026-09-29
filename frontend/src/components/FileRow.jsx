import React, { useRef, useState } from 'react';

export default function FileRow({
  file,
  controlsFile,
  onControlsFileSelected,
  onAnalyze,
  onClear,
  isLoading
}) {
  const [showCustomControls, setShowCustomControls] = useState(false);
  const controlsInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${Math.round(kb)} KB`;
  };

  const handleControlsChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onControlsFileSelected(e.target.files[0]);
    }
  };

  return (
    <div>
      <div className="file-row">
        <div className="file-row-left">
          <div className="file-badge-pdf">PDF</div>
          <div className="file-info">
            <span className="file-name">{file.name}</span>
            <span className="file-meta">{formatFileSize(file.size)}</span>
          </div>
        </div>
        <div className="file-row-right">
          <button
            type="button"
            className="btn btn-black"
            onClick={onAnalyze}
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClear}
            disabled={isLoading}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="custom-controls-wrapper">
        <button
          type="button"
          className="custom-controls-toggle"
          onClick={() => setShowCustomControls(!showCustomControls)}
        >
          {showCustomControls ? '– Hide custom controls CSV' : '+ Use my own controls CSV'}
        </button>

        {showCustomControls && (
          <div className="custom-controls-box">
            <div>
              <strong>Custom Controls: </strong>
              <span style={{ color: '#555' }}>
                {controlsFile ? controlsFile.name : 'Using default internal controls (15 controls)'}
              </span>
            </div>
            <div>
              <input
                ref={controlsInputRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={handleControlsChange}
              />
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '4px 12px', fontSize: '11px' }}
                onClick={() => controlsInputRef.current && controlsInputRef.current.click()}
              >
                {controlsFile ? 'Replace CSV' : 'Upload CSV'}
              </button>
              {controlsFile && (
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '4px 12px', fontSize: '11px', marginLeft: '6px' }}
                  onClick={() => onControlsFileSelected(null)}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
