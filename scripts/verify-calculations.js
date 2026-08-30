// Simple verification runner for business calculation logic

function roundToTwo(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function calculateItemAmounts(item) {
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

function calculateQuotationTotals(items, gstRate = 18) {
  const gstPct = Math.max(0, Number(gstRate) || 0);

  let totalGross = 0;
  let totalDiscount = 0;
  let subtotal = 0;

  const itemCalculations = items.map((item) => {
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

function runTests() {
  console.log('--- Testing Calculations against Assignment Specifications ---');

  // PDF Page 2 Example:
  // Product: Accounting Software
  // Quantity: 2
  // Unit Price: 25,000
  // Discount: 5%
  // GST: 18%
  const singleItem = {
    product_name: 'Accounting Software',
    quantity: 2,
    unit_price: 25000,
    discount: 5,
  };

  const itemRes = calculateItemAmounts(singleItem);
  console.log(`Gross Amount (Expected: 50000) => ${itemRes.grossAmount}`);
  console.log(`Discount Amount (Expected: 2500) => ${itemRes.discountAmount}`);
  console.log(`Net Amount (Expected: 47500) => ${itemRes.netAmount}`);

  if (itemRes.grossAmount !== 50000 || itemRes.discountAmount !== 2500 || itemRes.netAmount !== 47500) {
    throw new Error('Item calculation mismatch!');
  }

  const totals = calculateQuotationTotals([singleItem], 18);
  console.log(`Subtotal (Expected: 47500) => ${totals.subtotal}`);
  console.log(`GST 18% (Expected: 8550) => ${totals.gst}`);
  console.log(`Grand Total (Expected: 56050) => ${totals.grandTotal}`);

  if (totals.subtotal !== 47500 || totals.gst !== 8550 || totals.grandTotal !== 56050) {
    throw new Error('Quotation totals mismatch!');
  }

  console.log('\nSUCCESS: All technical assignment mathematical calculations match 100% with PDF specifications!');
}

runTests();
