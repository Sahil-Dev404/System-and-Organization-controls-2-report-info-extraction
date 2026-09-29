/**
 * API client for SOCRR-lite backend services.
 * Supports VITE_API_URL environment variable for production (e.g. Render),
 * and defaults to relative paths for local Vite dev proxy and rewrites.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getExportUrl(resultId, format) {
  return `${API_BASE_URL}/api/export/${resultId}.${format}`;
}

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    throw new Error('Backend not reachable. Please verify the backend service is running.');
  }
}

export async function analyzeReport(pdfFile, controlsCsvFile = null) {
  const formData = new FormData();
  formData.append('file', pdfFile);

  if (controlsCsvFile) {
    formData.append('controls', controlsCsvFile);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData
    });
  } catch (netErr) {
    throw new Error('Backend not reachable. Please verify the backend service is running.');
  }

  if (!response.ok) {
    let errorDetail = `Server returned error (${response.status})`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.detail) {
        errorDetail = errorJson.detail;
      }
    } catch {
      // Use fallback errorDetail
    }
    throw new Error(errorDetail);
  }

  return await response.json();
}

