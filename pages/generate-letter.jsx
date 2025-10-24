import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SideMenu from '../components/sidemenu';
import Header from '../components/header';
import OfferLetterTemplate from '../components/OfferLetterTemplate';
import { useSidebar } from '../context/SidebarContext';
import { useUserInfo } from '../context/UserInfoContext';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = "cyberclipperSecretKey123!";

function decryptToken(token) {
  try {
    const bytes = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    const { ci, aid } = JSON.parse(decrypted);
    return { ci, aid };
  } catch {
    return { ci: null, aid: null };
  }
}

function encryptToken(ci, aid) {
  const data = JSON.stringify({ ci, aid });
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

const DocumentTypeCard = ({ icon, title, description, onClick, isSelected }) => (
  <div
    onClick={onClick}
    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
      isSelected 
        ? 'border-green-500 bg-green-50 shadow-md' 
        : 'border-gray-200 bg-white hover:border-green-300'
    }`}
  >
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${isSelected ? 'bg-green-100' : 'bg-green-50'}`}>
        {icon}
      </div>
      <div>
        <h3 className={`text-lg font-semibold ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`text-sm ${isSelected ? 'text-[#45CA8A]' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </div>
  </div>
);

const EmployeeTypeCard = ({ type, icon, description, onClick, isSelected }) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
      isSelected 
        ? 'border-green-500 bg-green-50' 
        : 'border-gray-200 bg-white hover:border-green-300'
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-md ${isSelected ? 'bg-green-100' : 'bg-green-50'}`}>
        {icon}
      </div>
      <div>
        <h4 className={`font-medium ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
          {type}
        </h4>
        <p className={`text-xs ${isSelected ? 'text-[#45CA8A]' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </div>
  </div>
);

const FormField = ({ label, type = "text", value, onChange, required = false, options = null }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === "select" ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        required={required}
      >
        <option value="">Select {label}</option>
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : type === "textarea" ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        required={required}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        required={required}
      />
    )}
  </div>
);

export default function GenerateLetter() {
  const router = useRouter();
  const { isOpen } = useSidebar();
  const { user, loading: userLoading } = useUserInfo();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);

  const [currentStep, setCurrentStep] = useState('documentType'); // documentType, employeeType, form, preview
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedEmployeeType, setSelectedEmployeeType] = useState(null);
  const [formData, setFormData] = useState({});
  const [generatedDocument, setGeneratedDocument] = useState(null);
  const [isEditingOffer, setIsEditingOffer] = useState(false);
  const [showOfferPreview, setShowOfferPreview] = useState(false);
  const offerTemplateRef = useRef(null);

  const documentTypes = [
    {
      id: 'offer-letter',
      title: 'Generate Offer Letter',
      description: 'Create professional offer letters for new hires',
      icon: (
        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      requiresEmployeeType: true
    },
    {
      id: 'completion-certificate',
      title: 'Completion Certificate',
      description: 'Generate completion certificates for projects or courses',
      icon: (
        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      requiresEmployeeType: false
    },
    {
      id: 'letter-of-recommendation',
      title: 'Letter of Recommendation',
      description: 'Create recommendation letters for employees',
      icon: (
        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      requiresEmployeeType: true
    },
    {
      id: 'experience-letter',
      title: 'Experience Letter',
      description: 'Generate experience letters for departing employees',
      icon: (
        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      requiresEmployeeType: true
    },
    {
      id: 'salary-slip',
      title: 'Salary Slip',
      description: 'Generate salary slips for employees',
      icon: (
        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      requiresEmployeeType: false
    }
  ];

  const employeeTypes = [
    {
      id: 'intern',
      type: 'Intern',
      description: 'Internship position',
      icon: (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    // {
    //   id: 'full-time',
    //   type: 'Full Time Employee',
    //   description: 'Permanent full-time position',
    //   icon: (
    //     <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
    //     </svg>
    //   )
    // },
    {
      id: 'freelancer',
      type: 'Freelancer',
      description: 'Contract-based work',
      icon: (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ];

  const getFormFields = () => {
    const baseFields = {
      'offer-letter': [
        
        { name: 'candidateName', label: 'Candidate Name', type: 'text', required: true },
        { name: 'candidateEmail', label: 'Candidate Email', type: 'text', required: false },
        { name: 'candidatePhone', label: 'Candidate Phone', type: 'text', required: false },
        { name: 'candidateAddress', label: 'Candidate Address', type: 'textarea', required: false },
        // Role details
        { name: 'position', label: 'Position', type: 'text', required: true },
        { name: 'department', label: 'Department', type: 'text', required: true },
        { name: 'employmentType', label: 'Employment Type (Full-time / Intern / Freelancer)', type: 'text', required: false },
        { name: 'workMode', label: 'Work Mode (Onsite/Remote/Hybrid)', type: 'text', required: false },
        { name: 'workLocation', label: 'Work Location', type: 'text', required: true },
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        { name: 'probationPeriod', label: 'Probation Period', type: 'text', required: false },
        { name: 'noticePeriod', label: 'Notice Period', type: 'text', required: false },
        { name: 'workHours', label: 'Work Hours', type: 'text', required: false },
        { name: 'reportingManager', label: 'Reporting Manager', type: 'text', required: true },
        { name: 'reportingManagerEmail', label: 'Reporting Manager Email', type: 'text', required: false },
        // Compensation
        { name: 'salary', label: 'CTC / Stipend', type: 'text', required: true },
        { name: 'salaryBreakup', label: 'Compensation Breakdown (Basic/HRA/Allowances)', type: 'textarea', required: false },
        { name: 'benefits', label: 'Benefits (Medical/Insurance/Perks)', type: 'textarea', required: false },
        { name: 'contractDuration', label: 'Contract Duration (Freelancer)', type: 'text', required: false },
        { name: 'incentive', label: 'Incentive', type: 'text', required: false },
        // Additional
        { name: 'additionalTerms', label: 'Additional Terms', type: 'textarea', required: false }
      ],
      'completion-certificate': [
        { name: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
        { name: 'recipientEmail', label: 'Recipient Email', type: 'text', required: false },
        { name: 'courseName', label: 'Course/Project Name', type: 'text', required: true },
        { name: 'trackOrDomain', label: 'Track/Domain', type: 'text', required: false },
        { name: 'startDate', label: 'Start Date', type: 'date', required: false },
        { name: 'completionDate', label: 'Completion Date', type: 'date', required: true },
        { name: 'duration', label: 'Duration (Weeks/Months/Hours)', type: 'text', required: true },
        { name: 'totalHours', label: 'Total Hours', type: 'number', required: false },
        { name: 'grade', label: 'Grade/Score', type: 'text', required: false },
        { name: 'skillsCovered', label: 'Skills Covered', type: 'textarea', required: false },
        { name: 'instructor', label: 'Instructor/Supervisor', type: 'text', required: true },
        { name: 'organization', label: 'Organization', type: 'text', required: false },
        { name: 'certificateId', label: 'Certificate ID', type: 'text', required: false },
        { name: 'issueDate', label: 'Issue Date', type: 'date', required: false }
      ],
      'letter-of-recommendation': [
        { name: 'candidateName', label: 'Candidate Name', type: 'text', required: true },
        { name: 'candidateEmail', label: 'Candidate Email', type: 'text', required: false },
        { name: 'position', label: 'Position Held', type: 'text', required: true },
        { name: 'department', label: 'Department/Team', type: 'text', required: false },
        { name: 'startDate', label: 'Start Date', type: 'date', required: false },
        { name: 'endDate', label: 'End Date', type: 'date', required: false },
        { name: 'duration', label: 'Total Duration', type: 'text', required: true },
        { name: 'responsibilities', label: 'Key Responsibilities', type: 'textarea', required: false },
        { name: 'keyAchievements', label: 'Key Achievements', type: 'textarea', required: true },
        { name: 'skills', label: 'Key Skills', type: 'textarea', required: true },
        { name: 'projects', label: 'Notable Projects', type: 'textarea', required: false },
        { name: 'workEthic', label: 'Work Ethic/Behavior', type: 'textarea', required: false },
        { name: 'recommendation', label: 'Recommendation Details', type: 'textarea', required: true },
        { name: 'recommenderName', label: 'Recommender Name', type: 'text', required: true },
        { name: 'recommenderTitle', label: 'Recommender Title', type: 'text', required: true },
        { name: 'recommenderEmail', label: 'Recommender Email', type: 'text', required: false },
        { name: 'recommenderPhone', label: 'Recommender Phone', type: 'text', required: false },
        { name: 'companyName', label: 'Company Name', type: 'text', required: false },
        { name: 'letterDate', label: 'Letter Date', type: 'date', required: false }
      ],
      'experience-letter': [
        { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { name: 'employeeId', label: 'Employee ID', type: 'text', required: false },
        { name: 'department', label: 'Department', type: 'text', required: false },
        { name: 'position', label: 'Last Designation', type: 'text', required: true },
        { name: 'designationHistory', label: 'Designation History', type: 'textarea', required: false },
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        { name: 'endDate', label: 'End Date', type: 'date', required: true },
        { name: 'workLocation', label: 'Work Location', type: 'text', required: false },
        { name: 'manager', label: 'Reporting Manager', type: 'text', required: false },
        { name: 'lastCTC', label: 'Last CTC', type: 'text', required: false },
        { name: 'responsibilities', label: 'Key Responsibilities', type: 'textarea', required: true },
        { name: 'achievements', label: 'Notable Achievements', type: 'textarea', required: false },
        { name: 'conduct', label: 'Conduct/Behavior', type: 'textarea', required: false },
        { name: 'reasonForLeaving', label: 'Reason for Leaving', type: 'text', required: false },
        { name: 'companyName', label: 'Company Name', type: 'text', required: false },
        { name: 'letterDate', label: 'Letter Date', type: 'date', required: false }
      ],
      'salary-slip': [
        // Employee info
        { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
        { name: 'designation', label: 'Designation', type: 'text', required: false },
        { name: 'department', label: 'Department', type: 'text', required: false },
        // Period
        { name: 'month', label: 'Month', type: 'select', required: true, options: [
          { value: 'January', label: 'January' },
          { value: 'February', label: 'February' },
          { value: 'March', label: 'March' },
          { value: 'April', label: 'April' },
          { value: 'May', label: 'May' },
          { value: 'June', label: 'June' },
          { value: 'July', label: 'July' },
          { value: 'August', label: 'August' },
          { value: 'September', label: 'September' },
          { value: 'October', label: 'October' },
          { value: 'November', label: 'November' },
          { value: 'December', label: 'December' }
        ]},
        { name: 'year', label: 'Year', type: 'text', required: true },
        // Attendance
        { name: 'workingDays', label: 'Working Days', type: 'number', required: false },
        { name: 'presentDays', label: 'Present Days', type: 'number', required: false },
        { name: 'lopDays', label: 'Loss of Pay (Days)', type: 'number', required: false },
        // Earnings
        { name: 'basicSalary', label: 'Basic', type: 'number', required: true },
        { name: 'hra', label: 'HRA', type: 'number', required: false },
        { name: 'conveyance', label: 'Conveyance', type: 'number', required: false },
        { name: 'specialAllowance', label: 'Special Allowance', type: 'number', required: false },
        { name: 'otherEarnings', label: 'Other Earnings', type: 'number', required: false },
        { name: 'grossEarnings', label: 'Gross Earnings', type: 'number', required: false },
        // Deductions
        { name: 'pf', label: 'PF', type: 'number', required: false },
        { name: 'esi', label: 'ESI', type: 'number', required: false },
        { name: 'tds', label: 'TDS', type: 'number', required: false },
        { name: 'otherDeductions', label: 'Other Deductions', type: 'number', required: false },
        // Summary
        { name: 'totalDeductions', label: 'Total Deductions', type: 'number', required: false },
        { name: 'netSalary', label: 'Net Salary', type: 'number', required: true },
        // Banking/Ids
        { name: 'bankName', label: 'Bank Name', type: 'text', required: false },
        { name: 'bankAccount', label: 'Bank Account No.', type: 'text', required: false },
        { name: 'ifsc', label: 'IFSC Code', type: 'text', required: false },
        { name: 'uan', label: 'UAN', type: 'text', required: false },
        { name: 'pan', label: 'PAN', type: 'text', required: false },
        { name: 'pfNumber', label: 'PF Number', type: 'text', required: false },
        { name: 'esiNumber', label: 'ESI Number', type: 'text', required: false }
      ]
    };

    return baseFields[selectedDocument?.id] || [];
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    if (document.requiresEmployeeType) {
      setCurrentStep('employeeType');
    } else {
      setCurrentStep('form');
    }
  };

  const handleEmployeeTypeSelect = (type) => {
    setSelectedEmployeeType(type);
    setCurrentStep('form');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Generate document based on selected type and form data
    const document = generateDocument();
    setGeneratedDocument(document);
    setCurrentStep('preview');
  };

  const generateDocument = () => {
    const document = {
      id: Date.now(),
      type: selectedDocument.id,
      employeeType: selectedEmployeeType?.id,
      data: formData,
      generatedAt: new Date().toISOString(),
      qrCode: selectedDocument.id === 'offer-letter' ? generateQRCode() : null
    };
    return document;
  };

  const generateQRCode = () => {
    // Generate readable plain text for QR instead of JSON
    const text = `Offer Letter | Candidate: ${formData.candidateName || ''} | Position: ${formData.position || ''} | Start Date: ${formData.startDate || ''} | Company: ${(user?.company) || 'CyberClipper InfoTech LLP'}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };

  const downloadPDF = () => {
    // For offer letters: open a print window with dynamic HTML, user can save as PDF
    if (selectedDocument?.id === 'offer-letter') {
      const html = createOfferLetterHTML();
      const printWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        // Wait a tick to ensure styles load
        setTimeout(() => {
          printWindow.print();
        }, 400);
      }
      return;
    }
    alert('PDF download is currently implemented for Offer Letters.');
  };

  const createOfferLetterHTML = () => {
    const companyName = user?.company || 'CyberClipper InfoTech LLP';
    const companyAddress = user?.location || 'Dehradun, Uttarakhand, India';
    const companyEmail = user?.email || 'info@cyberclipper.com';
    const companyWebsite = 'www.cyberclipper.com';

    const candidateName = formData.candidateName || 'Candidate Name';
    const candidateEmail = formData.candidateEmail || '';
    const position = formData.position || 'Position';
    const startDate = formData.startDate || '';
    const workLocation = formData.workLocation || companyAddress;
    const type = selectedEmployeeType?.type || 'Full-time';
    const mode = formData.workMode || 'Remote / Flexible Hours';
    const dept = formData.department || '';
    const reportingManager = formData.reportingManager || '';
    const stipendOrSalary = formData.salary || '';
    const incentive = formData.incentive || '';
    const generatedOn = new Date().toLocaleDateString();

    // Mirror template.txt layout/wording closely
    return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${companyName} Offer Letter</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style type="text/tailwindcss">
  :root { --brand-blue: #2563EB; }
  body { font-family: 'Inter', sans-serif; background-color: #ffffff; }
  .brand-text { color: var(--brand-blue); }
  .footer-swoosh { position:absolute; bottom:0; left:0; width:100%; height:100px; background-repeat:no-repeat; background-size:cover; background-position:bottom; z-index:0; }
  .footer-swoosh-2 { position:absolute; bottom:0; left:0; width:100%; height:120px; background-repeat:no-repeat; background-size:cover; background-position:bottom; z-index:1; }
</style>
</head>
<body class="bg-gray-100 flex justify-center items-center p-4 sm:p-8">
<div class="w-full max-w-5xl bg-white shadow-xl rounded-2xl overflow-hidden relative">
  <div class="footer-swoosh"></div>
  <div class="footer-swoosh-2"></div>
  <header class="p-8 flex justify-between items-center border-b-4 border-[var(--brand-blue)]">
    <div>
      <img alt="Company Logo" class="h-14" src="/logo cyber clipper.png">
    </div>
    <div class="text-right text-gray-500 text-xs">
      <p class="font-medium">${companyName}</p>
      <p>${companyAddress}</p>
      <p>${companyEmail}</p>
      <p>${companyWebsite}</p>
    </div>
  </header>
  <main class="p-8 sm:p-12 text-gray-700 relative z-10">
    <div class="grid grid-cols-2 gap-8 mb-10">
      <div>
        <p class="font-semibold text-gray-800">To,</p>
        <p>${candidateName}</p>
        ${candidateEmail ? `<p class="text-sm text-gray-600">${candidateEmail}</p>` : ''}
      </div>
      <div class="text-right">
        <p class="font-semibold text-gray-800">Date:</p>
        <p>${generatedOn}</p>
      </div>
    </div>
    <h1 class="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">Subject: ${type.includes('Freelancer') ? 'Freelancer' : ''} Offer Letter for ${position} Position</h1>
    <p class="font-semibold text-lg mb-6 text-gray-800">Dear ${candidateName.split(' ')[0] || 'Candidate'},</p>
    <p class="mb-8 leading-relaxed text-base">
      We are pleased to offer you an opportunity to collaborate with ${companyName} as a ${type.includes('Freelancer') ? 'Freelancer' : type} in ${position}. This role's mode is <strong class="brand-text font-bold">${mode}</strong>. Your anticipated start date is <strong class="brand-text font-bold">${startDate || 'TBD'}</strong>. ${stipendOrSalary ? `Compensation details: <strong class="brand-text font-bold">${stipendOrSalary}</strong>. ` : ''}${incentive ? `Incentive: <strong class="brand-text font-bold">${incentive}</strong>.` : ''}
    </p>
    <div class="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
      <h2 class="text-xl font-bold brand-text mb-4">Role Details:</h2>
      <ul class="space-y-3">
        <li class="flex items-start"><span class="brand-text font-bold w-32 shrink-0">Position:</span> <span>${position}</span></li>
        <li class="flex items-start"><span class="brand-text font-bold w-32 shrink-0">Start Date:</span> <span>${startDate || 'TBD'}</span></li>
        <li class="flex items-start"><span class="brand-text font-bold w-32 shrink-0">Mode:</span> <span>${mode}</span></li>
        <li class="flex items-start"><span class="brand-text font-bold w-32 shrink-0">Type:</span> <span>${type}</span></li>
        ${stipendOrSalary ? `<li class="flex items-start"><span class="brand-text font-bold w-32 shrink-0">Salary/Stipend:</span> <span>${stipendOrSalary}</span></li>` : ''}
        ${incentive ? `<li class="flex items-start"><span class="brand-text font-bold w-32 shrink-0">Incentive:</span> <span>${incentive}</span></li>` : ''}
        ${reportingManager ? `<li class="flex items-start"><span class="brand-text font-bold w-32 shrink-0">Reporting:</span> <span>${reportingManager}</span></li>` : ''}
        ${workLocation ? `<li class="flex items-start"><span class="brand-text font-bold w-32 shrink-0">Location:</span> <span>${workLocation}</span></li>` : ''}
      </ul>
    </div>
    <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-r-lg">
      <p class="text-sm text-blue-800 leading-relaxed">
        <strong>Please note:</strong> This offer is subject to company policies. Any breach of policies may lead to termination of the engagement.
      </p>
    </div>
    <p class="mb-10">Kindly confirm your acceptance of this offer by replying to this email or signing and returning a scanned copy of this letter. We look forward to a successful collaboration.</p>
    <div>
      <p class="font-semibold text-gray-800">Best regards,</p>
      <p class="font-bold text-lg brand-text mt-1">${companyName}</p>
      <p class="text-sm text-gray-600">${companyEmail}</p>
    </div>
  </main>
  <footer class="bg-gray-800 text-white p-6 mt-12 text-center text-xs relative z-10">
    <p>© ${new Date().getFullYear()} ${companyName}. All Rights Reserved.</p>
    <p>This document is confidential and intended solely for the recipient.</p>
  </footer>
</div>
</body></html>`;
  };

  const generateShareableLink = () => {
    // In a real app, generate a shareable link
    const link = `${window.location.origin}/shared-document/${generatedDocument.id}`;
    navigator.clipboard.writeText(link);
    alert('Shareable link copied to clipboard!');
  };

  const resetForm = () => {
    setCurrentStep('documentType');
    setSelectedDocument(null);
    setSelectedEmployeeType(null);
    setFormData({});
    setGeneratedDocument(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'documentType':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#45CA8A] mb-2">Select Document Type</h2>
              <p className="text-gray-600">Choose the type of document you want to generate</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentTypes.map((doc) => (
                <DocumentTypeCard
                  key={doc.id}
                  icon={doc.icon}
                  title={doc.title}
                  description={doc.description}
                  onClick={() => handleDocumentSelect(doc)}
                  isSelected={selectedDocument?.id === doc.id}
                />
              ))}
            </div>
          </div>
        );

      case 'employeeType':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#45CA8A] mb-2">Select Employee Type</h2>
              <p className="text-gray-600">Choose the type of employee for {selectedDocument?.title}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {employeeTypes.map((type) => (
                <EmployeeTypeCard
                  key={type.id}
                  type={type.type}
                  description={type.description}
                  icon={type.icon}
                  onClick={() => handleEmployeeTypeSelect(type)}
                  isSelected={selectedEmployeeType?.id === type.id}
                />
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setCurrentStep('documentType')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
              >
                ← Back to Document Types
              </button>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Details</h2>
              <p className="text-gray-600">
                Fill in the details for {selectedDocument?.title}
                {selectedEmployeeType && ` - ${selectedEmployeeType.type}`}
              </p>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-gray-600 gap-4 sm:gap-6">
                {getFormFields().map((field) => (
                  <FormField
                    key={field.name}
                    label={field.label}
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(value) => setFormData({ ...formData, [field.name]: value })}
                    required={field.required}
                    options={field.options}
                  />
                ))}
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
                <button
                  type="button"
                  onClick={() => setCurrentStep(selectedDocument?.requiresEmployeeType ? 'employeeType' : 'documentType')}
                  className="px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2 bg-[#45CA8A] text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  Generate Document
                </button>
              </div>
            </form>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Generated Successfully!</h2>
              <p className="text-gray-600">Your document is ready for download or sharing</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDocument?.title}
                </h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Generated
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Document Type:</span>
                    <p className="text-gray-900 break-words">{selectedDocument?.title}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Employee Type:</span>
                    <p className="text-gray-900">{selectedEmployeeType?.type || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Generated:</span>
                    <p className="text-gray-900">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <p className="text-[#45CA8A]">Ready</p>
                  </div>
                </div>

                {generatedDocument?.qrCode && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">QR Code for Offer Letter</h4>
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <img src={generatedDocument.qrCode} alt="QR Code" className="w-16 h-16 sm:w-20 sm:h-20" />
                      <p className="text-sm text-gray-600 text-center sm:text-left">
                        Scan this QR code to verify the offer letter details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedDocument?.id === 'offer-letter' && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => {
                    const html = createOfferLetterHTML();
                    const w = window.open('', '_blank', 'noopener,noreferrer');
                    if (w) {
                      w.document.open();
                      w.document.write(html);
                      w.document.close();
                      // Ensure content fully loads before focusing
                      const onLoad = () => {
                        w.focus();
                        w.removeEventListener('load', onLoad);
                      };
                      w.addEventListener('load', onLoad);
                    }
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-[#45CA8A] text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  Preview Offer Letter
                </button>
                <button
                  onClick={() => setCurrentStep('form')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Edit Details
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={downloadPDF}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF</span>
                </button>
                
                <button
                  onClick={generateShareableLink}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-[#45CA8A] text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Generate Shareable Link</span>
                </button>
              </div>

            <div className="flex justify-center">
              <button
                onClick={resetForm}
                className="px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
              >
                Generate Another Document
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state while user data is being fetched
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#45CA8A] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Generate Letter - Admin Panel</title>
        <meta name="description" content="Generate various types of letters and documents" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <SideMenu />
        <div className={`transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-16'}`}>
          <Header 
            username={user?.name || "Admin"} 
            companyName={user?.company || "CyberClipper InfoTech LLP"} 
          />
          <main className="p-4 sm:p-6 pt-20 sm:pt-24">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#45CA8A] mb-2">Generate Letter</h1>
                <p className="text-sm sm:text-base text-gray-600">Create professional documents and letters for your organization</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                {renderStep()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
