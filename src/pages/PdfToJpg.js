import React, { useState } from 'react';

const PdfToJpg = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    setLoading(true);
    setError('');
    setImages([]);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/convert-from-pdf/pdf-to-jpg', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Conversion failed.');
      const data = await res.json();
      if (data.success && Array.isArray(data.images)) {
        setImages(data.images); // Expecting array of image URLs
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
      <h1>PDF to JPG</h1>
      <form onSubmit={handleSubmit} style={{marginBottom: 24}}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <br /><br />
        <button type="submit" disabled={loading || !file} style={{padding: '10px 30px', borderRadius: 6, background: '#667eea', color: 'white', border: 'none', fontWeight: 500, cursor: 'pointer'}}>
          {loading ? 'Converting...' : 'Convert to JPG'}
        </button>
      </form>
      {error && <div style={{color: 'red', marginBottom: 16}}>{error}</div>}
      {images.length > 0 && (
        <div>
          <h3>Converted JPG{images.length > 1 ? 's' : ''}:</h3>
          <ul style={{listStyle: 'none', padding: 0}}>
            {images.map((url, idx) => (
              <li key={idx} style={{marginBottom: 12}}>
                <a href={url} target="_blank" rel="noopener noreferrer" download>
                  Download JPG {images.length > 1 ? idx + 1 : ''}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PdfToJpg; 