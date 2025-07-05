import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import CompressPDF from './pages/CompressPDF';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MergePDF from './pages/MergePDF';
import SplitPDF from './pages/SplitPDF';
import RemovePages from './pages/RemovePages';
import ExtractPages from './pages/ExtractPages';
import OrganizePDF from './pages/OrganizePDF';
import ScanToPDF from './pages/ScanToPDF';
import JpgToPdf from './pages/JpgToPdf';
import WordToPdf from './pages/WordToPdf';
import PowerPointToPdf from './pages/PowerPointToPdf';
import ExcelToPdf from './pages/ExcelToPdf';
import HtmlToPdf from './pages/HtmlToPdf';
import Profile from './pages/Profile';
import PastPDFs from './pages/PastPDFs';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<CompressPDF />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/merge-pdf" element={<MergePDF />} />
            <Route path="/split-pdf" element={<SplitPDF />} />
            <Route path="/remove-pages" element={<RemovePages />} />
            <Route path="/extract-pages" element={<ExtractPages />} />
            <Route path="/organize-pdf" element={<OrganizePDF />} />
            <Route path="/scan-to-pdf" element={<ScanToPDF />} />
            <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
            <Route path="/word-to-pdf" element={<WordToPdf />} />
            <Route path="/powerpoint-to-pdf" element={<PowerPointToPdf />} />
            <Route path="/excel-to-pdf" element={<ExcelToPdf />} />
            <Route path="/html-to-pdf" element={<HtmlToPdf />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/past-pdfs" element={<PastPDFs />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 