import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ExportButton = ({ data = [], filename = 'gym_report', title = 'Gym Operations Report' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = headers.map((h) => {
        const val = row[h] !== undefined && row[h] !== null ? String(row[h]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const exportPDF = () => {
    if (!data || data.length === 0) return;
    const doc = new jsPDF();

    // Brand header — dark editorial
    doc.setFillColor(13, 12, 8);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(201, 161, 90);   // gold
    doc.setFontSize(14);
    doc.text('SMART GYM ANALYTICS PLATFORM', 14, 16);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 148, 16);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    doc.text(title, 14, 35);

    const headers = [Object.keys(data[0])];
    const rows = data.map((item) => Object.values(item));

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 42,
      theme: 'grid',
      headStyles: { fillColor: [201, 161, 90], textColor: [13, 12, 8], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#94A3B8',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,161,90,0.35)'; e.currentTarget.style.color = '#C9A15A'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94A3B8'; }}
      >
        <Download className="w-3.5 h-3.5" style={{ color: '#C9A15A' }} />
        <span>Export Report</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 rounded-xl z-30 py-1 animate-fade-in overflow-hidden"
            style={{ background: '#18170F', border: '1px solid rgba(201,161,90,0.2)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
            <div className="px-4 py-2 border-b border-white/[0.06]">
              <span className="font-mono text-[10px] text-[#C9A15A]/60 uppercase tracking-widest">Export As</span>
            </div>
            <button
              onClick={exportCSV}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-400 text-left transition cursor-pointer hover:text-[#6FBE8C]"
              style={{ background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(111,190,140,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <FileSpreadsheet className="w-4 h-4 text-[#6FBE8C]" />
              <span>Export as CSV</span>
            </button>
            <button
              onClick={exportPDF}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-400 text-left transition cursor-pointer hover:text-[#C9A15A]"
              style={{ background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,161,90,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <FileText className="w-4 h-4 text-[#C9A15A]" />
              <span>Export as PDF Report</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
