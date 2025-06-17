declare module '@paystack/inline-js' {
  interface PaystackOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    metadata?: Record<string, any>;
    onSuccess: (transaction: any) => void;
    onCancel?: () => void;
    onClose?: () => void;
  }

  interface PaystackResponse {
    reference: string;
    status: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
      phone?: string;
    };
    metadata?: Record<string, any>;
  }

  class PaystackPop {
    constructor();
    newTransaction(options: PaystackOptions): void;
    resumeTransaction(accessCode: string): void;
  }

  export default PaystackPop;
}