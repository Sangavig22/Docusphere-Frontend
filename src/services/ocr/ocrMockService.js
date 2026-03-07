const SUMMARY_VARIANTS = [
  "Invoice for $19,964 from DocuFlow Solutions Inc. includes enterprise licensing, support services, and tax, due on January 10, 2025.",
  "The extracted invoice lists annual enterprise licensing as the main line item, plus support and integrations under net-30 payment terms.",
  "OCR captured billing details for an enterprise subscription with a total payable amount of $19,964.00 and bank transfer instructions.",
];

export const OCR_STEPS = ["OCR Processing", "Extracting Text", "Validating Data"];

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function formatSizeLabel(bytes = 0) {
  if (!bytes) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function simulateUpload({ onProgress, isCancelled }) {
  let value = 0;
  while (value < 100) {
    if (isCancelled?.()) throw new Error("UPLOAD_CANCELLED");
    await wait(180);
    value = Math.min(100, value + Math.floor(Math.random() * 12) + 9);
    onProgress?.(value);
  }
}

export async function simulateProcessing({ onStepChange, isCancelled }) {
  onStepChange?.(0);
  await wait(900);
  if (isCancelled?.()) throw new Error("PROCESS_CANCELLED");

  onStepChange?.(1);
  await wait(1500);
  if (isCancelled?.()) throw new Error("PROCESS_CANCELLED");

  onStepChange?.(2);
  await wait(1300);
  if (isCancelled?.()) throw new Error("PROCESS_CANCELLED");
}

export function buildMockResult(file) {
  return {
    id: "doc_1",
    fileName: file?.name || "Invoice_Jan_2025.pdf",
    sizeLabel: formatSizeLabel(file?.size),
    status: "success",
    extractedText:
      "DocuFlow Solutions Inc.\nInvoice #INV-2025-001\nDate: December 10, 2024\nBill To: Acme Corporation\nAnnual enterprise license and support services.\nDue Date: January 10, 2025.",
    keyPoints: [
      "Invoice Total: $19,964.00 (including 8.5% tax)",
      "Due Date: January 10, 2025 (Net 30 terms)",
      "Main Item: Enterprise License at $12,000/year",
      "Additional Services: Support, integrations",
      "Payment Method: Bank Transfer",
    ],
    summary:
      "Invoice for $19,964 from DocuFlow Solutions Inc. includes enterprise licensing, support services, and tax, due on January 10, 2025.",
    title: file?.name || "invoice_scan.pdf",
    description: "Scanned invoice document",
    tags: ["Invoice", "Financial"],
  };
}

export async function regenerateSummaryMock() {
  await wait(1200);
  return SUMMARY_VARIANTS[Math.floor(Math.random() * SUMMARY_VARIANTS.length)];
}
