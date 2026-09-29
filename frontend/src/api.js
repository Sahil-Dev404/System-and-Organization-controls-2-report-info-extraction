/**
 * API client for SOCRR-lite backend services.
 * All requests are relative to support the Vite dev proxy and production serving.
 */

export async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    throw new Error('Backend not reachable. Is FastAPI running on port 8000?');
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
    response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData
    });
  } catch (netErr) {
    throw new Error('Backend not reachable. Is FastAPI running on port 8000?');
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
