'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Printer, 
  Download, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  Building, 
  Calendar, 
  Mail, 
  Phone, 
  CheckCircle, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { Quotation } from '@/lib/types';
import { formatCurrency, calculateItemAmounts } from '@/lib/calculations';
import { generateQuotationPDF } from '@/lib/pdf-generator';

interface QuotationPreviewProps {
  quotation: Quotation;
  onDelete?: () => void;
}

export default function QuotationPreview({ quotation, onDelete }: QuotationPreviewProps) {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateQuotationPDF(quotation);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/quotations')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              {quotation.status || 'Active'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print Quote
          </button>

          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>

          <Link
            href={`/quotations/${quotation.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </Link>

          {onDelete && (
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Quotation Document Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg p-8 sm:p-12 print-page space-y-8">
        {/* Header / Brand & Document Information */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Triple S Solutions</span>
            </div>
            <p className="text-xs text-slate-500">Enterprise Financial & Software Systems</p>
            <p className="text-xs text-slate-500 mt-1">100 Tech Boulevard, Suite 400, Innovation Hub</p>
            <p className="text-xs text-slate-500">billing@triples.software | +1 (555) 019-2834</p>
          </div>

          <div className="sm:text-right">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              QUOTATION
            </h1>
            <p className="text-sm font-mono font-bold text-blue-600 mt-1">
              #{quotation.quotation_number}
            </p>
            <div className="mt-3 space-y-1 text-xs text-slate-600">
              <p>
                <span className="text-slate-400">Date:</span>{' '}
                <span className="font-medium text-slate-800">{quotation.quotation_date}</span>
              </p>
              {quotation.valid_until && (
                <p>
                  <span className="text-slate-400">Valid Until:</span>{' '}
                  <span className="font-medium text-slate-800">{quotation.valid_until}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Customer Details Box */}
        <div className="bg-slate-50/70 rounded-xl p-6 border border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Quotation Prepared For:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-lg font-bold text-slate-900">{quotation.customer_name}</p>
              {quotation.company_name && (
                <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {quotation.company_name}
                </p>
              )}
            </div>
            <div className="space-y-1 text-xs text-slate-600 sm:text-right sm:self-center">
              <p className="flex items-center sm:justify-end gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {quotation.email}
              </p>
              {quotation.phone && (
                <p className="flex items-center sm:justify-end gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {quotation.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Product / Service Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3">Product / Service</th>
                <th className="py-3 px-3 text-center w-20">Qty</th>
                <th className="py-3 px-3 text-right w-28">Unit Price</th>
                <th className="py-3 px-3 text-center w-24">Discount</th>
                <th className="py-3 px-3 text-right w-32">Net Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {(quotation.quotation_items || []).map((item, idx) => {
                const computed = calculateItemAmounts(item);
                return (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-900">
                      {item.product_name}
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-600">
                      {item.discount > 0 ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {item.discount}%
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(computed.netAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Section: Notes & Detailed Financial Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4 border-t border-slate-100">
          {/* Notes */}
          <div className="sm:col-span-7 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Terms & Notes
            </p>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
              {quotation.notes ||
                'This quotation is valid for 30 days from issuance. Payment terms: 50% advance upon project sign-off.'}
            </p>
          </div>

          {/* Totals Breakdown */}
          <div className="sm:col-span-5 space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200/80">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-medium text-slate-800">
                {formatCurrency(quotation.subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span>GST ({quotation.gst_rate}%):</span>
              <span className="font-mono font-medium text-slate-800">
                {formatCurrency(quotation.gst)}
              </span>
            </div>

            <div className="border-t border-slate-300 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Grand Total:</span>
              <span className="text-xl font-extrabold text-blue-600 font-mono">
                {formatCurrency(quotation.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
          Thank you for choosing Triple S. For assistance, email billing@triples.software.
        </div>
      </div>
    </div>
  );
}
