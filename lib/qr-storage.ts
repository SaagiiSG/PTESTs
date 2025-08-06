// Simple in-memory storage for QR data
const qrDataStorage = new Map<string, any>();

export function storeQRData(invoiceId: string, qrData: any) {
  qrDataStorage.set(invoiceId, qrData);
  console.log('QR data stored for invoice:', invoiceId);
}

export function getQRData(invoiceId: string) {
  const qrData = qrDataStorage.get(invoiceId);
  if (qrData) {
    console.log('QR data retrieved for invoice:', invoiceId);
  } else {
    console.log('No QR data found for invoice:', invoiceId);
  }
  return qrData;
}

export function removeQRData(invoiceId: string) {
  qrDataStorage.delete(invoiceId);
  console.log('QR data removed for invoice:', invoiceId);
} 