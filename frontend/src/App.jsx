import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Dropzone from './components/Dropzone';
import FileRow from './components/FileRow';
import ProgressSteps from './components/ProgressSteps';
import ResultsHeader from './components/ResultsHeader';
import StatCards from './components/StatCards';
import ReportDetails from './components/ReportDetails';
import TrustCriteriaHealth from './components/TrustCriteriaHealth';
import ExceptionsTable from './components/ExceptionsTable';
import SubserviceTable from './components/SubserviceTable';
import CuecTable from './components/CuecTable';
import Footer from './components/Footer';
import ErrorBanner from './components/ErrorBanner';
import { analyzeReport } from './api';


export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [customControlsFile, setCustomControlsFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const resultsRef = useRef(null);

  // Smooth scroll to results once loaded
  useEffect(() => {
    if (analysisResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [analysisResult]);

  const handleReset = () => {
    setSelectedFile(null);
    setCustomControlsFile(null);
    setIsLoading(false);
    setErrorMessage('');
    setAnalysisResult(null);
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setErrorMessage('');
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setErrorMessage('');
    setAnalysisResult(null);

    try {
      const data = await analyzeReport(selectedFile, customControlsFile);
      setAnalysisResult(data);
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header onReset={handleReset} />

      <main className="main-content">
        <Hero />

        {/* Upload Dropzone */}
        <Dropzone
          onFileSelected={handleFileSelected}
          onError={(msg) => setErrorMessage(msg)}
        />

        {/* Selected File Details & Analyze Trigger */}
        {selectedFile && (
          <FileRow
            file={selectedFile}
            controlsFile={customControlsFile}
            onControlsFileSelected={setCustomControlsFile}
            onAnalyze={handleAnalyze}
            onClear={handleReset}
            isLoading={isLoading}
          />
        )}

        {/* Error notification banner */}
        {errorMessage && (
          <ErrorBanner
            message={errorMessage}
            onRetry={handleAnalyze}
            onDismiss={() => setErrorMessage('')}
          />
        )}

        {/* Progress Tracker (only while analyzing) */}
        <ProgressSteps isLoading={isLoading} />

        {/* Results Area */}
        {analysisResult && (
          <div ref={resultsRef} className="results-container">
            {/* Optional Warnings Notice */}
            {analysisResult.warnings && analysisResult.warnings.length > 0 && (
              <div className="warnings-banner">
                <div className="warnings-title">Warnings / Notices</div>
                <ul className="warnings-list">
                  {analysisResult.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Results Title & Download Actions */}
            <ResultsHeader
              org={analysisResult.metadata?.org}
              processingSeconds={analysisResult.processing_seconds}
              resultId={analysisResult.result_id}
            />

            {/* 4 Stat Cards */}
            <StatCards
              opinion={analysisResult.opinion}
              exceptions={analysisResult.exceptions}
              subserviceOrgs={analysisResult.subservice_orgs}
              summary={analysisResult.summary}
            />

            {/* Metadata & Scope Details */}
            <ReportDetails metadata={analysisResult.metadata} />

            {/* Trust Criteria Health Breakdown */}
            <TrustCriteriaHealth criteriaHealth={analysisResult.criteria_health} />

            {/* Control Exceptions Table */}
            <ExceptionsTable exceptions={analysisResult.exceptions} />


            {/* Subservice Organizations Table */}
            <SubserviceTable subserviceOrgs={analysisResult.subservice_orgs} />

            {/* CUEC Mapping Table with Filters */}
            <CuecTable cuecs={analysisResult.cuecs} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
