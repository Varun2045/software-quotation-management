'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  PlusCircle, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  ArrowRight, 
  Eye, 
  Edit3, 
  Trash2,
  Download,
  Building,
  CheckCircle2
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import DeleteModal from '@/components/DeleteModal';
import { Quotation, DashboardStats } from '@/lib/types';
import { fetchQuotations, deleteQuotation, computeDashboardStats } from '@/lib/storage';
import { formatCurrency } from '@/lib/calculations';
import { generateQuotationPDF } from '@/lib/pdf-generator';

export default function DashboardPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

  const stats: DashboardStats = computeDashboardStats(quotations);

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteQuotation(deleteTargetId);
      setDeleteTargetId(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete quotation:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const recentQuotations = quotations.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Quotation System Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Quotation Management Dashboard
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Create professional software quotations, automatically calculate discounts and GST, and export PDF documents.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            href="/quotations/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Quote</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Quotations"
          value={stats.totalQuotations}
          subtitle="All created records"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Total Quotation Value"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="Gross pipeline amount"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Average Quote Value"
          value={formatCurrency(stats.averageQuotationValue)}
          subtitle="Mean per quotation"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Issued This Month"
          value={stats.activeThisMonth}
          subtitle="Current billing cycle"
          icon={Calendar}
          color="amber"
        />
      </div>

      {/* Recent Quotations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Quotations</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing the latest generated customer quotations
            </p>
          </div>
          <Link
            href="/quotations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>View All Quotations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading quotations...</p>
          </div>
        ) : recentQuotations.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800">No quotations found</p>
              <p className="text-xs text-slate-500 mt-1">Get started by creating your very first quotation</p>
            </div>
            <Link
              href="/quotations/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Create Quotation
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Quotation #</th>
                  <th className="py-3 px-4">Customer & Company</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-blue-600 text-xs">
                      <Link href={`/quotations/${q.id}`} className="hover:underline">
                        {q.quotation_number}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900">{q.customer_name}</p>
                      {q.company_name && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          {q.company_name}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {q.quotation_date}
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
                          title="View"
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
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTargetId(q.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete"
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
