import axiosInstance from './axiosInstance';

// Get all invoices
export const getInvoices = async () => {
  try {
    const response = await axiosInstance.get('/invoices');
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch invoices" };
  }
};

// Get invoice by ID
export const getInvoiceById = async (id) => {
  try {
    const response = await axiosInstance.get(`/invoices/${id}`);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch invoice" };
  }
};

// Create a new invoice
export const createInvoice = async (invoiceData) => {
  try {
    const response = await axiosInstance.post('/invoices', invoiceData);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create invoice" };
  }
};

// Update invoice
export const updateInvoice = async (id, invoiceData) => {
  try {
    const response = await axiosInstance.patch(`/invoices/${id}`, invoiceData);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update invoice" };
  }
};

// Mark invoice as paid
export const payInvoice = async (
  id,
  amount,
  paymentMode,
  paymentReference,
  paymentTerminalId
) => {
  try {
    const response = await axiosInstance.patch(`/invoices/${id}/pay`, {
      amount,
      paymentMode,
      paymentReference,
      paymentTerminalId,
    });

    return response;
  } catch (error) {
    throw error || { message: "Failed to update invoice payment" };
  }
};