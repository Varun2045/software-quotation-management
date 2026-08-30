'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuotationForm from '@/components/QuotationForm';
import { Quotation } from '@/lib/types';
import { fetchQuotationById } from '@/lib/storage';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditQuotationPage() {
  const params = useParams();
  const id = params.id as string;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchQuotationById(id);
        setQuotation(data);
      } catch (err) {
        console.error('Failed to load quotation for edit:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-500">Loading quotation for editing...</p>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Quotation Not Found</h2>
        <p className="text-xs text-slate-500">
          Cannot edit a quotation that does not exist.
        </p>
        <Link
          href="/quotations"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quotations
        </Link>
      </div>
    );
  }

  return (
    <div>
      <QuotationForm initialData={quotation} isEditing={true} />
    </div>
  );
}
