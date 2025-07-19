import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import GoogleAuthHandler from './components/GoogleAuthHandler';
import CompressPDF from './pages/CompressPDF';
import RepairPDF from './pages/RepairPDF';
import OCRPDF from './pages/OCRPDF';
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
import PdfToJpg from './pages/PdfToJpg';
import PdfToWord from './pages/PdfToWord';
import PdfToPowerpoint from './pages/PdfToPowerpoint';
import PdfToExcel from './pages/PdfToExcel';
import Pricing from './pages/Pricing';
import Business from './pages/Business';
import Help from './pages/Help';
import './App.css';

// Custom wrapper to use hooks with Router
function AppRoutes() {
  const { checkSession } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If redirected from Google login, check session
    if (location.search.includes('auth=success')) {
      checkSession();
    }
  }, [location, checkSession]);

  return (
    <div className="App">
      <GoogleAuthHandler />
      <Header />
      <Routes>
        <Route path="/" element={<CompressPDF />} />
        <Route path="/compress-pdf" element={<CompressPDF />} />
        <Route path="/repair-pdf" element={<RepairPDF />} />
        <Route path="/ocr-pdf" element={<OCRPDF />} />
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
        <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
        <Route path="/pdf-to-word" element={<PdfToWord />} />
        <Route path="/pdf-to-powerpoint" element={<PdfToPowerpoint />} />
        <Route path="/pdf-to-excel" element={<PdfToExcel />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/business" element={<Business />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
