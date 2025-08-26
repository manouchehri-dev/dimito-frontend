# 📊 User Dashboard API Documentation

## 🎯 Overview

This document provides complete API specifications for building a user dashboard that displays:

1. **💰 Token Holdings** - What tokens the user owns from presale purchases
2. **📋 Presale Participation** - Which presales the user has participated in
3. **📈 Recent Transactions** - Transaction history for each token
4. **📊 Portfolio Overview** - Summary statistics and recent activity

---

## 🚀 Base URL

```
https://yourdomain.com/api/presale/
```

---

## 🔗 Core Dashboard Endpoints

### 1. 📊 Complete Dashboard Overview

**Endpoint:** `GET /user/{wallet_address}/dashboard/`

**Purpose:** Main dashboard with overview stats, token holdings summary, and recent activity

**Example Response:**

```json
{
  "success": true,
  "message": "Dashboard data for user 0xF0CAdd...",
  "data": {
    "user_address": "0xF0CAdd1b3aEb569d4A4bDe9056FD8CA4826041FE",
    "overview": {
      "total_presales_participated": 3,
      "total_purchases": 6,
      "verified_purchases": 5,
      "total_spent": 2850.5,
      "verification_rate": 83.3,
      "tokens_held": 3
    },
    "token_holdings_summary": [
      {
        "token": {
          "token_name": "Bitcoin Mining Token",
          "token_symbol": "BMT",
          "token_address": "0x1234567890abcdef1234567890abcdef12345678"
        },
        "total_amount": 1500.5,
        "total_spent": 750.25
      }
    ],
    "recent_activity": [
      {
        "presale_id": 2,
        "token_symbol": "BMT",
        "amount_purchased": 500.0,
        "amount_spent": 250.0,
        "is_verified": true,
        "purchase_date": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

### 2. 💰 Detailed Token Holdings

**Endpoint:** `GET /user/{wallet_address}/holdings/`

**Purpose:** Detailed token portfolio with recent transactions for each token

**Example Response:**

```json
{
  "success": true,
  "message": "Token portfolio for user 0xF0CAdd...",
  "data": {
    "user_address": "0xF0CAdd1b3aEb569d4A4bDe9056FD8CA4826041FE",
    "portfolio_summary": {
      "total_tokens_types": 3,
      "total_portfolio_value": 2850.5,
      "total_verified_purchases": 5
    },
    "token_holdings": [
      {
        "token": {
          "id": 1,
          "token_name": "Bitcoin Mining Token",
          "token_symbol": "BMT",
          "token_address": "0x1234567890abcdef1234567890abcdef12345678",
          "token_decimals": 18,
          "token_description": "Token for Bitcoin mining operations"
        },
        "holdings": {
          "total_amount": 1500.5,
          "total_spent": 750.25,
          "average_price_paid": 0.499833,
          "presales_participated": 2,
          "total_transactions": 2
        },
        "recent_transactions": [
          {
            "transaction_id": 1,
            "presale_id": 2,
            "presale_name": "Bitcoin Mining Token presale - Active mining token offering",
            "amount_purchased": 500.0,
            "amount_spent": 250.0,
            "price_paid": 0.5,
            "purchase_date": "2024-01-15T10:30:00Z",
            "is_verified": true,
            "transaction_status": "Verified",
            "payment_token": {
              "symbol": "USDC",
              "name": "USD Coin",
              "address": "0xa0b86991c431e69d38a7f5c7d8b05e8c8a2f7b4b8"
            }
          }
        ]
      }
    ]
  }
}
```

---

### 3. 📋 Presale Participation

**Endpoint:** `GET /user/{wallet_address}/presales/`

**Purpose:** All presales user participated in + token holdings summary

**Example Response:**

```json
{
  "success": true,
  "message": "Found 3 presales for user 0xF0CAdd1b3aEb569d4A4bDe9056FD8CA4826041FE",
  "data": {
    "user_address": "0xF0CAdd1b3aEb569d4A4bDe9056FD8CA4826041FE",
    "total_presales": 3,
    "presales": [
      {
        "id": 1,
        "presale_id": 1,
        "start_time": "2024-01-01T00:00:00Z",
        "end_time": "2024-01-31T23:59:59Z",
        "mine_token": {
          "token_name": "Bitcoin Mining Token",
          "token_symbol": "BMT",
          "token_address": "0x1234567890abcdef1234567890abcdef12345678"
        },
        "payment_token": {
          "token_name": "USD Coin",
          "token_symbol": "USDC",
          "token_address": "0xa0b86991c431e69d38a7f5c7d8b05e8c8a2f7b4b8"
        },
        "price_per_token": "0.500000000000000000",
        "total_supply": "5000000.000000000000000000",
        "total_sold": "2500000.000000000000000000",
        "is_active": false,
        "description": "Bitcoin Mining Token presale - Past mining token offering",
        "purchase_amount_payment_token": "1000.000000000000000000",
        "purchase_amount_presale_token": "2000.000000000000000000",
        "purchase_date": "2024-01-15T10:30:00Z",
        "purchase_verified": true
      }
    ],
    "token_holdings": [
      {
        "token": {
          "id": 1,
          "token_name": "Bitcoin Mining Token",
          "token_symbol": "BMT",
          "token_address": "0x1234567890abcdef1234567890abcdef12345678",
          "token_decimals": 18,
          "token_description": "Token for Bitcoin mining operations"
        },
        "total_amount": 1500.5,
        "total_spent": 750.25,
        "purchase_count": 2,
        "average_price": 0.499833
      }
    ]
  }
}
```

---

### 4. 📈 Specific Token Transaction History

**Endpoint:** `GET /user/{wallet_address}/token/{token_symbol}/transactions/`

**Purpose:** All transactions for a specific token

**Example:** `/user/0xF0CAdd.../token/BMT/transactions/`

**Example Response:**

```json
{
  "success": true,
  "message": "Found 2 transactions for BMT",
  "data": {
    "user_address": "0xF0CAdd1b3aEb569d4A4bDe9056FD8CA4826041FE",
    "token": {
      "id": 1,
      "token_name": "Bitcoin Mining Token",
      "token_symbol": "BMT",
      "token_address": "0x1234567890abcdef1234567890abcdef12345678",
      "token_decimals": 18,
      "token_description": "Token for Bitcoin mining operations"
    },
    "summary": {
      "total_transactions": 2,
      "verified_transactions": 2,
      "total_amount_held": 1500.5,
      "total_spent": 750.25,
      "average_price": 0.499833,
      "first_purchase": "2024-01-10T08:15:00Z",
      "last_purchase": "2024-01-15T10:30:00Z"
    },
    "transactions": [
      {
        "transaction_id": 2,
        "presale_id": 2,
        "presale_name": "Bitcoin Mining Token presale - Active mining token offering",
        "amount_purchased": 500.0,
        "amount_spent": 250.0,
        "price_paid": 0.5,
        "purchase_date": "2024-01-15T10:30:00Z",
        "is_verified": true,
        "transaction_status": "Verified",
        "payment_token": {
          "symbol": "USDC",
          "name": "USD Coin",
          "address": "0xa0b86991c431e69d38a7f5c7d8b05e8c8a2f7b4b8"
        },
        "presale_info": {
          "start_time": "2024-01-05T00:00:00Z",
          "end_time": "2024-02-05T23:59:59Z",
          "price_per_token": 0.5,
          "is_active": true
        }
      }
    ]
  }
}
```

---

### 5. 📊 User Statistics Summary

**Endpoint:** `GET /user/{wallet_address}/summary/`

**Purpose:** Participation and financial statistics

**Example Response:**

```json
{
  "success": true,
  "message": "Presale participation summary for user 0xF0CAdd1b3aEb569d4A4bDe9056FD8CA4826041FE",
  "data": {
    "user_address": "0xF0CAdd1b3aEb569d4A4bDe9056FD8CA4826041FE",
    "participation_stats": {
      "total_purchases": 6,
      "verified_purchases": 5,
      "unique_presales_participated": 3,
      "verification_rate": 83.33
    },
    "financial_stats": {
      "total_spent_payment_tokens": 2850.5,
      "total_tokens_acquired": 4500.75,
      "unique_tokens_held": 3,
      "average_spent_per_presale": 950.17
    }
  }
}
```

---

### 6. 📋 All User Transactions (with filters)

**Endpoint:** `GET /user/{wallet_address}/transactions/`

**Query Parameters:**

- `limit` (default: 20) - Number of transactions to return
- `token` - Filter by token symbol (e.g., `BMT`)
- `verified_only` - Only show verified transactions (`true`/`false`)

**Examples:**

```
GET /user/{wallet_address}/transactions/?limit=10
GET /user/{wallet_address}/transactions/?token=BMT&verified_only=true
GET /user/{wallet_address}/transactions/?limit=50&verified_only=true
```

**Example Response:**

```json
{
  "success": true,
  "message": "Found 10 transactions",
  "data": {
    "user_address": "0xF0CAdd1b3aEb569d4A4bDe9056FD8CA4826041FE",
    "filters": {
      "limit": 10,
      "token_filter": null,
      "verified_only": false
    },
    "total_shown": 6,
    "transactions": [
      {
        "transaction_id": 6,
        "token": {
          "symbol": "SMT",
          "name": "Solana Mining Token",
          "address": "0xfedcba0987654321fedcba0987654321fedcba09"
        },
        "presale_id": 6,
        "amount_purchased": 800.0,
        "amount_spent": 1200.0,
        "price_paid": 1.5,
        "purchase_date": "2024-01-20T14:45:00Z",
        "is_verified": true,
        "transaction_status": "Verified",
        "payment_token": {
          "symbol": "USDT",
          "name": "Tether USD"
        }
      }
    ]
  }
}
```

---

## 🎨 Suggested Dashboard Layout

### 📱 Main Dashboard Page

#### 1. **Header Section**

```
👤 User: 0xF0CA...41FE
📊 Portfolio Value: $2,850.50 | 🎯 Presales: 3 | ✅ Verification: 83.3%
```

#### 2. **Quick Stats Cards** (4 cards in a row)

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 💰 Total Spent  │ │ 🪙 Tokens Held  │ │ 📋 Presales     │ │ ✅ Verified     │
│ $2,850.50       │ │ 3 Types         │ │ 3 Participated  │ │ 5/6 (83%)       │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

#### 3. **Token Holdings Cards** (Main section)

```
🪙 Bitcoin Mining Token (BMT)
┌─────────────────────────────────────────────────────────────┐
│ Holdings: 1,500.50 BMT | Spent: $750.25 | Avg Price: $0.50 │
│ Recent Transactions (2):                                    │
│ • Jan 15: +500 BMT for $250 USDC ✅                        │
│ • Jan 10: +1000.5 BMT for $500.25 USDC ✅                  │
│ [View All Transactions] [Token Details]                    │
└─────────────────────────────────────────────────────────────┘
```

#### 4. **Recent Activity Feed**

```
📈 Recent Activity
• Jan 20: Purchased 800 SMT for $1,200 USDT ✅
• Jan 15: Purchased 500 BMT for $250 USDC ✅
• Jan 12: Purchased 1,200 EMT for $900 USDC ⏳
```

---

## 💡 Frontend Implementation Tips

### **Responsive Design**

- **Mobile**: Stack cards vertically, use collapsible sections
- **Tablet**: 2-column layout for token holdings
- **Desktop**: Full layout with sidebar navigation

### **Data Updates**

- **Auto-refresh**: Every 30 seconds for dashboard overview
- **Manual refresh**: Pull-to-refresh on mobile
- **Real-time**: WebSocket for transaction updates (if available)

### **User Experience**

- **Loading states**: Skeleton loaders for all API calls
- **Error handling**: Retry buttons, offline indicators
- **Empty states**: "No tokens yet" with helpful guidance

### **Interactive Features**

- **Click token card** → Go to detailed transaction history
- **Filter transactions** → By token, verification status, date range
- **Export data** → CSV/PDF reports
- **Share portfolio** → Generate public portfolio link

---

## 🔄 API Integration Examples

### **React/Next.js Example**

```javascript
// Fetch dashboard data
const fetchDashboard = async (walletAddress) => {
  try {
    const response = await fetch(
      `/api/presale/user/${walletAddress}/dashboard/`
    );
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message);
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    throw error;
  }
};

// Usage in component
const [dashboardData, setDashboardData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboard(walletAddress);
      setDashboardData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (walletAddress) {
    loadDashboard();
  }
}, [walletAddress]);
```

### **Vue.js Example**

```javascript
// Composable for dashboard data
import { ref, onMounted } from "vue";

export function useDashboard(walletAddress) {
  const dashboardData = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetchDashboard = async () => {
    loading.value = true;
    try {
      const response = await $fetch(
        `/api/presale/user/${walletAddress}/dashboard/`
      );
      if (response.success) {
        dashboardData.value = response.data;
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (walletAddress) {
      fetchDashboard();
    }
  });

  return { dashboardData, loading, error, fetchDashboard };
}
```

---

## ⚠️ Error Handling

### **Common Error Responses**

```json
{
  "success": false,
  "message": "User with address 0x123... not found",
  "data": null
}
```

### **HTTP Status Codes**

- `200` - Success
- `404` - User/Token not found
- `500` - Server error

### **Frontend Error Handling**

- **404 User Not Found**: Show "Connect wallet" or "User not registered"
- **500 Server Error**: Show retry button with "Something went wrong"
- **Network Error**: Show offline indicator, enable retry

---

## 🔗 Test Wallet Address

Use this test wallet address to test the dashboard:

```
0xF0CAdd1b3aEb569d4A4bDe9056FD8CA4826041FE
```

---

## 📞 Support

For any questions about the API or dashboard implementation:

- **API Documentation**: `/api/docs/` (if available)
- **Example Data**: Use the test wallet address above
- **Status Codes**: Standard HTTP status codes
- **Rate Limiting**: No limits currently implemented

---

## 🚀 Getting Started Checklist

- [ ] Set up API base URL
- [ ] Implement wallet address input/connection
- [ ] Create dashboard overview component
- [ ] Build token holdings cards
- [ ] Add transaction history views
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Test with provided wallet address
- [ ] Add responsive design
- [ ] Implement data refresh
