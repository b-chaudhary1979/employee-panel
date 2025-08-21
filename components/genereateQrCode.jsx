import { useState, useRef } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";

const GenerateQRCode = ({ 
  title = "QR Code", 
  onError, 
  showModal = true,
  onClose,
  customQRText,
  fileName = "qr-code",
  isEmployeePanel = false
}) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const printInProgress = useRef(false);

  // Generate QR code from data
  const generateQRCode = async (dataToEncode) => {
    try {
      setIsGenerating(true);
      setCurrentData(dataToEncode);
      
      // Use custom QR text if provided, otherwise format the data
      const qrText = customQRText || formatDataForQR(dataToEncode);
      
      // Add cache-busting parameter to prevent browser caching
      const qrTextWithTimestamp = `${qrText}\n\nGenerated: ${new Date().toLocaleString()}`;
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(qrTextWithTimestamp, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeDataUrl(qrDataUrl);
      
      if (showModal) {
        setShowQRModal(true);
      }
      
      return qrDataUrl;
    } catch (error) {
      if (onError) {
        onError("Error generating QR code");
      }
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const formatDataForQR = (data) => {
    const firstName = data.firstName || "";
    const lastName = data.lastName || "";
    const email = data.email || "";
    const phone = data.phone || "";
    const address = data.address || "";
    const city = data.city || "";
    const state = data.state || "";
    const department = data.department || "";
    const role = data.role || "";
    const status = data.status || "";
    const dateJoined = data.dateJoined || "";
    const dob = data.dob || "";
    const gender = data.gender || "";
    const id = isEmployeePanel ? data.employeeId || data.id || "" : data.internId || data.id || "";
    const type = isEmployeePanel ? "EMPLOYEE" : "INTERN";

    return `${type} INFORMATION

Name: ${firstName} ${lastName}
${isEmployeePanel ? 'Employee' : 'Intern'} ID: ${id}
Email: ${email}
Phone: ${phone}
Address: ${address}, ${city}, ${state}
Department: ${department}
Role: ${role}
Status: ${status}
Date Joined: ${dateJoined}
Date of Birth: ${dob}
Gender: ${gender}`;
  };
  
  // Handle view PDF (generates PDF and opens in new tab for viewing)
  const handleViewPDF = async (e) => {
    // Prevent event bubbling and double-clicks
    e.preventDefault();
    e.stopPropagation();
    
    // Check if already generating or no data
    if (!currentData || isPrinting || printInProgress.current) {
      return;
    }

    try {
      // Set flags immediately to prevent double execution
      printInProgress.current = true;
      setIsPrinting(true);
      
      const qrText = customQRText || formatDataForQR(currentData);
      
      // Generate a fresh QR code for the PDF to avoid duplication
      const freshQRDataUrl = await QRCode.toDataURL(qrText, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      const pdf = new jsPDF();
      
      // Center the QR code on the page (QR only, no text)
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const qrSize = 120; // Larger QR code for better visibility
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = (pageHeight - qrSize) / 2;
      
      pdf.addImage(freshQRDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      
      // Open PDF in new tab for viewing
      const viewWindow = window.open(blobUrl, '_blank');
      
      if (viewWindow) {
        // Clean up the blob URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 5000);
      }
    } catch (error) {
      if (onError) {
        onError("Error generating PDF");
      }
    } finally {
      // Reset flags
      setIsPrinting(false);
      printInProgress.current = false;
    }
  };

  // Handle download QR (generates PDF with only QR code)
  const handleDownloadQR = (e) => {
    // Prevent event bubbling and double-clicks
    e.preventDefault();
    e.stopPropagation();
    
    if (!qrCodeDataUrl) return;

    try {
      const pdf = new jsPDF();
      
      // Center the QR code on the page
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const qrSize = 120; // Larger QR code for better visibility
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = (pageHeight - qrSize) / 2;
      
      pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      const name = currentData && currentData.firstName && currentData.lastName 
        ? `${currentData.firstName}_${currentData.lastName}` 
        : fileName;
      pdf.save(`${name}_${isEmployeePanel ? 'employee' : 'intern'}_qr_only.pdf`);
    } catch (error) {
      if (onError) {
        onError("Error downloading PDF");
      }
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowQRModal(false);
    if (onClose) {
      onClose();
    }
  };

  return {
    generateQRCode,
    isGenerating,
    qrCodeDataUrl,
    showQRModal,
    handleCloseModal,
    handleViewPDF,
    handleDownloadQR,
    
    // Modal component
    QRModal: showQRModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            {/* QR Code Display */}
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <img src={qrCodeDataUrl} alt="QR Code" className="w-64 h-64" />
            </div>
            
                         {/* Action Buttons */}
             <div className="flex gap-4 w-full">
                              <button
                  onClick={handleViewPDF}
                  disabled={isPrinting || printInProgress.current}
                  className={`flex-1 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
                    isPrinting || printInProgress.current
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                 {isPrinting ? (
                   <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                   </svg>
                 ) : (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                   </svg>
                 )}
                 {isPrinting ? 'Generating...' : 'View PDF'}
               </button>
              
              <button
                onClick={handleDownloadQR}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  };
};

export default GenerateQRCode;
