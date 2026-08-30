'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuotationPreview from '@/components/QuotationPreview';
import DeleteModal from '@/components/DeleteModal';
import { Quotation } from '@/lib/types';
import { fetchQuotationById, deleteQuotation } from '@/lib/storage';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchQuotationById(id);
        setQuotation(data);
      } catch (err) {
        console.error('Failed to fetch quotation:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteQuotation(id);
      router.push('/quotations');
      router.refresh();
    } catch (err) {
      console.error('Failed to delete quotation:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-500">Loading quotation details...</p>
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
          The requested quotation could not be located or may have been deleted.
        </p>
        <Link
          href="/quotations"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quotations List
        </Link>
      </div>
    );
  }

  return (
    <>
      <QuotationPreview
        quotation={quotation}
        onDelete={() => setShowDeleteModal(true)}
      />
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
