'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Calculator, 
  Building, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  AlertCircle,
  FileText,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { Quotation, QuotationFormData, QuotationItemFormData } from '@/lib/types';
import { calculateQuotationTotals, formatCurrency, generateQuotationNumber } from '@/lib/calculations';
import { saveQuotation } from '@/lib/storage';

interface QuotationFormProps {
  initialData?: Quotation | null;
  isEditing?: boolean;
}

export default function QuotationForm({ initialData, isEditing = false }: QuotationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<QuotationFormData>({
    customer_name: '',
    company_name: '',
    email: '',
    phone: '',
    quotation_number: generateQuotationNumber(),
    quotation_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    gst_rate: 18,
    notes: 'Payment terms: 50% advance upon confirmation, 50% on project milestone delivery.',
    items: [
      {
        product_name: 'Accounting Software Enterprise License',
        quantity: 2,
        unit_price: 25000,
        discount: 5,
      },
    ],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        customer_name: initialData.customer_name || '',
        company_name: initialData.company_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        quotation_number: initialData.quotation_number || generateQuotationNumber(),
        quotation_date: initialData.quotation_date || new Date().toISOString().split('T')[0],
        valid_until: initialData.valid_until || '',
        gst_rate: initialData.gst_rate ?? 18,
        notes: initialData.notes || '',
        items: initialData.quotation_items && initialData.quotation_items.length > 0
          ? initialData.quotation_items.map((i) => ({
              id: i.id,
              product_name: i.product_name,
              quantity: i.quantity,
              unit_price: i.unit_price,
              discount: i.discount,
            }))
          : [
              {
                product_name: '',
                quantity: 1,
                unit_price: 0,
                discount: 0,
              },
            ],
      });
    }
  }, [initialData]);

  // Live recalculations
  const calculations = calculateQuotationTotals(formData.items, formData.gst_rate);

  // Field change handlers
  const handleGeneralChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleItemChange = (index: number, field: keyof QuotationItemFormData, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, items: updatedItems }));

    const itemErrKey = `item_${index}_${field}`;
    if (formErrors[itemErrKey]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[itemErrKey];
        return next;
      });
    }
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_name: '',
          quantity: 1,
          unit_price: 0,
          discount: 0,
        },
      ],
    }));
  };

  const removeItemRow = (index: number) => {
    if (formData.items.length <= 1) {
      setFormErrors((prev) => ({
        ...prev,
        items: 'At least one product or service row is required.',
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  // Validation function
  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.customer_name.trim()) {
      errors.customer_name = 'Customer Name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!formData.quotation_date) {
      errors.quotation_date = 'Quotation date is required.';
    }

    if (!formData.quotation_number.trim()) {
      errors.quotation_number = 'Quotation number is required.';
    }

    if (!formData.items || formData.items.length === 0) {
      errors.items = 'At least one product/service is required.';
    } else {
      formData.items.forEach((item, idx) => {
        if (!item.product_name.trim()) {
          errors[`item_${idx}_product_name`] = 'Product name is required.';
        }
        const qty = Number(item.quantity);
        if (isNaN(qty) || qty <= 0) {
          errors[`item_${idx}_quantity`] = 'Quantity must be greater than 0.';
        }
        const price = Number(item.unit_price);
        if (isNaN(price) || price < 0) {
          errors[`item_${idx}_unit_price`] = 'Price cannot be negative.';
        }
        const disc = Number(item.discount);
        if (isNaN(disc) || disc < 0 || disc > 100) {
          errors[`item_${idx}_discount`] = 'Discount must be between 0% and 100%.';
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveQuotation(formData, initialData?.id);
      if (result.success && result.data) {
        setSuccessMessage(isEditing ? 'Quotation updated successfully!' : 'Quotation saved successfully!');
        setTimeout(() => {
          router.push(`/quotations/${result.data?.id}`);
          router.refresh();
        }, 800);
      } else {
        setFormErrors({ submit: result.error || 'Failed to save quotation. Please try again.' });
      }
    } catch (err: any) {
      setFormErrors({ submit: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {isEditing ? 'Edit Quotation' : 'Create New Quotation'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fill in the customer, quotation information, and line items with automatic financial calculations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/quotations')}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 active:scale-[0.98] transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditing ? 'Update Quotation' : 'Save Quotation'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {formErrors.submit && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-medium">{formErrors.submit}</span>
        </div>
      )}

      {/* Grid: Customer Info & Quotation Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Customer Information</h2>
              <p className="text-xs text-slate-500">Contact and client identification details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleGeneralChange}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    formErrors.customer_name
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                  } focus:outline-none focus:ring-4 transition-all`}
                />
              </div>
              {formErrors.customer_name && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.customer_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Company Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleGeneralChange}
                  placeholder="e.g. Acme Corp Technologies"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleGeneralChange}
                    placeholder="name@company.com"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                      formErrors.email
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                    } focus:outline-none focus:ring-4 transition-all`}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleGeneralChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quotation Information Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Quotation Information</h2>
              <p className="text-xs text-slate-500">Document dates, reference, and tax parameters</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Quotation Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="quotation_number"
                value={formData.quotation_number}
                onChange={handleGeneralChange}
                placeholder="QT-2026-001"
                className={`w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border ${
                  formErrors.quotation_number
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                } focus:outline-none focus:ring-4 transition-all`}
              />
              {formErrors.quotation_number && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.quotation_number}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quotation Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="quotation_date"
                  value={formData.quotation_date}
                  onChange={handleGeneralChange}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    formErrors.quotation_date
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                  } focus:outline-none focus:ring-4 transition-all`}
                />
                {formErrors.quotation_date && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.quotation_date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Valid Until
                </label>
                <input
                  type="date"
                  name="valid_until"
                  value={formData.valid_until}
                  onChange={handleGeneralChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                GST Rate (%)
              </label>
              <select
                name="gst_rate"
                value={formData.gst_rate}
                onChange={handleGeneralChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all bg-white"
              >
                <option value="18">18% (Standard Software / GST)</option>
                <option value="12">12% (IT Hardware / Services)</option>
                <option value="5">5% (Concessional)</option>
                <option value="0">0% (Exempted / Export)</option>
                <option value="28">28% (Special Goods)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product / Service Line Items Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Product / Service Information</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {formData.items.length} {formData.items.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Add products or services. Calculations update instantly as quantity, price, or discount change.
            </p>
          </div>

          <button
            type="button"
            onClick={addItemRow}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Product Row
          </button>
        </div>

        {formErrors.items && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {formErrors.items}
          </div>
        )}

        {/* Dynamic Items Table / Responsive Cards */}
        <div className="space-y-4">
          <div className="hidden lg:grid lg:grid-cols-12 gap-3 text-xs font-bold text-slate-600 uppercase tracking-wider px-3 pb-2 border-b border-slate-100">
            <div className="col-span-4">Product / Service Name <span className="text-rose-500">*</span></div>
            <div className="col-span-2">Quantity <span className="text-rose-500">*</span></div>
            <div className="col-span-2">Unit Price (₹) <span className="text-rose-500">*</span></div>
            <div className="col-span-1">Disc %</div>
            <div className="col-span-2 text-right">Net Amount</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {formData.items.map((item, index) => {
            const itemCalc = calculations.itemCalculations[index] || { grossAmount: 0, discountAmount: 0, netAmount: 0 };
            return (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-3 lg:items-center"
              >
                {/* Product Name */}
                <div className="lg:col-span-4">
                  <label className="block text-xs font-semibold text-slate-600 lg:hidden mb-1">
                    Product / Service Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.product_name}
                    onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                    placeholder="e.g. Cloud Hosting & Migration"
                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-white ${
                      formErrors[`item_${index}_product_name`]
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                    } focus:outline-none focus:ring-2`}
                  />
                  {formErrors[`item_${index}_product_name`] && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {formErrors[`item_${index}_product_name`]}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 lg:hidden mb-1">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-white ${
                      formErrors[`item_${index}_quantity`]
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                    } focus:outline-none focus:ring-2`}
                  />
                  {formErrors[`item_${index}_quantity`] && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {formErrors[`item_${index}_quantity`]}
                    </p>
                  )}
                </div>

                {/* Unit Price */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 lg:hidden mb-1">
                    Unit Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                      className={`w-full pl-7 pr-3 py-2 text-sm rounded-lg border bg-white ${
                        formErrors[`item_${index}_unit_price`]
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                      } focus:outline-none focus:ring-2`}
                    />
                  </div>
                  {formErrors[`item_${index}_unit_price`] && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {formErrors[`item_${index}_unit_price`]}
                    </p>
                  )}
                </div>

                {/* Discount % */}
                <div className="lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 lg:hidden mb-1">
                    Discount %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={item.discount}
                      onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                      className={`w-full px-2 py-2 text-sm rounded-lg border bg-white ${
                        formErrors[`item_${index}_discount`]
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                      } focus:outline-none focus:ring-2`}
                    />
                  </div>
                  {formErrors[`item_${index}_discount`] && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {formErrors[`item_${index}_discount`]}
                    </p>
                  )}
                </div>

                {/* Net Amount Display */}
                <div className="lg:col-span-2 lg:text-right flex items-center justify-between lg:justify-end">
                  <span className="text-xs text-slate-500 lg:hidden">Net Amount:</span>
                  <div>
                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency(itemCalc.netAmount)}
                    </span>
                    {itemCalc.discountAmount > 0 && (
                      <span className="block text-[11px] text-emerald-600">
                        Saved {formatCurrency(itemCalc.discountAmount)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action: Delete */}
                <div className="lg:col-span-1 flex justify-end lg:justify-center pt-2 lg:pt-0 border-t border-slate-200/60 lg:border-t-0">
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    disabled={formData.items.length <= 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Row Button (bottom) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={addItemRow}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Another Product / Service
          </button>
        </div>
      </div>

      {/* Bottom Section: Notes & Automatic Calculation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Notes & Terms */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Notes, Terms & Conditions
          </h3>
          <textarea
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleGeneralChange}
            placeholder="Add payment terms, deliverables, warranty or special instructions..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all resize-y"
          />
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-800 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              Automated Business Logic:
            </p>
            <p>• Gross = Quantity × Unit Price</p>
            <p>• Discount Amount = Gross × (Discount %)</p>
            <p>• Net Amount = Gross - Discount Amount</p>
            <p>• GST = Subtotal × {formData.gst_rate}%</p>
            <p>• Grand Total = Subtotal + GST</p>
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl space-y-5">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400 border-b border-slate-700 pb-3 flex items-center justify-between">
            <span>Calculation Summary</span>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
              Live Total
            </span>
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Gross Amount:</span>
              <span className="font-mono font-medium">{formatCurrency(calculations.grossAmount)}</span>
            </div>

            {calculations.totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Total Discount:</span>
                <span className="font-mono font-medium">- {formatCurrency(calculations.totalDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-200 border-t border-slate-700/60 pt-2 font-medium">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrency(calculations.subtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span>GST ({formData.gst_rate}%):</span>
              <span className="font-mono font-medium">+ {formatCurrency(calculations.gst)}</span>
            </div>

            <div className="border-t border-slate-700 pt-3 flex justify-between items-baseline">
              <div>
                <span className="text-base font-bold text-white block">Grand Total:</span>
                <span className="text-[11px] text-slate-400 font-normal">Inclusive of all taxes</span>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono tracking-tight">
                {formatCurrency(calculations.grandTotal)}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isEditing ? 'Save Changes' : 'Save & Generate Quotation'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
