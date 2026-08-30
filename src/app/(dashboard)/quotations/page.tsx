'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Download, 
  Building, 
  Calendar, 
  FileText,
  RefreshCw,
  X
} from 'lucide-react';
import DeleteModal from '@/components/DeleteModal';
import { Quotation } from '@/lib/types';
import { fetchQuotations, deleteQuotation } from '@/lib/storage';
import { formatCurrency } from '@/lib/calculations';
import { generateQuotationPDF } from '@/lib/pdf-generator';

export default function QuotationsListPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const data = await fetchQuotations();
      setQuotations(data);
    } catch (err) {
      console.error('Failed to load quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteQuotation(deleteTargetId);
      setDeleteTargetId(null);
      await loadQuotations();
    } catch (err) {
      console.error('Failed to delete quotation:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Search and filter logic
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const matchesSearch =
        q.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.company_name && q.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        q.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || (q.status || 'draft').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Quotations Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search, view, edit, download PDF, or delete existing quotations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadQuotations}
            className="p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/quotations/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-500 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Create Quotation
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer, quote #, company..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <span className="text-xs text-slate-400">
            {filteredQuotations.length} {filteredQuotations.length === 1 ? 'result' : 'results'}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading quotations table...</p>
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800">No matching quotations</p>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search terms or filters'
                  : 'Get started by creating your first quotation'}
              </p>
            </div>
            {searchTerm || statusFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                href="/quotations/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Create Quotation
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Quotation #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Valid Until</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-blue-600 text-xs">
                      <Link href={`/quotations/${q.id}`} className="hover:underline">
                        {q.quotation_number}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900">{q.customer_name}</p>
                      <p className="text-xs text-slate-400">{q.email}</p>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600">
                      {q.company_name || '-'}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {q.quotation_date}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {q.valid_until || '-'}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(q.total)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                        {q.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/quotations/${q.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Quotation"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => generateQuotationPDF(q)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/quotations/${q.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit Quotation"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTargetId(q.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Quotation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
