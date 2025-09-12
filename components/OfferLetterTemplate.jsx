import React, { forwardRef } from "react";

// A dynamic, printable Offer Letter template inspired by template.txt
// Renders using Tailwind classes and accepts all values via props
// Use ref from parent to capture/print/download

const OfferLetterTemplate = forwardRef(function OfferLetterTemplate(
  {
    company = {
      name: "CyberClipper InfoTech LLP",
      address: "Dehradun, Uttarakhand, India",
      email: "info@cyberclipper.com",
      website: "www.cyberclipper.com",
      brandColor: "#2563EB",
      logoSrc: "/logo cyber clipper.png",
    },
    candidate = {
      name: "Candidate Name",
      email: "candidate@example.com",
    },
    offer = {
      title: "Offer Letter",
      position: "Position",
      startDate: "",
      mode: "Onsite / Remote",
      type: "Full-time",
      stipendOrSalary: "As per company policy",
      incentive: "",
      department: "",
      workLocation: "",
      reportingManager: "",
      additionalTerms: "",
    },
    generatedOn = new Date().toLocaleDateString(),
  },
  ref
) {
  return (
    <div ref={ref} className="bg-white text-gray-800 w-[794px] max-w-full mx-auto">
      <style>{`:root { --brand-blue: ${company.brandColor}; }`}</style>
      <div className="shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        <header className="p-6 sm:p-8 flex items-center justify-between border-b-4" style={{ borderColor: "var(--brand-blue)" }}>
          <div className="flex items-center gap-3">
            <img src={company.logoSrc} alt="Company Logo" className="h-12 w-auto object-contain" />
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg" style={{ color: "var(--brand-blue)" }}>{company.name}</h1>
              <p className="text-xs text-gray-500">{company.website}</p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p className="font-medium">{company.name}</p>
            <p>{company.address}</p>
            <p>{company.email}</p>
            <p>{company.website}</p>
          </div>
        </header>

        <main className="p-6 sm:p-10">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="font-semibold text-gray-800">To,</p>
              <p>{candidate.name}</p>
              {candidate.email ? (
                <p className="text-sm text-gray-600">{candidate.email}</p>
              ) : null}
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">Date:</p>
              <p>{generatedOn}</p>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 border-b pb-2">
            Subject: {offer.title} for {offer.position}
          </h2>
          <p className="font-semibold text-base sm:text-lg mb-6 text-gray-800">Dear {candidate.name?.split(" ")[0] || "Candidate"},</p>

          <p className="mb-6 leading-relaxed text-sm sm:text-base">
            We are pleased to offer you a position with {company.name} as <strong>{offer.position}</strong> in the {offer.department || "relevant"} department. Your anticipated start date is <strong>{offer.startDate || "TBD"}</strong>. The role is categorized as <strong>{offer.type}</strong> with a work mode of <strong>{offer.mode}</strong> at <strong>{offer.workLocation || company.address}</strong>.
          </p>

          <div className="bg-gray-50 rounded-lg p-5 sm:p-6 mb-8 border border-gray-200">
            <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: "var(--brand-blue)" }}>Offer Details</h3>
            <ul className="space-y-3 text-sm sm:text-base">
              <li className="flex items-start"><span className="font-semibold w-36 shrink-0" style={{ color: "var(--brand-blue)" }}>Position:</span> <span>{offer.position}</span></li>
              <li className="flex items-start"><span className="font-semibold w-36 shrink-0" style={{ color: "var(--brand-blue)" }}>Start Date:</span> <span>{offer.startDate || "TBD"}</span></li>
              {offer.stipendOrSalary ? (
                <li className="flex items-start"><span className="font-semibold w-36 shrink-0" style={{ color: "var(--brand-blue)" }}>Salary/Stipend:</span> <span>{offer.stipendOrSalary}</span></li>
              ) : null}
              {offer.incentive ? (
                <li className="flex items-start"><span className="font-semibold w-36 shrink-0" style={{ color: "var(--brand-blue)" }}>Incentive:</span> <span>{offer.incentive}</span></li>
              ) : null}
              {offer.reportingManager ? (
                <li className="flex items-start"><span className="font-semibold w-36 shrink-0" style={{ color: "var(--brand-blue)" }}>Reporting To:</span> <span>{offer.reportingManager}</span></li>
              ) : null}
              <li className="flex items-start"><span className="font-semibold w-36 shrink-0" style={{ color: "var(--brand-blue)" }}>Work Mode:</span> <span>{offer.mode}</span></li>
              <li className="flex items-start"><span className="font-semibold w-36 shrink-0" style={{ color: "var(--brand-blue)" }}>Type:</span> <span>{offer.type}</span></li>
            </ul>
          </div>

          {offer.additionalTerms ? (
            <div className="bg-blue-50 border-l-4 p-4 mb-8 rounded-r-lg" style={{ borderColor: "var(--brand-blue)" }}>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                <strong>Additional Terms:</strong> {offer.additionalTerms}
              </p>
            </div>
          ) : null}

          <p className="mb-8 text-sm sm:text-base">
            Kindly confirm your acceptance of this offer by replying to this email or signing and returning a scanned copy of this letter. We look forward to a successful collaboration.
          </p>

          <div>
            <p className="font-semibold">Best regards,</p>
            <p className="font-bold text-base sm:text-lg" style={{ color: "var(--brand-blue)" }}>{company.name}</p>
            <p className="text-xs sm:text-sm text-gray-600">{company.email}</p>
          </div>
        </main>

        <footer className="bg-gray-800 text-white p-4 sm:p-6 text-center text-[10px] sm:text-xs">
          <p>© {new Date().getFullYear()} {company.name}. All Rights Reserved.</p>
          <p>This document is confidential and intended solely for the recipient.</p>
        </footer>
      </div>
    </div>
  );
});

export default OfferLetterTemplate;


