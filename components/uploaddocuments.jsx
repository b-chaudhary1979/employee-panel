import React from "react";

function InlineLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function UploadDocuments({
  photo,
  photoFileName,
  onPhotoChange,
  documents,
  onDocumentChange,
  addDocumentInput,
  fileInputRef,
  docInputRefs,
  loading = false
}) {
  return (
    <div className="relative">
      {loading && <InlineLoader />}
      {/* Profile Picture Upload and Preview */}
      <div className="flex flex-col items-center mb-4">
        <label className="block text-sm font-medium mb-1">Profile Picture</label>
        <div className="mb-2">
          {photo ? (
            <img src={photo} alt="Profile Preview" className="w-20 h-20 rounded-full object-cover border" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          )}
        </div>
        {/* Show file name if uploaded */}
        {photoFileName && (
          <div className="text-xs text-gray-600 mb-2">{photoFileName}</div>
        )}
        {/* Custom file input button - use ref and button outside form context */}
        <div className="flex justify-center">
          <button type="button" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow cursor-pointer" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
            Choose Photo
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" name="photo" onChange={onPhotoChange} className="hidden" form="noform" />
        </div>
      </div>
      {/* Document Upload Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Upload Documents</label>
        {documents.map((doc, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-3 py-1 rounded-lg shadow cursor-pointer" onClick={() => docInputRefs.current[idx] && docInputRefs.current[idx].click()}>
              Choose File
            </button>
            <input ref={el => docInputRefs.current[idx] = el} type="file" onChange={e => onDocumentChange(idx, e)} className="hidden" form="noform" />
            <span className="text-xs text-gray-600">{doc.name ? doc.name : "No file chosen"}</span>
          </div>
        ))}
        <button type="button" onClick={addDocumentInput} className="mt-2 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200">+ Add Document</button>
      </div>
    </div>
  );
} 