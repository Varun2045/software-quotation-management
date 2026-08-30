export interface QuotationItem {
  id?: string;
  quotation_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number; // Discount percentage (0-100)
  amount: number;   // Net amount after discount
  created_at?: string;
}

export interface Quotation {
  id: string;
  user_id?: string | null;
  quotation_number: string;
  customer_name: string;
  company_name?: string | null;
  email: string;
  phone?: string | null;
  quotation_date: string;
  valid_until?: string | null;
  gst_rate: number;
  subtotal: number;
  gst: number;
  total: number;
  status?: 'draft' | 'sent' | 'approved' | 'rejected';
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  quotation_items?: QuotationItem[];
}

export interface QuotationFormData {
  customer_name: string;
  company_name: string;
  email: string;
  phone: string;
  quotation_number: string;
  quotation_date: string;
  valid_until: string;
  gst_rate: number;
  notes: string;
  items: QuotationItemFormData[];
}

export interface QuotationItemFormData {
  id?: string;
  product_name: string;
  quantity: number | string;
  unit_price: number | string;
  discount: number | string;
}

export interface ComputedItemAmounts {
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
}

export interface QuotationCalculations {
  grossAmount: number;
  totalDiscount: number;
  subtotal: number;
  gst: number;
  grandTotal: number;
  itemCalculations: ComputedItemAmounts[];
}

export interface DashboardStats {
  totalQuotations: number;
  totalRevenue: number;
  averageQuotationValue: number;
  activeThisMonth: number;
}
