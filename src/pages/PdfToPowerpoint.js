import React, { useState } from 'react';

const PdfToPowerpoint = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pptUrl, setPptUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setPptUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    setLoading(true);
    setError('');
    setPptUrl('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/convert-from-pdf/pdf-to-powerpoint', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Conversion failed.');
      const data = await res.json();
      if (data.success && data.pptUrl) {
        setPptUrl(data.pptUrl);
      } else {
        setError(data.message || 'Conversion failed.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding: '40px', maxWidth: 500, margin: '0 auto', textAlign: 'center'}}>
      <h1>PDF to POWERPOINT</h1>
      <form onSubmit={handleSubmit} style={{marginBottom: 24}}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <br /><br />
        <button type="submit" disabled={loading || !file} style={{padding: '10px 30px', borderRadius: 6, background: '#667eea', color: 'white', border: 'none', fontWeight: 500, cursor: 'pointer'}}>
          {loading ? 'Converting...' : 'Convert to POWERPOINT'}
        </button>
      </form>
      {error && <div style={{color: 'red', marginBottom: 16}}>{error}</div>}
      {pptUrl && (
        <div>
          <h3>Converted PowerPoint File:</h3>
          <a href={pptUrl} target="_blank" rel="noopener noreferrer" download>
            Download POWERPOINT
          </a>
        </div>
      )}
    </div>
  );
};

export default PdfToPowerpoint; 