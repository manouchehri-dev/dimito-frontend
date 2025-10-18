# Frontend Integration Guide - Asset Handling Updates

## 🎯 Overview

The backend now handles user-specific asset IDs dynamically. Frontend only needs to send **currency names** instead of managing `asset_type` and `asset_id` values.

## 📋 What Changed

### Before (❌ Old Way)
Frontend had to:
1. Fetch `/wallets/assets/`
2. Find the specific asset
3. Extract `asset_type`, `asset_id`, `unit`
4. Send these values to backend

### After (✅ New Way)
Frontend only needs to:
1. Fetch `/wallets/assets/` to display options
2. Let user select currency name
3. Send just the **currency name** to backend
4. Backend handles the rest securely

---

## 🔄 Updated Endpoints

### 1. Charge Wallet (`POST /presale/charge-wallet/`)

#### OLD REQUEST:
```json
{
  "asset_type": 48,
  "asset_id": "a4b37230-4275-48ce-8f3f-dee1ba55bf3e",
  "amount": 50000,
  "redirect_url": "https://dimito.ir/payment/callback",
  "purchase_intent": {
    "token_amount": 100,
    "token_symbol": "USDT",
    "asset_type": 53,
    "asset_id": "ab8acf5f-2e61-499d-aa37-f0e8ac65ea16",
    "unit": "usdt",
    "token_price_rial": 65000,
    "rial_amount": 6500000,
    "base_cost_rial": 6500000,
    "tax_amount_rial": 0,
    "tax_percent": 0,
    "slippage_percent": 0.2
  }
}
```

#### NEW REQUEST (Recommended):
```json
{
  "currency": "Yen",
  "amount": 50000,
  "redirect_url": "https://dimito.ir/payment/callback",
  "purchase_intent": {
    "currency": "USDT",
    "token_amount": 100,
    "token_symbol": "USDT",
    "token_price_rial": 65000,
    "rial_amount": 6500000,
    "base_cost_rial": 6500000,
    "tax_amount_rial": 0,
    "tax_percent": 0,
    "slippage_percent": 0.2
  }
}
```

**Changes:**
- Replace `asset_type` + `asset_id` with `currency: "Yen"`
- In `purchase_intent`: Replace `asset_type` + `asset_id` + `unit` with `currency: "USDT"`

---

### 2. Purchase Token (`POST /presale/purchase-token/`)

#### OLD REQUEST:
```json
{
  "asset_type": 53,
  "asset_id": "ab8acf5f-2e61-499d-aa37-f0e8ac65ea16",
  "unit": "usdt",
  "amount": 100,
  "rial_amount": 6500000,
  "slippage_percent": 0.2
}
```

#### NEW REQUEST (Recommended):
```json
{
  "currency": "USDT",
  "amount": 100,
  "rial_amount": 6500000,
  "slippage_percent": 0.2
}
```

**Changes:**
- Remove `asset_type`, `asset_id`, `unit`
- Add `currency: "USDT"`

---

### 3. Calculate Tax (`POST /presale/calculate-tax/`)

#### OLD REQUEST:
```json
{
  "asset_type": 53,
  "asset_id": "ab8acf5f-2e61-499d-aa37-f0e8ac65ea16",
  "amount": 100
}
```

#### NEW REQUEST (Recommended):
```json
{
  "currency": "USDT",
  "amount": 100
}
```

**Changes:**
- Remove `asset_type`, `asset_id`
- Add `currency: "USDT"`

---

## 💻 Code Examples

### React/Next.js Implementation

```typescript
// types.ts
interface Asset {
  id: string;
  wallet: string;
  asset_type: number;
  asset_id: string;
  asset_object: string;
  phone_number: string;
  change: number | null;
  chargeable: boolean;
  amount: number;
  unit: string;
  type_name: string;
  item_value: number;
  name: string;
  buy_unit_price: number;
  image: string;
}

interface ChargeWalletRequest {
  currency: string;
  amount: number;
  redirect_url?: string;
  purchase_intent?: PurchaseIntent;
}

interface PurchaseIntent {
  currency: string;
  token_amount: number;
  token_symbol: string;
  token_price_rial: number;
  rial_amount: number;
  base_cost_rial: number;
  tax_amount_rial: number;
  tax_percent: number;
  slippage_percent: number;
}

interface PurchaseTokenRequest {
  currency: string;
  amount: number;
  rial_amount: number;
  slippage_percent?: number;
}

interface CalculateTaxRequest {
  currency: string;
  amount: number;
}
```

### Fetch Available Assets (No Change)
```typescript
// api/assets.ts
export async function fetchUserAssets(accessToken: string): Promise<Asset[]> {
  const response = await fetch('http://icart.lenoway.ir/api/v1/wallets/assets/', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  const { data } = await response.json();
  return data;
}
```

### Charge Wallet (NEW)
```typescript
// api/wallet.ts
export async function chargeWallet(
  jwtToken: string,
  currencyName: string,
  amount: number,
  redirectUrl?: string,
  purchaseIntent?: PurchaseIntent
): Promise<any> {
  const response = await fetch('/api/presale/charge-wallet/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      currency: currencyName,  // ✅ Just the name!
      amount: amount,
      redirect_url: redirectUrl,
      purchase_intent: purchaseIntent
    })
  });

  return response.json();
}
```

### Purchase Token (NEW)
```typescript
// api/tokens.ts
export async function purchaseToken(
  jwtToken: string,
  currencyName: string,
  tokenAmount: number,
  rialAmount: number,
  slippagePercent: number = 0.2
): Promise<any> {
  const response = await fetch('/api/presale/purchase-token/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      currency: currencyName,  // ✅ Just the name!
      amount: tokenAmount,
      rial_amount: rialAmount,
      slippage_percent: slippagePercent
    })
  });

  return response.json();
}
```

### Calculate Tax (NEW)
```typescript
// api/tax.ts
export async function calculateTax(
  jwtToken: string,
  currencyName: string,
  amount: number
): Promise<any> {
  const response = await fetch('/api/presale/calculate-tax/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      currency: currencyName,  // ✅ Just the name!
      amount: amount
    })
  });

  return response.json();
}
```

### Complete Component Example
```typescript
// components/BuyTokens.tsx
'use client';
import { useState, useEffect } from 'react';
import { fetchUserAssets, chargeWallet, purchaseToken, calculateTax } from '@/api';

export default function BuyTokens() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [tokenAmount, setTokenAmount] = useState(0);
  const [rialAmount, setRialAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch available assets on mount
  useEffect(() => {
    const loadAssets = async () => {
      const accessToken = getAccessToken(); // Your auth function
      const data = await fetchUserAssets(accessToken);
      setAssets(data);
    };
    loadAssets();
  }, []);

  // Calculate cost when token amount changes
  useEffect(() => {
    if (selectedCurrency && tokenAmount > 0) {
      calculateCost();
    }
  }, [selectedCurrency, tokenAmount]);

  const calculateCost = async () => {
    const jwtToken = getJwtToken(); // Your auth function
    
    // Get tax info
    const taxInfo = await calculateTax(jwtToken, selectedCurrency, tokenAmount);
    
    // Calculate total
    const selectedAsset = assets.find(a => a.name === selectedCurrency);
    if (!selectedAsset) return;
    
    const baseCost = tokenAmount * selectedAsset.buy_unit_price;
    const taxAmount = taxInfo.tax_info?.value_of_tax || 0;
    const total = baseCost + taxAmount;
    
    setRialAmount(total);
  };

  const handleChargeAndBuy = async () => {
    setLoading(true);
    try {
      const jwtToken = getJwtToken();
      
      // Create purchase intent for auto-purchase after payment
      const purchaseIntent: PurchaseIntent = {
        currency: selectedCurrency,  // ✅ NEW: Just currency name
        token_amount: tokenAmount,
        token_symbol: selectedCurrency,
        token_price_rial: assets.find(a => a.name === selectedCurrency)?.buy_unit_price || 0,
        rial_amount: rialAmount,
        base_cost_rial: rialAmount,
        tax_amount_rial: 0,
        tax_percent: 0,
        slippage_percent: 0.2
      };

      // Charge wallet with purchase intent
      const result = await chargeWallet(
        jwtToken,
        'Yen',  // ✅ Currency for charging
        rialAmount,
        'https://dimito.ir/payment/callback',
        purchaseIntent
      );

      if (result.success) {
        // Redirect to payment gateway
        window.location.href = result.payment.message;
      }
    } catch (error) {
      console.error('Charge failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectPurchase = async () => {
    setLoading(true);
    try {
      const jwtToken = getJwtToken();

      // Direct purchase from existing balance
      const result = await purchaseToken(
        jwtToken,
        selectedCurrency,  // ✅ NEW: Just currency name
        tokenAmount,
        rialAmount,
        0.2
      );

      if (result.success) {
        alert(`Success! Received ${result.transaction.token_amount} tokens`);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Buy Tokens</h1>

      {/* Currency Selector */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Select Currency</label>
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Choose...</option>
          {assets.map(asset => (
            <option key={asset.id} value={asset.name}>
              {asset.name} - {asset.buy_unit_price.toLocaleString()} Rial
            </option>
          ))}
        </select>
      </div>

      {/* Token Amount */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Token Amount</label>
        <input
          type="number"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(Number(e.target.value))}
          className="w-full border p-2 rounded"
          placeholder="e.g., 100"
        />
      </div>

      {/* Cost Display */}
      {rialAmount > 0 && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="font-semibold">Total Cost: {rialAmount.toLocaleString()} Rial</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleChargeAndBuy}
          disabled={loading || !selectedCurrency || tokenAmount <= 0}
          className="w-full bg-blue-600 text-white p-3 rounded disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Charge & Buy'}
        </button>

        <button
          onClick={handleDirectPurchase}
          disabled={loading || !selectedCurrency || tokenAmount <= 0}
          className="w-full bg-green-600 text-white p-3 rounded disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Buy from Balance'}
        </button>
      </div>
    </div>
  );
}
```

---

## 🔐 Error Handling

### Invalid Currency Error
```json
{
  "error": "invalid_currency",
  "error_description": "Currency 'Euro' not found in user's assets. Available: Yen, Won, USDT"
}
```

**Handle in Frontend:**
```typescript
try {
  const result = await purchaseToken(jwt, currency, amount, rialAmount);
  if (result.error === 'invalid_currency') {
    alert(`Currency not available: ${result.error_description}`);
  }
} catch (error) {
  console.error('Purchase failed:', error);
}
```

---

## ✅ Migration Checklist

### Code Changes
- [ ] Remove `asset_type` extraction from assets
- [ ] Remove `asset_id` extraction from assets
- [ ] Remove `unit` extraction from assets (for purchases)
- [ ] Add `currency` field to charge wallet requests
- [ ] Add `currency` field to purchase token requests
- [ ] Add `currency` field to calculate tax requests
- [ ] Update `purchase_intent` to use `currency` instead of asset fields
- [ ] Update TypeScript interfaces

### Testing
- [ ] Test charge wallet with different currencies (Yen, Won, USDT)
- [ ] Test direct purchase with different currencies
- [ ] Test purchase intent flow (charge → payment → auto-purchase)
- [ ] Test tax calculation with different currencies
- [ ] Test error handling for invalid currencies
- [ ] Test with multiple user accounts (different asset IDs)

### Backward Compatibility
- [ ] Old API format still works (legacy support)
- [ ] Gradual migration is possible
- [ ] No breaking changes for existing clients

---

## 📊 Summary of Changes

| Endpoint | Field Removed | Field Added | Required |
|----------|---------------|-------------|----------|
| `/presale/charge-wallet/` | `asset_type`, `asset_id` | `currency` | Yes (or legacy fields) |
| `/presale/purchase-token/` | `asset_type`, `asset_id`, `unit` | `currency` | Yes (or legacy fields) |
| `/presale/calculate-tax/` | `asset_type`, `asset_id` | `currency` | Yes (or legacy fields) |
| `purchase_intent` object | `asset_type`, `asset_id`, `unit` | `currency` | Yes (or legacy fields) |

---

## 🎁 Benefits

1. **Simpler Frontend**: No need to manage asset mappings
2. **More Secure**: Backend validates asset ownership
3. **Real-time**: Always uses current asset IDs (no stale data)
4. **Less Error-Prone**: No risk of sending wrong asset IDs
5. **Better UX**: Just pick currency name, not complex IDs

---

## 🆘 Support

If you encounter issues:
1. Check backend logs for detailed error messages
2. Verify currency name matches exactly (case-insensitive but spelling matters)
3. Ensure user has the currency in their iCart wallet
4. Contact backend team with the full error response
