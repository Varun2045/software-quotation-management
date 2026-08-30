import { QuotationItemFormData, QuotationCalculations, ComputedItemAmounts } from './types';

/**
 * Calculates item-level and overall quotation financial metrics.
 * 
 * Formulas specified in assignment:
 * 1. Gross Amount = Quantity × Unit Price
 * 2. Discount Amount = Gross Amount × (Discount % / 100)
 * 3. Net Amount = Gross Amount - Discount Amount
 * 4. Subtotal = Sum of all Net Amounts
 * 5. GST = Subtotal × (GST % / 100)
 * 6. Grand Total = Subtotal + GST
 */
export function calculateItemAmounts(item: {
  quantity: number | string;
  unit_price: number | string;
  discount: number | string;
}): ComputedItemAmounts {
  const qty = Math.max(0, Number(item.quantity) || 0);
  const price = Math.max(0, Number(item.unit_price) || 0);
  const discountPct = Math.max(0, Math.min(100, Number(item.discount) || 0));

  const grossAmount = roundToTwo(qty * price);
  const discountAmount = roundToTwo(grossAmount * (discountPct / 100));
  const netAmount = roundToTwo(grossAmount - discountAmount);

  return {
    grossAmount,
    discountAmount,
    netAmount,
  };
}

export function calculateQuotationTotals(
  items: QuotationItemFormData[],
  gstRate: number | string = 18
): QuotationCalculations {
  const gstPct = Math.max(0, Number(gstRate) || 0);

  let totalGross = 0;
  let totalDiscount = 0;
  let subtotal = 0;

  const itemCalculations: ComputedItemAmounts[] = items.map((item) => {
    const computed = calculateItemAmounts(item);
    totalGross += computed.grossAmount;
    totalDiscount += computed.discountAmount;
    subtotal += computed.netAmount;
    return computed;
  });

  totalGross = roundToTwo(totalGross);
  totalDiscount = roundToTwo(totalDiscount);
  subtotal = roundToTwo(subtotal);

  const gst = roundToTwo(subtotal * (gstPct / 100));
  const grandTotal = roundToTwo(subtotal + gst);

  return {
    grossAmount: totalGross,
    totalDiscount,
    subtotal,
    gst,
    grandTotal,
    itemCalculations,
  };
}

/**
 * Helper to round financial numbers to 2 decimal places to prevent floating point inaccuracies
 */
export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Formats numbers into currency strings (e.g. ₹56,050.00 or $56,050.00)
 */
export function formatCurrency(amount: number | string, currencySymbol: string = '₹'): string {
  const num = Number(amount) || 0;
  return `${currencySymbol}${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Auto-generate a formatted quotation number: QT-YYYYMM-XXXX
 */
export function generateQuotationNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `QT-${year}${month}-${randomSuffix}`;
}
