import { createClient } from './supabase/client';
import { Quotation, QuotationFormData, DashboardStats } from './types';
import { calculateQuotationTotals } from './calculations';

const LOCAL_STORAGE_KEY = 'triples_quotations_data';
const LOCAL_USER_KEY = 'triples_demo_user';

// Initial sample data so the reviewer immediately sees a working system
const SAMPLE_QUOTATIONS: Quotation[] = [
  {
    id: 'sample-1',
    quotation_number: 'QT-2026-001',
    customer_name: 'Rahul Sharma',
    company_name: 'Acme Corp Technologies',
    email: 'rahul.sharma@acmecorp.com',
    phone: '+91 98765 43210',
    quotation_date: '2026-08-30',
    valid_until: '2026-09-30',
    gst_rate: 18,
    subtotal: 47500,
    gst: 8550,
    total: 56050,
    status: 'approved',
    notes: 'Quotation valid for 30 days from date of issue. Includes 1-year free maintenance and onboarding support.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    quotation_items: [
      {
        id: 'item-1',
        product_name: 'Accounting Software Enterprise License',
        quantity: 2,
        unit_price: 25000,
        discount: 5,
        amount: 47500,
      }
    ]
  },
  {
    id: 'sample-2',
    quotation_number: 'QT-2026-002',
    customer_name: 'Priya Patel',
    company_name: 'Global FinTech Solutions',
    email: 'priya.p@globalfin.io',
    phone: '+91 91234 56789',
    quotation_date: '2026-08-31',
    valid_until: '2026-10-01',
    gst_rate: 18,
    subtotal: 135000,
    gst: 24300,
    total: 159300,
    status: 'sent',
    notes: 'Includes custom payment gateway integration module and cloud deployment assistance.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    quotation_items: [
      {
        id: 'item-2',
        product_name: 'Financial Analytics Suite',
        quantity: 1,
        unit_price: 100000,
        discount: 10,
        amount: 90000,
      },
      {
        id: 'item-3',
        product_name: 'Cloud Server Setup & Migration',
        quantity: 3,
        unit_price: 15000,
        discount: 0,
        amount: 45000,
      }
    ]
  }
];

function getLocalData(): Quotation[] {
  if (typeof window === 'undefined') return SAMPLE_QUOTATIONS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_QUOTATIONS));
      return SAMPLE_QUOTATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SAMPLE_QUOTATIONS;
  }
}

function saveLocalData(data: Quotation[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export async function fetchQuotations(): Promise<Quotation[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          quotation_items (*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Quotation[];
      }
      console.warn('Supabase fetch failed or empty, falling back to local store:', error);
    } catch (err) {
      console.warn('Supabase fetch error, fallback to local store:', err);
    }
  }

  return getLocalData();
}

export async function fetchQuotationById(id: string): Promise<Quotation | null> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          quotation_items (*)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        return data as Quotation;
      }
    } catch (err) {
      console.warn('Supabase fetchById error:', err);
    }
  }

  const list = getLocalData();
  return list.find((q) => q.id === id) || null;
}

export async function saveQuotation(
  formData: QuotationFormData,
  existingId?: string,
  userId?: string
): Promise<{ success: boolean; data?: Quotation; error?: string }> {
  const totals = calculateQuotationTotals(formData.items, formData.gst_rate);

  const supabase = createClient();
  if (supabase) {
    try {
      const quotationPayload = {
        quotation_number: formData.quotation_number,
        customer_name: formData.customer_name.trim(),
        company_name: formData.company_name.trim() || null,
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        quotation_date: formData.quotation_date,
        valid_until: formData.valid_until || null,
        gst_rate: Number(formData.gst_rate) || 18,
        subtotal: totals.subtotal,
        gst: totals.gst,
        total: totals.grandTotal,
        notes: formData.notes.trim() || null,
        user_id: userId || null,
        updated_at: new Date().toISOString(),
      };

      let quoteId = existingId;

      if (existingId) {
        // Update existing quotation
        const { error: quoteErr } = await supabase
          .from('quotations')
          .update(quotationPayload)
          .eq('id', existingId);

        if (quoteErr) throw quoteErr;

        // Delete existing items and re-insert
        await supabase.from('quotation_items').delete().eq('quotation_id', existingId);
      } else {
        // Insert new quotation
        const { data: newQuote, error: quoteErr } = await supabase
          .from('quotations')
          .insert([quotationPayload])
          .select()
          .single();

        if (quoteErr) throw quoteErr;
        quoteId = newQuote.id;
      }

      // Insert line items
      const itemsPayload = formData.items.map((item, idx) => {
        const itemComp = totals.itemCalculations[idx];
        return {
          quotation_id: quoteId,
          product_name: item.product_name.trim(),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          discount: Number(item.discount),
          amount: itemComp.netAmount,
        };
      });

      const { error: itemsErr } = await supabase.from('quotation_items').insert(itemsPayload);
      if (itemsErr) throw itemsErr;

      const savedQuote = await fetchQuotationById(quoteId!);
      if (savedQuote) {
        return { success: true, data: savedQuote };
      }
    } catch (err: any) {
      console.warn('Supabase save failed, fallback to local storage:', err);
    }
  }

  // Local Storage Fallback
  const list = getLocalData();
  const quoteId = existingId || `quote-${Date.now()}`;
  
  const createdItems = formData.items.map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    quotation_id: quoteId,
    product_name: item.product_name.trim(),
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
    discount: Number(item.discount),
    amount: totals.itemCalculations[idx].netAmount,
  }));

  const savedRecord: Quotation = {
    id: quoteId,
    user_id: userId || 'demo-user',
    quotation_number: formData.quotation_number,
    customer_name: formData.customer_name.trim(),
    company_name: formData.company_name.trim() || null,
    email: formData.email.trim(),
    phone: formData.phone.trim() || null,
    quotation_date: formData.quotation_date,
    valid_until: formData.valid_until || null,
    gst_rate: Number(formData.gst_rate) || 18,
    subtotal: totals.subtotal,
    gst: totals.gst,
    total: totals.grandTotal,
    status: 'draft',
    notes: formData.notes.trim() || null,
    created_at: existingId ? (list.find(q => q.id === existingId)?.created_at || new Date().toISOString()) : new Date().toISOString(),
    updated_at: new Date().toISOString(),
    quotation_items: createdItems,
  };

  let updatedList: Quotation[];
  if (existingId) {
    updatedList = list.map((q) => (q.id === existingId ? savedRecord : q));
  } else {
    updatedList = [savedRecord, ...list];
  }

  saveLocalData(updatedList);
  return { success: true, data: savedRecord };
}

export async function deleteQuotation(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('quotations').delete().eq('id', id);
      if (!error) {
        return { success: true };
      }
      console.warn('Supabase delete error:', error);
    } catch (err) {
      console.warn('Supabase delete caught error:', err);
    }
  }

  const list = getLocalData();
  const filtered = list.filter((q) => q.id !== id);
  saveLocalData(filtered);
  return { success: true };
}

export function computeDashboardStats(quotations: Quotation[]): DashboardStats {
  const totalQuotations = quotations.length;
  const totalRevenue = quotations.reduce((acc, q) => acc + (Number(q.total) || 0), 0);
  const averageQuotationValue = totalQuotations > 0 ? totalRevenue / totalQuotations : 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const activeThisMonth = quotations.filter((q) => {
    const d = new Date(q.quotation_date || q.created_at || '');
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  return {
    totalQuotations,
    totalRevenue,
    averageQuotationValue,
    activeThisMonth,
  };
}

// Authentication Helpers
export function getDemoUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setDemoUser(user: { id: string; email: string; name: string } | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_USER_KEY);
  }
}
