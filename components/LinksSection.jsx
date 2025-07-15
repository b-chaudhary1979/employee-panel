import React, { useState } from "react";

const mockLinks = [
  { id: 1, url: "https://www.google.com", date: "2024-06-01", employee: "Alice" },
  { id: 2, url: "https://www.github.com", date: "2024-06-02", employee: "Bob" },
  { id: 3, url: "https://www.example.com", date: "2024-06-03", employee: "Charlie" },
];

export default function LinksSection() {
  const [copied, setCopied] = useState(null);
  const [search, setSearch] = useState("");

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  // Filtered data
  const filteredLinks = mockLinks.filter(link => {
    const q = search.toLowerCase();
    return (
      link.url.toLowerCase().includes(q) ||
      link.date.toLowerCase().includes(q) ||
      link.employee.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6 text-left">
        <h2 className="text-2xl font-bold text-[#7c3aed]">Links</h2>
        <p className="text-gray-500 text-base mt-1">Access and manage your saved links.</p>
      </div>
      {/* Search Bar */}
      <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-2">
        <div className="w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by link, date, or employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg shadow border border-purple-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-600 text-gray-900 transition"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-[#f3f4f6] text-[#7c3aed]">
              <th className="py-3 px-4 text-left">S.No</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Link</th>
              <th className="py-3 px-4 text-left">Actions</th>
              <th className="py-3 px-4 text-left">Added By</th>
            </tr>
          </thead>
          <tbody>
            {filteredLinks.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6 text-gray-400">No links found.</td></tr>
            ) : filteredLinks.map((link, idx) => (
              <tr key={link.id} className="border-b hover:bg-[#f9f5ff] transition">
                <td className="py-2 px-4 text-gray-600">{idx + 1}</td>
                <td className="py-2 px-4 text-gray-600">{link.date}</td>
                <td className="py-2 px-4">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7c3aed] underline break-all hover:text-[#5b21b6]"
                  >
                    {link.url}
                  </a>
                </td>
                <td className="py-2 px-4 flex gap-2">
                  <button
                    onClick={() => handleCopy(link.url, link.id)}
                    className="px-3 py-1 bg-[#ede9fe] text-[#7c3aed] rounded hover:bg-[#c7d2fe] transition"
                  >
                    {copied === link.id ? "Copied!" : "Copy"}
                  </button>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#f3f4f6] text-[#7c3aed] rounded hover:bg-[#e0e7ff] transition"
                  >
                    Open
                  </a>
                </td>
                <td className="py-2 px-4 text-gray-700 font-medium">{link.employee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 