# PoliHive Frontend Setup Guide

## Overview
This is an intuitive document processing frontend that allows users to:
- Upload multiple PDF documents with drag-and-drop
- Select processing features (merge, repaginate, 10th line numbering)
- Preview processed documents
- Pay securely via Paystack (KSH 1 per page per service)
- Download processed documents after payment verification

## Key Features Implemented

### 1. Enhanced File Upload
- **Multi-document upload** with drag-and-drop interface
- **Real PDF page counting** using pdf-lib library
- **Progress indicators** with file processing status
- **Drag-to-reorder** functionality for document sequencing
- **Visual feedback** with file size and page count display

### 2. Accurate Pricing System
- **Real-time cost calculation** based on actual page counts
- **Dynamic pricing updates** when features change
- **Transparent pricing breakdown** (pages × features × KSH 1)

### 3. Proper Paystack Integration
- **Server-side transaction initialization** for security
- **Modern @paystack/inline-js** library integration
- **Payment verification** before allowing downloads
- **Secure API endpoints** for payment processing

### 4. Enhanced UX
- **Toast notifications** for user feedback
- **Loading states** throughout the workflow
- **Error handling** with clear messaging
- **Responsive design** with clean UI

## Setup Instructions

### 1. Environment Configuration
Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required environment variables:
```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Backend API URL
NEXT_PUBLIC_API_URL=https://web-production-fb32b.up.railway.app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

## Paystack Setup

### 1. Get API Keys
1. Visit [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to Settings → API Keys & Webhooks
3. Copy your Test/Live Public and Secret keys

### 2. Configure Webhook (Optional)
Set up webhook URL for payment notifications:
- URL: `https://your-domain.com/api/webhooks/paystack`
- Events: `charge.success`, `charge.failed`

## Workflow Testing

### 1. Document Upload Test
1. Upload multiple PDF files
2. Verify page counts are accurate
3. Test drag-to-reorder functionality
4. Remove files and verify list updates

### 2. Processing Test
1. Select different feature combinations
2. Verify pricing updates in real-time
3. Process documents and check preview
4. Verify backend integration works

### 3. Payment Test
1. Use Paystack test cards:
   - Success: `4084084084084081`
   - Decline: `4084084084084084`
2. Test payment flow completion
3. Verify download becomes available
4. Test payment cancellation

## Performance Optimizations

### 1. File Processing
- **Parallel processing** of file encoding and page counting
- **Progress feedback** during multi-file uploads
- **Error recovery** with user-friendly messages

### 2. Payment Integration
- **Secure initialization** on server-side
- **Proper verification** before downloads
- **Loading states** during payment process

### 3. User Experience
- **Toast notifications** for immediate feedback
- **Responsive design** for all screen sizes
- **Keyboard accessibility** support

## Troubleshooting

### Common Issues

1. **PDF Page Counting Fails**
   - Check if PDF is corrupted
   - Verify pdf-lib can parse the file
   - Default fallback is 1 page

2. **Payment Initialization Fails**
   - Verify Paystack secret key is correct
   - Check API endpoint connectivity
   - Ensure amount is in kobo (multiply by 100)

3. **Upload Progress Stuck**
   - Check file size limits
   - Verify network connectivity
   - Clear browser cache

### Debug Tips
- Check browser console for errors
- Monitor network requests in DevTools
- Verify environment variables are loaded
- Test with smaller PDF files first

## API Endpoints

### Payment Endpoints
- `POST /api/payments/initialize` - Initialize Paystack transaction
- `GET /api/payments/verify/[reference]` - Verify payment status

### Document Processing
- Uses existing backend at `NEXT_PUBLIC_API_URL`
- Endpoint: `POST /api/process`

## Security Considerations

1. **API Keys**: Never expose secret keys in frontend
2. **Payment Verification**: Always verify on server-side
3. **File Upload**: Validate file types and sizes
4. **CORS**: Configure backend CORS for your domain

## Next Steps

1. Set up proper environment variables
2. Test with real Paystack account
3. Configure production domain
4. Set up monitoring and analytics
5. Add file size limits if needed

This implementation provides a complete, production-ready document processing workflow with secure payment integration.