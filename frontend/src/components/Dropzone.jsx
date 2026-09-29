import React, { useRef, useState } from 'react';

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export default function Dropzone({ onFileSelected, onError }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const validateAndHandle = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      onError('Please select a valid PDF file (.pdf).');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      onError(`File exceeds 50 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndHandle(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndHandle(e.target.files[0]);
    }
  };

  return (
    <div
      className={`dropzone-container ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      aria-label="Upload SOC 2 PDF"
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div className="dropzone-icon">
        <div className="dropzone-icon-box">
          <svg viewBox="0 0 24 24" strokeLinecap="square" strokeLinejoin="miter">
            {/* Outlined box with upward arrow */}
            <path d="M12 15V4M12 4L7 9M12 4L17 9" />
            <path d="M4 14V20H20V14" />
          </svg>
        </div>
      </div>
      <p className="dropzone-text-main">Drop your SOC 2 PDF here</p>
      <p className="dropzone-text-sub">or click to browse · PDF only · up to 50 MB</p>
    </div>
  );
}
