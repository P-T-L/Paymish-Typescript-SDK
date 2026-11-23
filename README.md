# Paymish TypeScript SDK

The official TypeScript SDK for integrating with the **Paymish API**. Built with **zero runtime dependencies** using native `fetch`, strict TypeScript types, and dual ESM/CommonJS output via `tsup`.

**Official Developer API docs:** https://docs.paymish.com/

**Official Swagger API docs:** https://api.paymish.com/api/user-service/external/v1/docs/

---

## Features

- **Zero Runtime Dependencies:** Built entirely on Node.js native `fetch` and node:crypto (randomUUID).
- **Strict TypeScript & Auto-Generated Declarations:** Written in TypeScript with full request/response interfaces and automatic declaration file generation during build.
- **Dual ESM & CommonJS Build:** Bundled with `tsup` so consumers can use `import` or `require` seamlessly.
- **Resilient HTTP Engine:** Automatic retries with exponential backoff for transient `5xx` responses and network timeouts.
- **Automatic Idempotency:** Generates unique `Idempotency-Key` headers for state-changing requests (`POST`, `PUT`, `PATCH`) unless explicitly provided.
- **Data Sanitization:** Automatically redacts sensitive fields (such as API keys, tokens, passwords, and authorization values) on `PaymishError.requestData`.

---

## Installation

Install via `npm`:

```bash
npm install paymish-typescript-sdk
```

> **Requirement:** Node.js `>= 18.0.0` is required for native `fetch` and `AbortSignal.timeout` support.

---

## Quick Start

```javascript
import Paymish, { PaymishError } from "paymish-typescript-sdk";

const paymish = new Paymish({
  baseUrl: "https://api.paymish.com", // Optional (default: "https://api.paymish.com")
  timeout: 10000, // Optional request timeout in ms (default: 10000)
});

async function main(): Promise<void> {
  try {
    // 1. Generate Auth Token
    const authResponse = await paymish.auth.generateToken({
      public_key: "pk_test_123456789",
      secret_key: "sk_test_987654321",
    });

    console.log("Token Generated:", authResponse.data);

    // 2. Fetch Supported Banks
    const banksResponse = await paymish.banks.list({
      headers: {
        Authorization: `Bearer ${authResponse.data?.token ?? ""}`,
      },
    });

    console.log("Supported Banks:", banksResponse.data);
  } catch (error) {
    if (error instanceof PaymishError) {
      console.error(`Paymish Error [${error.statusCode}]:`, error.message);
      console.error("Validation Errors:", error.errors);
      console.error("Sanitized Request Payload:", error.requestData);
    } else {
      console.error("Unexpected Error:", error);
    }
  }
}

void main();
```

---

## Client Configuration

Pass an optional `HttpClientOptions` object when instantiating `Paymish` to customize HTTP execution behavior:

```javascript
import Paymish, { type HttpClientOptions } from "paymish-typescript-sdk";

const options: HttpClientOptions = {
  baseUrl: "https://api.paymish.com",
  timeout: 10000, // Request timeout in milliseconds (default: 10000)
  maxRetries: 3, // Max retry attempts for 5xx errors and timeouts (default: 3)
  retryDelayMs: 500, // Initial base delay for exponential backoff in ms (default: 500)
};

const paymish = new Paymish(options);
```

### Options

| Property       | Type     | Default                     | Description                                                                                            |
| :------------- | :------- | :-------------------------- | :----------------------------------------------------------------------------------------------------- |
| `baseUrl`      | `string` | `"https://api.paymish.com"` | Base API endpoint. Enforces `http:` or `https:` protocol and normalizes trailing slashes.              |
| `timeout`      | `number` | `10000`                     | Request timeout duration in milliseconds.                                                              |
| `maxRetries`   | `number` | `3`                         | Maximum retry attempts for retryable `5xx` responses and network timeouts.                             |
| `retryDelayMs` | `number` | `500`                       | Base delay in milliseconds used for exponential backoff calculations (`retryDelayMs * 2^(attempt-1)`). |

---

## API Reference

### Auth Resource (`paymish.auth`)

#### `generateToken(credentials, options?)`

Generates an authentication token using public and secret keys.

- **Endpoint:** `POST /api/user-service/external/v1/generate-token`
- `credentials: AuthCredentials` **(Required)**
  - `public_key: string` — Your Paymish public key.
  - `secret_key string` — Your Paymish secret key.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<GenerateTokenData>>`

```javascript
import type { AuthCredentials } from "paymish-typescript-sdk";

const credentials: AuthCredentials = {
  public_key: "pk_test_...",
  secret_key: "sk_test_...",
};

const tokenResponse = await paymish.auth.generateToken(credentials, {
  idempotencyKey: "custom_idempotency_key_123",
  customTimeout: 5000,
});
```

### Banks Resource (`paymish.banks`)

#### `list(options?)`

Retrieves the list of banks supported by Paymish.

- **Endpoint:** `GET /api/transaction-service/external/v1/bank`
- `options?: RequestOptions` **(Optional)** — Custom headers (such as `Authorization`), `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<BankItem[]>>`

```javascript
const banks = await paymish.banks.list({
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `resolveAccount(params, options?)`

Confirms that an account number exists at a bank and returns the resolved account details.

- **Endpoint:** `GET /api/transaction-service/external/v1/bank/resolve`
- `params: ResolvedAccountParams` **(Required)**
  - `account_number: string` — The 10-digit (NUBAN) account number.
  - `bank_code: string` — The bank code returned by `banks.list()`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<ResolvedAccountData>>`

```javascript
import type { ResolveAccountParams } from "paymish-typescript-sdk";

const params: ResolveAccountParams = {
  account_number: "0123456789",
  bank_code: "058",
};

const resolved = await paymish.banks.resolveAccount(params, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

### Business Resource (`paymish.business`)

#### `changeMode(payload, options?)`

Changes the mode (live or not live) of the business.

- **Endpoint:** `POST /api/user-service/external/v1/change-business-mode`
- `payload: ChangeBusinessModeInput` **(`{isLive: boolean } | boolean`, Required)** — Pass `{ isLive: true }` or `true` for live mode and `{isLive: false}` or `false` for non-live mode.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<BusinessProfile>>`

```javascript
await paymish.business.changeMode(
  { isLive: false },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } },
);
```

#### `getDetails(options?)`

Retrieves full details for the authenticated business profile.

- **Endpoint:** `GET /api/user-service/external/v1/get-business-detail`
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<BusinessProfile>>`

```javascript
await paymish.business.getDetails({
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `createBusiness(payload, options?)`

Adds a new business profile.

- **Endpoint:** `POST /api/user-service/external/v1/add-new-business`
- `payload: CreateBusinessPayload` **(Required)**
  - `countryId: number` — The country identifier.
  - `businessName: string` — The name of the business.
  - `businessCategory: number` — The business category identifier.
  - `businessDescription?: string` — Optional business description.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<BusinessProfile>>`

```javascript
import type { CreateBusinessPayload } from "paymish-typescript-sdk";

const payload: CreateBusinessPayload = {
  countryId: 1,
  businessName: "Paymish Merchant Ltd",
  businessCategory: 4,
  businessDescription: "Digital commerce operations",
};

const created = await paymish.business.createBusiness(payload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `listBusinesses(options?)`

Retrieves the list of businesses associated with the account.

- **Endpoint:** `GET /api/user-service/external/v1/business-list`
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<BusinessProfile[]>>`

```javascript
const businesses = await paymish.business.listBusinesses({
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

### Customer Resource (paymish.customer)

#### `createCustomer(payload, options?)`

Creates a new customer record.

- **Endpoint:** `POST /api/customer-service/external/v1/create`
- `payload: CreateCustomerPayload` **(Required)**
  - `email: string` — Customer's email address.
  - `firstName: string` — Customer's first name.
  - `lastName: string` — Customer's last name.
  - `phoneNumber: string` — Customer's phone number.
  - `countryId: number` — Customer's country identifier.
  - `dialingCodeId?: number` — Optional dialing code identifier.
  - `businessId?: number` — Optional associated business identifier.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<CustomerRecord>>`

```javascript
import type { CreateCustomerPayload } from "paymish-typescript-sdk";

const payload: CreateCustomerPayload = {
  email: "customer@example.com",
  firstName: "Ada",
  lastName: "Okafor",
  phoneNumber: "08012345678",
  countryId: 1,
  dialingCodeId: 1,
  businessId: 10,
};

const created = await paymish.customer.createCustomer(payload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `updateCustomer(payload, options?)`

Updates an existing customer record.

- **Endpoint:** `PUT /api/customer-service/external/v1/customer-update`
- `payload: UpdateCustomerPayload` **(Required)**
  - `customerReference: string` — Reference identifier for the customer.
  - `firstName?: string` — Updated first name.
  - `lastName?: string` — Updated last name.
  - `phoneNumber?: string` — Updated phone number.
  - `dialingCodeId?: number` — Updated dialing code identifier.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<CustomerRecord>>`

```javascript
import type { UpdateCustomerPayload } from "paymish-typescript-sdk";

const updatePayload: UpdateCustomerPayload = {
  customerReference: "CUS_123456",
  firstName: "Adaeze",
};

const updated = await paymish.customer.updateCustomer(updatePayload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `listCustomers(params?, options?)`

Retrieves a paginated list of customers (defaults to `page: 1` and `limit: 10`).

- **Endpoint:** `GET /api/customer-service/external/v1/list`
- `params?: ListCustomersParams` **(Optional)** — Query parameters such as `page`, `limit`, and `search`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<CustomerRecord[]>>`

```javascript
const customers = await paymish.customer.listCustomers(
  { page: 1, limit: 15, search: "Ada" },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } },
);
```

#### `blacklistCustomer(payload, options?)`

Blacklists or whitelists a customer.

- **Endpoint:** `PUT /api/customer-service/external/v1/black-listed`
- `payload: BlacklistCustomerPayload` **(Required)**
  - `customerReference: string` — Reference identifier for the customer.
  - `isBlackListed: boolean` — Pass `true` to blacklist or `false` to whitelist.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<CustomerRecord>>`

```javascript
await paymish.customer.blacklistCustomer(
  {
    customerReference: "CUST_12345",
    isBlackListed: true,
  },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } },
);
```

#### `getCustomerById(customerId, options?)`

Retrieves customer details by integer ID (or an object containing `customerId`, `id`, or `customerReference`).

- **Endpoint:** `GET /api/customer-service/external/v1/get-customer-by-id`
- `identifier: CustomerIdentifierInput` **(Required)** — Integer customer ID or an identifier object.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<CustomerRecord>>`

```javascript
const customer = await paymish.customer.getCustomerById(101, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

### TransactionCustomer Resource (paymish.transactionCustomer)

#### `listCustomers(params?, options?)`

Retrieves a paginated list of transaction customers.

- **Endpoint:** `GET /api/transaction-service/external/v1/customers`
- `params?: ListTransactionCustomersParams` **(Optional)** — Query parameters such as `page`, `limit`, and `search`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<TransactionCustomerRecord[]>>`

```javascript
const customers = await paymish.transactionCustomer.listCustomers(
  { page: 1, limit: 10, search: "Ada" },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } },
);
```

#### `createCustomer(payload, options?)`

Creates a new customer record in the transaction service.

- **Endpoint:** `POST /api/transaction-service/external/v1/customers`
- `payload: CreateTransactionCustomerPayload` **(Required)** — Customer creation payload object.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<TransactionCustomerRecord>>`

```javascript
import type { CreateTransactionCustomerPayload } from "paymish-typescript-sdk";

const payload: CreateTransactionCustomerPayload = {
  email: "customer@example.com",
  firstName: "Ada",
  lastName: "Okafor",
  phoneNumber: "08012345678",
};

const created = await paymish.transactionCustomer.createCustomer(payload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `getCustomerById(identifier, options?)`

Retrieves transaction customer details by ID or an object containing `id` or `customerId`.

- **Endpoint:** `GET /api/transaction-service/external/v1/customers/{id}`
- `identifier: TransactionCustomerIdentifierInput` **(Required)** — Customer ID (`string | number`) or an object containing `id` or `customerId`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<TransactionCustomerRecord>>`

```javascript
const customer = await paymish.transactionCustomer.getCustomerById("cust_123", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateCustomer(identifier, payload, options?)`

Updates an existing transaction customer by ID or an object containing `id` or `customerId`.

- **Endpoint:** `PUT /api/transaction-service/external/v1/customers/{id}`
- `identifier: TransactionCustomerIdentifierInput` **(Required)** — Customer ID (`string | number`) or an object containing `id` or `customerId`.
- `payload: UpdateTransactionCustomerPayload` **(Required)** — Updated customer fields.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<TransactionCustomerRecord>>`

```javascript
import type { UpdateTransactionCustomerPayload } from "paymish-typescript-sdk";

const updatePayload: UpdateTransactionCustomerPayload = {
  phoneNumber: "08098765432",
};

const updated = await paymish.transactionCustomer.updateCustomer(
  "cust_123",
  updatePayload,
  { headers: { Authorization: "Bearer YOUR_TOKEN" } }
);
```

### DedicatedVirtualAccount Resource (`paymish.dedicatedVirtualAccount`)

#### `createAccount(payload, options?)`

Creates a new dedicated virtual account.

- **Endpoint:** `POST /api/transaction-service/external/v1/dedicated-virtual-accounts`
- `payload: CreateDedicatedAccountPayload` **(Required)** — Account creation payload object.
- `options (Object, Optional)` — Custom per-request options.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<DedicatedVirtualAccountRecord>>`

```javascript
import type { CreateDedicatedAccountPayload } from "paymish-typescript-sdk";

const payload: CreateDedicatedAccountPayload = {
  customerId: 42,
  preferred_bank: "wema-bank",
};

const created = await paymish.dedicatedVirtualAccount.createAccount(payload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `listAccounts(params?, options?)`

Retrieves a paginated list of dedicated virtual accounts (defaults to `page: 1` and `limit: 10`).

- **Endpoint:** `GET /api/transaction-service/external/v1/dedicated-virtual-accounts`
- `params?: ListDedicatedAccountsParams` **(Optional)** — Query parameters such as `page`, `limit`, and `search`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<DedicatedVirtualAccountRecord[]>>`

```javascript
const accounts = await paymish.dedicatedVirtualAccount.listAccounts(
  { page: 1, limit: 10 },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } },
);
```

#### `getAccountByCustomerId(identifier, options?)`

Retrieves a dedicated virtual account by customer ID or an object containing `customerId` or `id`.

- **Endpoint:** `GET /api/transaction-service/external/v1/dedicated-virtual-accounts/{customerId}`
- `identifier: DedicatedAccountIdentifierInput` **(Required)** — Customer ID (`string | number`) or an object containing `customerId` or `id`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<DedicatedVirtualAccountRecord>>`

```javascript
const account = await paymish.dedicatedVirtualAccount.getAccountByCustomerId(
  42,
  {
    headers: { Authorization: "Bearer YOUR_TOKEN" },
  },
);
```

#### `updateAccountByCustomerId(identifier, payload, options?)`

Updates a dedicated virtual account by customer ID or an object containing `customerId` or `id`.

- **Endpoint:** `PUT /api/transaction-service/external/v1/dedicated-virtual-accounts/{customerId}`
- `identifier: DedicatedAccountIdentifierInput` **(Required)** — Customer ID (`string | number`) or an object containing `customerId` or `id`.
- `payload: UpdateDedicatedAccountPayload` **(Required)** — Updated account payload object.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<DedicatedVirtualAccountRecord>>`

```javascript
import type { UpdateDedicatedAccountPayload } from "paymish-typescript-sdk";

const updatePayload: UpdateDedicatedAccountPayload = {
  active: false,
};

const updated = await paymish.dedicatedVirtualAccount.updateAccountByCustomerId(
  42,
  updatePayload,
  { headers: { Authorization: "Bearer YOUR_TOKEN" } }
);
```

#### `requeryAccount(params, options?)`

Requeries the status of a dedicated virtual account.

- **Endpoint:** `GET /api/transaction-service/external/v1/dedicated-virtual-accounts/requery`
- `params: RequeryDedicatedAccountParams` **(Required)**
  - `account_number: string` — The account number to requery.
  - `provider_slug: string` — The bank provider slug (e.g., `gtb`, `zenith`, `wema-bank`).
  - `date?: string` — Optional date filter.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<DedicatedVirtualAccountRecord>>`

```javascript
import type { RequeryDedicatedAccountParams } from "paymish-typescript-sdk";

const params: RequeryDedicatedAccountParams = {
  account_number: "0123456789",
  provider_slug: "wema-bank",
  date: "2026-11-20",
};

const requeryResult = await paymish.dedicatedVirtualAccount.requeryAccount(params, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `assignAccount(payload, options?)`

Assigns a dedicated virtual account.

- **Endpoint:** `POST /api/transaction-service/external/v1/dedicated-virtual-accounts/assign`
- `payload: AssignDedicatedAccountPayload` **(Required)**
  - `first_name: string` — Customer first name.
  - `last_name: string` — Customer last name.
  - `email: string` — Customer email address.
  - `phone: string` — Customer phone number.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<DedicatedVirtualAccountRecord>>`

```javascript
import type { AssignDedicatedAccountPayload } from "paymish-typescript-sdk";

const assignPayload: AssignDedicatedAccountPayload = {
  first_name: "Ada",
  last_name: "Okafor",
  email: "ada@example.com",
  phone: "08012345678",
};

const assigned = await paymish.dedicatedVirtualAccount.assignAccount(assignPayload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

### Dispute Resource (paymish.dispute)

#### `createDispute(payload, options?)`

Creates a dispute by uploading evidence or submitting dispute details (automatically converts plain objects into `FormData`).

- **Endpoint:** `POST /api/dispute-service/external/v1/create-dispute`
- `payload: CreateDisputeInput` **(`FormData | CreateDisputeObjectPayload`, Required)**
  - `transactionRef: string` — Transaction reference for the dispute.
  - `disputeReason: string` — Reason for raising the dispute.
  - `disputeDescription: string` — Detailed description of the dispute.
  - `image?: DisputeEvidenceFile` — Optional evidence file (`Blob`, `File`, stream, or other supported upload value).
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<DisputeRecord>>`

```javascript
import type { CreateDisputeObjectPayload } from "paymish-typescript-sdk";

const payload: CreateDisputeObjectPayload = {
  transactionRef: "TXN_REF_12345",
  disputeReason: "duplicate_charge",
  disputeDescription: "Customer was debited twice for the same order.",
};

const created = await paymish.dispute.createDispute(payload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `listDisputes(params?, options?)`

Retrieves a paginated list of disputes (defaults to `limit: 10` and `page: 1`).

- **Endpoint:** `GET /api/dispute-service/external/v1/list`
- `params?: ListDisputesParams` **(Optional)** — Query parameters such as `limit`, `page`, and `search`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<DisputeRecord[]>>`

```javascript
const disputes = await paymish.dispute.listDisputes(
  { page: 1, limit: 10, search: "TXN_REF_12345" },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } },
);
```

#### `getDisputeDetails(transactionRef, options?)`

Retrieves dispute details by transaction reference string or an object containing `transactionRef` or `reference`.

- **Endpoint:** `GET /api/dispute-service/external/v1/dispute-details`
- `transactionRef: DisputeReferenceInput` **(Required)** — Transaction reference string or reference object.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<DisputeRecord>>`

```javascript
const dispute = await paymish.dispute.getDisputeDetails("TXN_REF_12345", {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `updateDispute(payload, options?)`

Updates an existing dispute record.

- **Endpoint:** `PUT /api/dispute-service/external/v1/update-dispute`
- `payload: UpdateDisputePayload` **(Required)**
  - `tnxRef: string` — Transaction reference for the dispute.
  - `reason: string` — Reason for the update.
  - `status: string` — Updated dispute status.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<DisputeRecord>>`

```javascript
import type { UpdateDisputePayload } from "paymish-typescript-sdk";

const updatePayload: UpdateDisputePayload = {
  tnxRef: "TXN_REF_12345",
  reason: "Submitted additional proof of delivery",
  status: "in_review",
};

const updated = await paymish.dispute.updateDispute(updatePayload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

### TransactionDisputes Resource (`paymish.transactionDisputes`)

#### `listDisputes(options?)`

Retrieves the list of transaction-level disputes.

- **Endpoint:** `GET /api/transaction-service/external/v1/disputes`
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<TransactionDisputeRecord[]>>`

```javascript
const disputes = await paymish.transactionDisputes.listDisputes({
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `createDispute(payload?, options?)`

Creates a new transaction-level dispute.

- **Endpoint:** `POST /api/transaction-service/external/v1/disputes`
- `payload?: CreateTransactionDisputePayload` **(Optional)** — Dispute creation payload object (defaults to `{}`).
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<TransactionDisputeRecord>>`

```javascript
import type { CreateTransactionDisputePayload } from "paymish-typescript-sdk";

const payload: CreateTransactionDisputePayload = {
  transactionRef: "TXN_REF_12345",
  reason: "Customer claims goods not delivered",
};

const created = await paymish.transactionDisputes.createDispute(payload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `getDisputeById(disputeId, options?)`

Retrieves a transaction-level dispute by its ID or an object containing `disputeId` or `id`.

- **Endpoint:** `GET /api/transaction-service/external/v1/disputes/{id}`
- `disputeId: TransactionDisputeIdentifierInput` **(Required)** — Dispute ID (`string | number`) or an object containing `disputeId` or `id`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<TransactionDisputeRecord>>`

```javascript
const dispute = await paymish.transactionDisputes.getDisputeById(101, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `updateDispute(disputeId, payload, options?)`

Updates an existing transaction-level dispute by its ID or an object containing `disputeId` or `id`.

- **Endpoint:** `PUT /api/transaction-service/external/v1/disputes/{id}`
- `disputeId: TransactionDisputeIdentifierInput` **(Required)** — Dispute ID (`string | number`) or an object containing `disputeId` or `id`.
- `payload: UpdateTransactionDisputePayload` **(Required)** — Updated dispute fields.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<TransactionDisputeRecord>>`

```javascript
import type { UpdateTransactionDisputePayload } from "paymish-typescript-sdk";

const updatePayload: UpdateTransactionDisputePayload = {
  status: "resolved",
  reason: "Refund issued to customer",
};

const updated = await paymish.transactionDisputes.updateDispute(
  101,
  updatePayload,
  { headers: { Authorization: "Bearer YOUR_TOKEN" } }
);
```

### InitializeCheckout Resource (`paymish.initializeCheckout`)

#### `initializeTransaction(payload, options?)`

Initializes a payment transaction.

- **Endpoint:** `POST /api/transaction-service/external/v1/transaction-initialize`
- `payload: InitializeTransactionPayload` **(Required)**
  - `email: string` — Customer's email address.
  - `amount: CheckoutAmount` (`string | number`) — Amount in currency subunits (e.g., kobo or cents).
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<InitializedCheckoutData>>`

```javascript
import type { InitializeTransactionPayload } from "paymish-typescript-sdk";

const payload: InitializeTransactionPayload = {
  email: "customer@example.com",
  amount: 500000,
};

const initialized = await paymish.initializeCheckout.initializeTransaction(payload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `initializeDva(payload, options?)`

Initializes a transaction with a Dynamic Virtual Account (DVA).

- **Endpoint:** `POST /api/transaction-service/external/v1/transaction-initialize/dva`
- `payload: InitializeDvaPayload` **(Required)**
  - `email: string` — Customer's email address.
  - `amount: CheckoutAmount` (`string | number`) — Amount in currency subunits (e.g., kobo or cents).
  - `reference?: string` — Optional unique transaction reference.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<InitializedCheckoutData>>`

```javascript
import type { InitializeDvaPayload } from "paymish-typescript-sdk";

const dvaPayload: InitializeDvaPayload = {
  email: "customer@example.com",
  amount: 250000,
  reference: "TXN_DVA_001",
};

const dvaSession = await paymish.initializeCheckout.initializeDva(dvaPayload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

### Invoices Resource (`paymish.invoices`)

#### `createInvoice(payload, options?)`

Creates a new invoice.

- **Endpoint:** `POST /api/payment-service/external/v1/invoices`
- `payload: CreateInvoicePayload` **(Required)**
  - `customerEmail: string` — Customer's email address.
  - `amount: number` — Invoice amount.
  - `note?: string` — Optional invoice note.
  - `sendImmediately?: boolean` — Defaults to `true`. When `false`, the invoice is created as a draft and not emailed.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<InvoiceRecord>>`

```javascript
import type { CreateInvoicePayload } from "paymish-typescript-sdk";

const payload: CreateInvoicePayload = {
  customerEmail: "billing@example.com",
  amount: 50000,
  note: "Monthly retainer invoice",
  sendImmediately: true,
};

const created = await paymish.invoices.createInvoice(payload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `listInvoices(params?, options?)`

Retrieves a paginated list of invoices with optional filters.

- **Endpoint:** `GET /api/payment-service/external/v1/invoices`
- `params?: ListInvoicesParams` **(Optional)** — Query parameters including `status`, `startDate`, `endDate`, `search`, `page`, and `limit`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<InvoiceRecord[]>>`

```javascript
const invoices = await paymish.invoices.listInvoices(
  { status: "paid", page: 1, limit: 10 },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } },
);
```

#### `getInvoiceById(invoiceId, options?)`

Retrieves a single invoice by its ID or an object containing invoiceId or id.

- **Endpoint:** `GET /api/payment-service/external/v1/invoices/{id}`
- `invoiceId: InvoiceIdentifierInput` **(Required)** — Invoice ID (`string | number`) or an object containing `invoiceId` or `id`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<InvoiceRecord>>`

```javascript
const invoice = await paymish.invoices.getInvoiceById(75, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

### PaymentPages Resource (`paymish.paymentPages`)

#### `checkCustomLinkExists(payload, options?)`

Checks if a custom payment page slug/link already exists.

- **Endpoint:** `POST /api/payment-service/external/v1/payment-pages/custom-link-check-exist`
- `payload: CheckCustomLinkExistsPayload` **(Required)**
  - `customLink: string` — Custom link identifier to check.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<Record<string, unknown>>>`

```javascript
import type { CheckCustomLinkExistsPayload } from "paymish-typescript-sdk";

const payload: CheckCustomLinkExistsPayload = {
  customLink: "monthly-tuition",
};

const linkCheck = await paymish.paymentPages.checkCustomLinkExists(payload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `createPaymentPage(payload, options?)`

Creates a new payment page from a `FormData` instance or plain object (automatically converts plain objects to `FormData` and appends array values as `${key}[]`).

- **Endpoint:** `POST /api/payment-service/external/v1/payment-pages/create-pages`
- `payload: CreatePaymentPageInput` **(`FormData | CreatePaymentPageObjectPayload`, Required)**
  - `businessId: number` — Target business identifier.
  - `pageName: string` — Name of the payment page.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PaymentPageRecord>>`

```javascript
import type { CreatePaymentPageObjectPayload } from "paymish-typescript-sdk";

const payload: CreatePaymentPageObjectPayload = {
  businessId: 10,
  pageName: "Event Registration",
};

const created = await paymish.paymentPages.createPaymentPage(payload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `getPaymentPages(params?, options?)`

Retrieves a paginated list of payment pages with optional `filter` and `sort` parameters.

**Endpoint:** `GET /api/payment-service/external/v1/payment-pages/get-pages`

- `params?: GetPaymentPagesParams` **(Optional)** — Query parameters including `status`, `searchPageText`, `startDate`, `endDate`, `page`, `limit`, and `sort`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PaymentPageRecord[]>>`

```javascript
const pages = await paymish.paymentPages.getPaymentPages(
  { status: "Published", page: 1, limit: 10, sort: "DESC" },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } },
);
```

#### `getPageDetails(identifier, options?)`

Retrieves details for a specific payment page by ID or an object containing `pageId` or `id`.

- **Endpoint:** `GET /api/payment-service/external/v1/payment-pages/get-page-details`
- `params: PaymentPageDetailsInput` **(Required)** — Payment page ID (`number | string`) or an object containing `pageId` or `id`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PaymentPageRecord>>`

```javascript
const pageDetails = await paymish.paymentPages.getPageDetails(
  { pageId: 15 },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } },
);
```

#### `updatePaymentPage(payload, options?)`

Updates an existing payment page using a `FormData` instance or plain object containing `pageId` or `id`.

**Endpoint:** `PUT /api/payment-service/external/v1/payment-pages/update-page-details`

- `payload: UpdatePaymentPageInput` **(`FormData | UpdatePaymentPageObjectPayload`, Required)**
  - `pageId?: PaymentPageId` — Payment page identifier (`number | string`).
  - `pageName?: string` — Updated payment page name.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PaymentPageRecord>>`

```javascript
import type { UpdatePaymentPageObjectPayload } from "paymish-typescript-sdk";

const updatePayload: UpdatePaymentPageObjectPayload = {
  pageId: 15,
  pageName: "Updated Event Registration",
};

const updated = await paymish.paymentPages.updatePaymentPage(updatePayload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `updatePageStatus(payload, options?)`

Updates the publication status of a payment page.

- **Endpoint:** `PUT /api/payment-service/external/v1/payment-pages/update-page-status`
- `payload: UpdatePageStatusPayload (Required)`
  - `pageId: PaymentPageId` (`number | string`) — Payment page identifier.
  - `status: string` — Target status (e.g., `"Published"`, `"Unpublished"`).
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PaymentPageRecord>>`

```javascript
await paymish.paymentPages.updatePageStatus(
  { pageId: 15, status: "Published" },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } },
);
```

#### `deletePage(payload, options?)`

Marks a payment page as deleted or updates its deletion flag.

- **Endpoint:** `POST /api/payment-service/external/v1/payment-pages/delete-page`
- `payload: DeletePagePayload` **(Required)**
  - `pageId: PaymentPageId` (`number | string`) — Payment page identifier.
  - `isDeleted: boolean` — Deletion flag.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PaymentPageRecord>>`

```javascript
await paymish.paymentPages.deletePage(
  { pageId: 15, isDeleted: true },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } },
);
```

#### `getAssociatedProducts(identifier, options?)`

Retrieves products associated with a payment page, with optional product search filtering.

- **Endpoint:** `GET /api/payment-service/external/v1/payment-pages/payment-page-get-product`
- `params: GetAssociatedProductsInput` **(Required)** — Payment page ID (`number | string`) or an object containing `pageId` or `id` and optional `searchProduct`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PaymentPageRecord[]>>`

```javascript
const products = await paymish.paymentPages.getAssociatedProducts(
  { pageId: 15, searchProduct: "Ticket" },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } },
);
```

#### `addProductToPaymentPage(payload, options?)`

Associates one or more products with a payment page (normalizes `productIds` arrays into comma-separated strings).

- **Endpoint:** `POST /api/payment-service/external/v1/payment-pages/payment-page-add-product`
- `payload: AddProductToPaymentPagePayload` **(Required)**
  - `pageId?: PaymentPageId` — Payment page identifier.
  - `productIds: string | Array<number | string>` — Product IDs as a comma-separated string or array.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PaymentPageRecord>>`

```javascript
import type { AddProductToPaymentPagePayload } from "paymish-typescript-sdk";

const productPayload: AddProductToPaymentPagePayload = {
  pageId: 15,
  productIds: [101, 102],
};

const added = await paymish.paymentPages.addProductToPaymentPage(productPayload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `deleteProductFromPaymentPage(payload, options?)`

Removes a product association from a payment page.

- **Endpoint:** `POST /api/payment-service/external/v1/payment-pages/payment-page-delete-product`
- `payload: DeleteProductFromPaymentPageInput` **(Required)** — Payment page product ID (`number | string`) or an object containing `paymentPageProductId` or `id`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PaymentPageRecord>>`

```javascript
const deletedProduct = await paymish.paymentPages.deleteProductFromPaymentPage(
  { paymentPageProductId: 501 },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } },
);
```

#### `initiateCheckoutDynamicVirtualAccount(payload, options?)`

Initiates a dynamic virtual account for a payment page checkout session.

- **Endpoint:** `POST /api/payment-service/external/v1/payment-pages/initiate-initialize-checkout-dynamic-virtual-account`
- `payload: InitiateCheckoutDvaPayload` **(Required)**
  - `accessCode?: string` — Checkout session access code (`access_code` alias also accepted).
  - `amount: number` — Numeric amount in Naira.
  - `email?: string` — Optional customer email address.
  - `pageReference?: string` — Optional page reference (`page_reference` alias also accepted).
  - `transferSelectedAt?: number` — Optional timestamp in milliseconds when transfer was selected.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PaymentPageRecord>>`

```javascript
import type { InitiateCheckoutDvaPayload } from "paymish-typescript-sdk";

const dvaPayload: InitiateCheckoutDvaPayload = {
  accessCode: "ACS_98765",
  amount: 15000,
  email: "customer@example.com",
  pageReference: "PAGE_REF_01",
};

const dva = await paymish.paymentPages.initiateCheckoutDynamicVirtualAccount(dvaPayload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `listPaymentPages(options?)`

Retrieves a list of payment pages via the transaction service.

- **Endpoint:** `GET /api/transaction-service/external/v1/payment-pages`
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PaymentPageRecord[]>>`

```javascript
const txPages = await paymish.paymentPages.listPaymentPages({
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `createPaymentPageTransactionService(payload?, options?)`

Creates a payment page via the transaction service.

- **Endpoint:** `POST /api/transaction-service/external/v1/payment-pages`
- `payload?: CreateTransactionPaymentPagePayload` **(Optional)** — Optional payload data (defaults to `{}`).
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PaymentPageRecord>>`

```javascript
const createdTxPage =
  await paymish.paymentPages.createPaymentPageTransactionService(
    { name: "Quick Checkout Page" },
    { headers: { Authorization: "Bearer YOUR_TOKEN" } },
  );
```

### Plans Resource (`paymish.plans`)

#### `createPlan(payload, options?)`

Creates a new recurring payment plan.

- **Endpoint:** `POST /api/payment-service/external/v1/plans/create-plan`
- `payload: CreatePlanPayload` **(Required)**
  - `businessId: number` — Business identifier.
  - `planName: string` — Name of the plan.
  - `planDescription: string` — Description of the plan.
  - `planAmount: number` — Plan charge amount.
  - `interval: string` — Billing interval (e.g., `Daily`, `Weekly`, `Monthly`, `Quarterly`, `Biannually`, `Annually`).
  - `maxNoOfPayment: number` — Maximum number of payments allowed.
  - `isSubscriptionPageForThisPlan: boolean` — Whether a subscription page exists for this plan.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PlanRecord>>`

```javascript
import type { CreatePlanPayload } from "paymish-typescript-sdk";

const payload: CreatePlanPayload = {
  businessId: 10,
  planName: "Pro Monthly",
  planDescription: "Monthly access to pro features",
  planAmount: 15000,
  interval: "Monthly",
  maxNoOfPayment: 12,
  isSubscriptionPageForThisPlan: true,
};

const created = await paymish.plans.createPlan(payload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `getPlans(params?, options?)`

Retrieves a paginated list of payment plans with optional filter parameters.

- **Endpoint:** `GET /api/payment-service/external/v1/plans/get-plans`
- `params?: GetPlansParams` **(Optional)** — Filter and pagination options including `status`, `interval`, `noOfSubscriptions`, `noOfSubscriptionType`, `amount`, `amountType`, `revenueAmount`, `revenueType`, `searchPlanText`, `startDate`, `endDate`, `limit`, and `page`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PlanRecord[]>>`

```javascript
const plans = await paymish.plans.getPlans(
  { status: "Active", interval: "Monthly", page: 1, limit: 10 },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } },
);
```

#### `getPlanDetails(identifier, options?)`

Retrieves detailed information for a specific plan by ID or an object containing `planId` or `id`.

- **Endpoint:** `GET /api/payment-service/external/v1/plans/get-plan-details`
- `identifier: PlanIdentifierInput` **(Required)** — Plan ID (`number | string`) or an object containing `planId` or `id`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PlanRecord>>`

```javascript
const plan = await paymish.plans.getPlanDetails(25, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `updatePlanDetails(payload, options?)`

Updates details for an existing plan.

- **Endpoint:** `PUT /api/payment-service/external/v1/plans/update-plan-details`
- `payload: UpdatePlanDetailsPayload` **(Required)**
  - `planId: number` — Plan identifier.
  - `planName: string` — Updated plan name.
  - `planDescription: string` — Updated plan description.
  - `planAmount: number` — Updated plan amount.
  - `interval: string` — Updated billing interval.
  - `maxNoOfPayment: number` — Updated maximum payment count.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PlanRecord>>`

```javascript
import type { UpdatePlanDetailsPayload } from "paymish-typescript-sdk";

const updatePayload: UpdatePlanDetailsPayload = {
  planId: 25,
  planName: "Pro Monthly Plus",
  planDescription: "Updated monthly pro plan",
  planAmount: 20000,
  interval: "Monthly",
  maxNoOfPayment: 24,
};

const updated = await paymish.plans.updatePlanDetails(updatePayload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `deletePlan(payload, options?)`

Deletes or updates the status of an existing payment plan.

- **Endpoint:** `POST /api/payment-service/external/v1/plans/delete-plan`
- `payload: DeletePlanPayload` **(Required)**
  - `planId: number` — Plan identifier.
  - `status: string` — Target plan status action.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PlanRecord>>`

```javascript
import type { DeletePlanPayload } from "paymish-typescript-sdk";

const deletePayload: DeletePlanPayload = {
  planId: 25,
  status: "Archived",
};

const deleted = await paymish.plans.deletePlan(deletePayload, {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

#### `listPlansTransactionService(params?, options?)`

Retrieves a list of payment plans via the transaction service.

- **Endpoint:** `GET /api/transaction-service/external/v1/plans`
- `params?: ListTransactionPlansParams` **(Optional)** — Optional query parameters such as `page`, `limit`, and `search`.
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PlanRecord[]>>`

```javascript
const txPlans = await paymish.plans.listPlansTransactionService(
  { page: 1, limit: 10 },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } }
);
```

#### `createPlanTransactionService(payload?, options?)`

Creates a new payment plan via the transaction service.

- **Endpoint:** `POST /api/transaction-service/external/v1/plans`
- `payload?: CreateTransactionPlanPayload` **(Optional)** — Optional plan creation payload (defaults to `{}`).
- `options?: RequestOptions` **(Optional)** — Custom headers, `idempotencyKey`, or `customTimeout`.
- **Returns:** `Promise<ApiResponse<PlanRecord>>`

```javascript
const createdTxPlan = await paymish.plans.createPlanTransactionService(
  { name: "Starter Plan" },
  { headers: { Authorization: "Bearer YOUR_TOKEN" } }
);
```

### Products Resource (`paymish.products`)

#### `createProduct(payload, [options])`

Creates a new product (supports multipart form-data for file uploads like product images).

- `payload (Object | FormData, Required)`
  - `productName (string, Required)` — The name of the product.
  - `productDescription (string, Required)` — Description of the product.
  - `price (number | string, Required)` — Product price.
  - `productType (string, Required)` — Type of product (e.g., `digital`, `physical`).
  - Other product properties and media files.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const product = await paymish.products.createProduct(
  {
    productName: "E-Book Guide",
    productDescription: "Learn web development from scratch",
    price: "2500.00",
    productType: "digital",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getProducts([params], [options])`

Retrieves a paginated list of products.

- `params (Object, Optional)` — Optional query parameters for filtering and pagination.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const products = await paymish.products.getProducts(
  { page: 1, limit: 10 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getProductDetails(identifier, [options])`

Retrieves detailed information for a specific product.

- `identifier (string | number | Object, Required)` — Product ID or options object containing `productId` or `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const details = await paymish.products.getProductDetails("143", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateProduct(payload, [options])`

Updates details for an existing product.

- `payload (Object, Required)`
  - `productId (string | number, Required)` — The ID of the product to update.
  - Other updatable fields.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.updateProduct(
  {
    productId: "143",
    productName: "Updated E-Book Title",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `updateProductStatus(payload, [options])`

Updates the active or published status of a product.

- `payload (Object, Required)`
  - `productId (string | number, Required)` — The ID of the product.
  - `status (boolean | string, Required)` — Status value or action.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.updateProductStatus(
  { productId: "143", status: true },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `deleteProduct(payload, [options])`

Deletes a product.

- `payload (Object | string | number, Required)` — Product ID or payload containing product identifiers.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.deleteProduct("143", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `getDigitalDownloadFiles(identifier, [options])`

Retrieves digital download files associated with a specific product.

- `identifier (string | number | Object, Required)` — Product ID or options object containing `productId` or `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const files = await paymish.products.getDigitalDownloadFiles("143", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `renameDigitalDownloadFiles(payload, [options])`

Renames an existing digital download file associated with a product.

- `payload (Object, Required)`
  - `productId (string, Required)` — The ID of the product.
  - `digitalDownloadFileId (string, Required)` — The ID of the digital download file to rename.
  - `fileName (string, Required)` — The new name for the digital download file.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.renameDigitalDownloadFiles(
  {
    productId: "143",
    digitalDownloadFileId: "29",
    fileName: "new-file-name.png",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `deleteDigitalDownloadFiles(payload, [options])`

Deletes or updates the status of an existing digital download file.

- `payload (Object, Required)`
  - `productId (string, Required)` — The ID of the product.
  - `digitalDownloadFileId (string, Required)` — The ID of the digital download file.
  - `status (boolean, Required)` — The status action.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.deleteDigitalDownloadFiles(
  {
    productId: "143",
    digitalDownloadFileId: "29",
    status: false,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `setDownloadLinkExpiry(payload, [options])`

Sets the download link expiry configuration for a product.

- `payload (Object, Required)`
  - `productId (string, Required)` — The ID of the product.
  - `isDownloadLinkExpiry (boolean, Required)` — Flag to indicate if download link expiry is enabled.
  - `downloadLinkExpiryDuration (string, Required)` — The duration for which the download link will be active.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.setDownloadLinkExpiry(
  {
    productId: "143",
    isDownloadLinkExpiry: true,
    downloadLinkExpiryDuration: "30",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `addDeliveryFees(payload, [options])`

Adds delivery fees for a specific location to a product.

- `payload (Object, Required)`
  - `productId (string, Required)` — The ID of the product.
  - `location (string, Required)` — The location for which delivery fees are being added.
  - `fees (string, Required)` — The amount of delivery fees.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.addDeliveryFees(
  {
    productId: "143",
    location: "New York",
    fees: "15.00",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getDeliveryFees(identifier, [options])`

Retrieves delivery fees for a specific product.

- `identifier (string | number | Object, Required)` — Product ID or options object containing `productId` or `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const fees = await paymish.products.getDeliveryFees("143", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateDeliveryFees(payload, [options])`

Updates an existing delivery fee record for a product.

- `payload (Object, Required)`
  - `productId (string, Required)` — The ID of the product.
  - `deliveryFeesId (string, Required)` — The ID of the delivery fee record to update.
  - `location (string, Required)` — The location for which the delivery fees are being updated.
  - `fees (string, Required)` — The amount of delivery fees.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.updateDeliveryFees(
  {
    productId: "143",
    deliveryFeesId: "22",
    location: "Kaduna State",
    fees: "25.00",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `deleteDeliveryFees(payload, [options])`

Deletes or updates the status of an existing delivery fee record.

- `payload (Object, Required)`
  - `productId (string, Required)` — The ID of the product.
  - `deliveryFeesId (string, Required)` — The ID of the delivery fee record.
  - `status (boolean, Required)` — The status action.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.deleteDeliveryFees(
  {
    productId: "143",
    deliveryFeesId: "22",
    status: false,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `slugExist(payload, [options])`

Checks whether a product slug already exists.

- `payload (Object | string, Required)` — Slug string or options object containing `slug`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const exists = await paymish.products.slugExist("my-product-slug", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `addDiscountCode(payload, [options])`

Creates a new discount code.

- `payload (Object, Required)`
  - `code (string, Required)` — The discount code.
  - `value (number, Required)` — The discount value.
  - `discounttype (string, Required)` — The type of discount (e.g. percentage, flat).
  - `productId (number, Optional)` — Optional product ID.
  - Other optional configuration rules (`minOrderAmount`, `maxUsePerCustomer`, `maxClaims`, `startDate`, `endDate`, `isActive`, `isDelete`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const discount = await paymish.products.addDiscountCode(
  {
    code: "SUMMER20",
    value: 20,
    discounttype: "percentage",
    isActive: true,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getDiscountCodes([params], [options])`

Retrieves discount codes based on optional query parameters like productId or code.

- `params (Object, Optional)`
  - `productId (string | number, Optional)` — Product ID filter.
  - `code (string, Optional)` — Discount code filter.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const codes = await paymish.products.getDiscountCodes(
  { productId: "123" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `updateDiscountCodeDetails([payload], [options])`

Updates discount code details.

- `payload (Object, Optional)` — Update discount code payload details.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.updateDiscountCodeDetails(
  { id: 1, value: 25 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `verifyDiscountCode(payload, [options])`

Verifies a discount code, with an optional product ID query parameter.

- `payload (Object, Required)`
  - `code (string, Required)` — The discount code to verify.
  - `productId (string | number, Optional)` — Optional product ID.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const verification = await paymish.products.verifyDiscountCode(
  {
    productId: "123",
    code: "SUMMER20",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

### Recipients Resource (`paymish.recipients`)

#### `getRecipientList(params, [options])`

Retrieves a paginated list of transfer recipients for a business.

- `params (Object, Required)`
  - `businessId (string, Required)` — The unique identifier for the business.
  - `limit (integer, Required)` — Number of results to return per page.
  - `page (integer, Required)` — Current page number for pagination.
  - `status (boolean, Optional)` — Filter by recipient status (`true` for active, `false` for inactive).
  - `searchRecipientAccountName (string, Optional)` — Search filter for recipient account name.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const recipients = await paymish.recipients.getRecipientList(
  {
    businessId: "biz_123",
    limit: 10,
    page: 1,
    status: true,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getRecipientDetails(identifier, [options])`

Retrieves details for a specific recipient by recipient code.

- `identifier (string | Object, Required)` — Recipient code string or an options object containing recipientCode.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const recipient = await paymish.recipients.getRecipientDetails("RCP_12345", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `deleteRecipient(identifier, [options])`

Deletes a transfer recipient by recipient ID.

- `identifier (string | Object, Required)` — Recipient ID string or an options object containing recipientId.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.recipients.deleteRecipient("rec_12345", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `blacklistRecipient(payload, [options])`

Blacklists or unblacklists a transfer recipient.

- `payload (Object, Required)`
  - `recipientId (number | string, Required)` — ID of the recipient to be blacklisted.
  - `isBlackListed (boolean, Required)` — Flag to indicate if the recipient should be blacklisted.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.recipients.blacklistRecipient(
  {
    recipientId: 1,
    isBlackListed: true,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

### Settlements Resource (`paymish.settlements`)

#### `listSettlements([params], [options])`

Retrieves a list of settlements with optional filtering and pagination.

- `params (Object, Optional)`
  - `page (integer, Optional)` — Page number for pagination.
  - `limit (integer, Optional)` — Number of results to return per page.
  - `status (string, Optional)` — Settlement status (e.g., `Paid`, `Unpaid`).
  - `from (string, Optional)` — Settlement date on or after this day (`YYYY-MM-DD`).
  - `to (string, Optional)` — Settlement date on or before this day (`YYYY-MM-DD`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const settlements = await paymish.settlements.listSettlements(
  {
    page: 1,
    limit: 10,
    status: "Paid",
    from: "2026-01-01",
    to: "2026-10-31",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `listSettlementTransactions(reference, [params], [options])`

Retrieves a list of transactions associated with a specific settlement reference.

- `reference (string | Object, Required)` — The settlement reference string (e.g., `PAY_xxx`) or an options object containing `reference`.
- `params (Object, Optional)`
  - `page (integer, Optional)` — Page number for pagination.
  - `limit (integer, Optional)` — Number of results to return per page.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transactions = await paymish.settlements.listSettlementTransactions(
  "PAY_12345",
  {
    page: 1,
    limit: 10,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

### SplitPages Resource (`paymish.splitPages`)

#### `createSplitPage(payload, [options])`

Creates a new split page.

- `payload (Object, Required)`
  - `name (string, Required)` — Name of the split page.
  - `type (string, Required)` — The type of split (e.g., `percentage`, `fixed`).
  - `currency (string, Required)` — Currency code for the split (e.g., `NGN`).
  - `integration (integer, Required)` — Integration identifier for the split.
  - `domain (string, Required)` — Domain associated with the split page.
  - `active (boolean, Required)` — Indicates if the split page is active.
  - `bearer_type (string, Optional)` — Type of bearer associated with the split.
  - `bearer_subaccount (string, Optional)` — Subaccount associated with the bearer.
  - `createdAt (string, Optional)` — Date and time when the split page was created.
  - `updatedAt (string, Optional)` — Date and time when the split page was last updated.
  - `is_dynamic (boolean, Optional)` — Indicates if the split is dynamic.
  - `subaccounts (Array<Object>, Optional)` — Array of subaccounts.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const splitPage = await paymish.splitPages.createSplitPage(
  {
    name: "fdhfdh",
    type: "percentage",
    currency: "NGN",
    integration: 12345,
    domain: "test",
    active: true,
    is_dynamic: true,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getAllSplitPages(params, [options])`

Retrieves a paginated list of all split pages with optional filters.

- `params (Object, Required)`
  - `page (integer, Required)` — The page number to retrieve.
  - `limit (integer, Required)` — The number of items per page.
  - `sort (string, Required)` — Sorting criteria (e.g., `createdAt:desc`).
  - `searchString (string, Optional)` — A search string to filter results.
  - `status (boolean, Optional)` — Filter by status (`true` for active, `false` for inactive).
  - `splitType (string, Optional)` — The type of split (e.g., `percentage`, `fixed`).
  - `category (boolean, Optional)` — Filter by category.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const splitPages = await paymish.splitPages.getAllSplitPages(
  {
    page: 1,
    limit: 10,
    sort: "createdAt:desc",
    status: true,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getSplitPageById(identifier, [options])`

Retrieves a split page by its unique identifier.

- `identifier (number | string | Object, Required)` — Split page ID or an options object containing `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const splitPage = await paymish.splitPages.getSplitPageById(55, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateSplitPage(identifier, payload, [options])`

Updates an existing split page by ID.

- `identifier (number | string | Object, Required)` — Split page ID or an options object containing `id`.
- `payload (Object, Required)` — Update payload containing fields to update (e.g., `{ name: "hi2" }`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const updated = await paymish.splitPages.updateSplitPage(
  55,
  { name: "hi2" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `deleteSplitPage(identifier, [options])`

Deletes a split page by its ID.

- `identifier (number | string | Object, Required)` — Split page ID or an options object containing `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.splitPages.deleteSplitPage(55, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `addSubaccountToSplitPage(identifier, payload, [options])`

Adds a subaccount to an existing split page.

- `identifier (number | string | Object, Required)` — Split page ID or an options object containing `id`.
- `payload (Object, Required)`
  - `share (integer, Required)` — Share of the subaccount.
  - `sub_account_id (string, Required)` — Subaccount code.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.splitPages.addSubaccountToSplitPage(
  55,
  {
    share: 30,
    sub_account_id: "ACCT_123",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `updateSubaccountInSplitPage(identifier, payload, [options])`

Updates a subaccount in an existing split page.

- `identifier (number | string | Object, Required)` — Split page ID or an options object containing `id`.
- `payload (Object, Required)`
  - `share (integer, Required)` — Share of the subaccount.
  - `sub_account_id (string, Required)` — Subaccount code.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.splitPages.updateSubaccountInSplitPage(
  55,
  {
    share: 40,
    sub_account_id: "ACCT_123",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `deleteSubaccountFromSplitPage(identifier, [options])`

Removes a subaccount from a split page.

- `identifier (number | string | Object, Required)` — Split page ID or an options object containing id.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.splitPages.deleteSubaccountFromSplitPage(55, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

### Subaccounts Resource (`paymish.subaccounts`)

#### `createSubaccount(payload, [options])`

Creates a new subaccount.

- `payload (Object, Required)`
  - `business_name (string, Required)` — Name of the business associated with the subaccount.
  - `account_number (string, Required)` — Account number of the subaccount.
  - `percentage_charge (integer, Required)` — Percentage charge for the subaccount.
  - `currency (string, Required)` — Currency code for the subaccount (e.g., `NGN`).
  - `bank (integer, Required)` — Code representing the bank associated with the subaccount.
  - `account_name (string, Required)` — Account name of the subaccount.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const subaccount = await paymish.subaccounts.createSubaccount(
  {
    business_name: "dfsdhjfgdsjfd",
    account_number: "1234567890",
    percentage_charge: 10,
    currency: "NGN",
    bank: 999004,
    account_name: "new",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getAllSubaccounts(params, [options])`

Retrieves a paginated list of all subaccounts with required and optional filters.

- `params (Object, Required)`
  - `page (integer, Required)` — The page number to retrieve.
  - `limit (integer, Required)` — The number of items per page.
  - `sort (string, Required)` — Sorting criteria (e.g., `ASC`, `DESC`).
  - `sortKey (string, Required)` — The key/field to sort by (e.g., `createdAt`).
  - `searchString (string, Optional)` — A search string to filter results.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const subaccounts = await paymish.subaccounts.getAllSubaccounts(
  {
    page: 1,
    limit: 10,
    sort: "DESC",
    sortKey: "createdAt",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getSubaccountById(identifier, [options])`

Retrieves a subaccount by its unique identifier.

- `identifier (number | string | Object, Required)` — Subaccount ID or an options object containing `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const subaccount = await paymish.subaccounts.getSubaccountById(1, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateSubaccount(identifier, payload, [options])`

Updates an existing subaccount by ID.

- `identifier (number | string | Object, Required)` — Subaccount ID or an options object containing `id`.
- `payload (Object, Required)` — Update payload containing fields to update (e.g., `{ percentage_charge: 2, active: true }`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const updated = await paymish.subaccounts.updateSubaccount(
  1,
  { percentage_charge: 2, active: true },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `deleteSubaccount(identifier, [options])`

Deletes a subaccount by its unique identifier.

- `identifier (number | string | Object, Required)` — Subaccount ID or an options object containing `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.subaccounts.deleteSubaccount(1, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

### Subscription Resource (`paymish.subscription`)

#### `getAllSubscriptions(params, [options])`

Retrieves a paginated list of all subscriptions with optional query filters.

- `params (Object, Optional)`
  - `page (integer, Optional)` — Page number for pagination.
  - `limit (integer, Optional)` — Number of records per page.
  - `name (string, Optional)` — Filter subscriptions by name.
  - `status (string, Optional)` — Filter subscriptions by status (e.g., `active`, `expired`).
  - `amount (number, Optional)` — Filter subscriptions by amount.
  - `expiry_start (string, Optional)` — Filter subscriptions expiring after a specific date.
  - `expiry_end (string, Optional)` — Filter subscriptions expiring before a specific date.
  - `sort (string, Optional)` — Sort subscriptions by a specific field (e.g., `createdAt`).
  - `order (string, Optional)` — Sort order (`asc` for ascending, `desc` for descending).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const subscriptions = await paymish.subscription.getAllSubscriptions(
  {
    page: 1,
    limit: 10,
    status: "active",
    sort: "createdAt",
    order: "desc",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `createSubscription(payload, [options])`

Creates a new subscription.

- `payload (Object, Required)`
  - `planId (number, Required)` — The ID of the subscription plan.
  - `planName (string, Required)` — The name of the subscription plan.
  - `customerId (string, Required)` — The ID of the customer subscribing.
  - `amount (number, Required)` — The amount charged for the subscription.
  - `nextPaymentDate (string, Required)` — The date of the next payment.
  - `startDate (string, Required)` — The start date of the subscription.
  - `subscriptionCode (string, Required)` — A unique code for the subscription.
  - `paymentCount (integer, Required)` — The number of payments made so far.
  - `interval (string, Required)` — The interval of payments (e.g., `monthly`, `yearly`).
  - `status (string, Required)` — The status of the subscription (e.g., `active`, `canceled`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const subscription = await paymish.subscription.createSubscription(
  {
    planId: 10,
    planName: "Gold Plan",
    customerId: "CUST_123",
    amount: 5000,
    nextPaymentDate: "2026-12-01",
    startDate: "2026-11-01",
    subscriptionCode: "SUB_123",
    paymentCount: 1,
    interval: "monthly",
    status: "active",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getSubscriptionById(identifier, [options])`

Retrieves a subscription by its unique ID.

- `identifier (number | string | Object, Required)` — Subscription ID or an options object containing `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const subscription = await paymish.subscription.getSubscriptionById(1, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateSubscription(identifier, payload, [options])`

Updates an existing subscription by ID.

- `identifier (number | string | Object, Required)` — Subscription ID or an options object containing id.
- `payload (Object, Required)` — Update payload containing fields to update (e.g., { status: "canceled" }).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const updated = await paymish.subscription.updateSubscription(
  1,
  { status: "canceled" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `deleteSubscription(identifier, [options])`

Deletes a subscription by its unique ID.

- `identifier (number | string | Object, Required)` — Subscription ID or an options object containing `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.subscription.deleteSubscription(1, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

### Transaction Resource (`paymish.transaction`)

#### `getAllTransactions(params, [options])`

Retrieves a paginated list of all transactions with optional query filters.

- `params (Object, Optional)`
  - `page (integer, Optional)` — Page number for pagination.
  - `limit (integer, Optional)` — Number of records per page.
  - `status (string, Optional)` — Filter transactions by status.
  - `reference (string, Optional)` — Filter by transaction reference.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transactions = await paymish.transaction.getAllTransactions(
  {
    page: 1,
    limit: 10,
    status: "success",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getTransactionByReference(params, [options])`

Retrieves details of a specific transaction by its reference.

- `params (Object, Required)`
  - `businessId (integer, Required)` — Business ID.
  - `reference (string, Required)` — Transaction reference.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transaction = await paymish.transaction.getTransactionByReference(
  {
    businessId: 8,
    reference: "TXN_12345",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getTransactionDetails(params, [options])`

Retrieves transaction details using a business ID and reference or ID.

- `params (Object, Required)`
  - `businessId (integer, Required)` — Business ID.
  - `reference (string, Optional)` — Transaction reference.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const details = await paymish.transaction.getTransactionDetails(
  {
    businessId: 8,
    reference: "TXN_12345",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `transactionWithCard(payload, [options])`

Creates a transaction using a card payment channel.

- `payload (Object, Required)`
  - `businessId (integer, Required)` — ID of the business.
  - `customerId (integer, Required)` — ID of the customer.
  - `amount (number, Required)` — Amount of the transaction.
  - `cardNumber (string, Required)` — Card number.
  - `expiryMonth (string, Required)` — Card expiry month.
  - `expiryYear (string, Required)` — Card expiry year.
  - `cvv (string, Required)` — Card CVV.
  - `channel (string, Optional)` — Channel of the transaction (e.g., `card`).
  - `ipAddress (string, Optional)` — IP address of the transaction.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transaction = await paymish.transaction.transactionWithCard(
  {
    businessId: 8,
    customerId: 165,
    amount: 152,
    cardNumber: "4111111111111111",
    expiryMonth: "12",
    expiryYear: "28",
    cvv: "123",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `transactionWithNdd(payload, [options])`

Creates a transaction with NDD (Direct Debit).

- `payload (Object, Required)`
  - `businessId (integer, Required)` — ID of the business.
  - `customerId (integer, Required)` — ID of the customer.
  - `planId (integer, Required)` — ID of the plan.
  - `channel (string, Required)` — Channel of the transaction.
  - `amount (number, Required)` — Amount of the transaction.
  - `ndd (Object, Required)` — NDD details object.
  - `ipAddress (string, Optional)` — IP address of the transaction.
  - `fees (number, Optional)` — Fees associated with the transaction.
  - `message (string, Optional)` — Message associated with the transaction.
  - `isLive (boolean, Optional)` — Flag indicating if the transaction is live.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transaction = await paymish.transaction.transactionWithNdd(
  {
    businessId: 8,
    customerId: 165,
    planId: 10,
    channel: "NDD",
    amount: 152,
    ndd: { mandateId: "MND_123" },
    message: "Test message",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `transactionWithQr(payload, [options])`

Initiates a transaction with a QR code.

- `payload (Object, Required)`
  - `businessId (integer, Required)` — Unique identifier for the business.
  - `customerId (integer, Required)` — Unique identifier for the customer.
  - `planId (integer, Required)` — Unique identifier for the plan.
  - `channel (string, Required)` — The channel through which the transaction is made.
  - `amount (number, Required)` — Amount of the transaction.
  - `mch_no (string, Required)` — Merchant number.
  - `sub_mch_no (string, Required)` — Sub-merchant number.
  - `ipAddress (string, Optional)` — IP address of the customer.
  - `fees (number, Optional)` — Fees associated with the transaction.
  - `message (string, Optional)` — Additional message or information.
  - `isLive (boolean, Optional)` — Indicates if the transaction is in a live environment.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transaction = await paymish.transaction.transactionWithQr(
  {
    businessId: 8,
    customerId: 165,
    planId: 10,
    channel: "NQR",
    amount: 152,
    mch_no: "M0000005463",
    sub_mch_no: "S0000007263",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getBankList(params, [options])`

Retrieves the list of banks.

- `params (Object, Optional)`
  - `isLive (boolean, Optional)` — Flag to indicate if the environment is live.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const banks = await paymish.transaction.getBankList(
  { isLive: true },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `transactionWithBank(payload, [options])`

Creates a transaction with a bank.

- `payload (Object, Required)`
  - `businessId (integer, Required)` — ID of the business.
  - `customerId (integer, Required)` — ID of the customer.
  - `channel (string, Required)` — Channel of the transaction.
  - `amount (number, Required)` — Amount of the transaction.
  - `AccountNumber (string, Required)` — Account number for the transaction.
  - `DestinationInstitutionCode (string, Required)` — Institution code of the destination bank.
  - `pageId (integer, Optional)` — ID of the page.
  - `orderId (integer, Optional)` — ID of the order.
  - `ipAddress (string, Optional)` — IP address associated with the transaction.
  - `fees (number, Optional)` — Fees associated with the transaction.
  - `message (string, Optional)` — Message associated with the transaction.
  - `location (string, Optional)` — Location coordinates.
  - `isLive (boolean, Optional)` — Flag indicating if the transaction is live.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transaction = await paymish.transaction.transactionWithBank(
  {
    businessId: 18,
    customerId: 8,
    channel: "NIBSS",
    amount: 100,
    AccountNumber: "1780004070",
    DestinationInstitutionCode: "999998",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `verifyBankDetails(payload, [options])`

Verifies bank details (account number and destination institution code).

- `payload (Object, Required)`
  - `DestinationInstitutionCode (string, Required)` — Institution code of the destination bank.
  - `AccountNumber (string, Required)` — Account number to verify.
  - `isLive (boolean, Optional)` — Flag indicating if the verification is live.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const verification = await paymish.transaction.verifyBankDetails(
  {
    DestinationInstitutionCode: "999998",
    AccountNumber: "0051762787",
    isLive: false,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `transactionWithUssd(payload, [options])`

Creates a transaction with USSD.

- `payload (Object, Required)`
  - `businessId (integer, Required)` — ID of the business.
  - `customerId (integer, Required)` — ID of the customer.
  - `channel (string, Required)` — Channel of the transaction.
  - `amount (number, Required)` — Amount of the transaction.
  - `pageId (integer, Optional)` — ID of the page.
  - `orderId (integer, Optional)` — ID of the order.
  - `ipAddress (string, Optional)` — IP address associated with the transaction.
  - `fees (number, Optional)` — Fees associated with the transaction.
  - `message (string, Optional)` — Message associated with the transaction.
  - `location (string, Optional)` — Location coordinates.
  - `isLive (boolean, Optional)` — Flag indicating if the transaction is live.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transaction = await paymish.transaction.transactionWithUssd(
  {
    businessId: 18,
    customerId: 8,
    channel: "USSD",
    amount: 100,
    message: "message",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `verifyUssdTransaction(payload, [options])`

Verifies a transaction initiated with USSD.

- `payload (Object, Required)`
  - `ussdTransactionId (string, Required)` — The USSD transaction ID to verify.
  - `isLive (boolean, Optional)` — Flag indicating if the verification is live.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const verification = await paymish.transaction.verifyUssdTransaction(
  {
    ussdTransactionId: "24091010410290301050",
    isLive: false,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `refundTransaction(payload, [options])`

Refunds a transaction by transaction reference.

- `payload (Object, Required)`
  - `transactionRef (string, Required)` — The reference ID of the transaction to be refunded.
  - `amount (number, Required)` — Amount to refund.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const refund = await paymish.transaction.refundTransaction(
  {
    transactionRef: "TXN_waTjNBitbamwNnLuavU1xd",
    amount: 100,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getRefundList(params, [options])`

Retrieves a paginated list of refunds with query filters.

- `params (Object, Required)`
  - `businessId (integer, Required)` — Business ID.
  - `limit (integer, Required)` — Limit of records per page.
  - `page (integer, Required)` — Current page number.
  - `status (string, Optional)` — Refund status.
  - `amount (number, Optional)` — Amount.
  - `filterAmount (string, Optional)` — Filter amount modifier (`gt`, `lt`, `eq`).
  - `from (string, Optional)` — From date (ISO 8601).
  - `refundRefId (string, Optional)` — Refund ID or reference.
  - `to (string, Optional)` — To date (ISO 8601).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const refunds = await paymish.transaction.getRefundList(
  {
    businessId: 100,
    limit: 10,
    page: 1,
    status: "completed",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getRefundDetails(params, [options])`

Retrieves refund details using a business ID and either a transaction reference or a refund ID.

- `params (Object, Required)`
  - `businessId (integer, Required)` — Business ID.
  - `reference (string, Optional)` — Transaction reference.
  - `refundId (string, Optional)` — Refund ID.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const details = await paymish.transaction.getRefundDetails(
  {
    businessId: 100,
    reference: "TXN_waTjNBitbamwNnLuavU1xd",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getRefundByReference(params, [options])`

Retrieves refund details by business ID and refund reference.

- `params (Object, Required)`
  - `businessId (integer, Required)` — Business ID.
  - `reference (string, Required)` — Refund reference.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const refund = await paymish.transaction.getRefundByReference(
  {
    businessId: 100,
    reference: "REF_98765",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `verifyAccount(payload, [options])`

Verifies an account (e.g. for card refunds or account resolution).

- `payload (Object, Required)`
  - `bankCode (string, Required)` — Bank code.
  - `accountNumber (string, Required)` — Account number.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const verification = await paymish.transaction.verifyAccount(
  {
    bankCode: "058",
    accountNumber: "1234567890",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getDebitAccounts(params, [options])`

Retrieves debit accounts with balances.

- `params (Object, Optional)`
  - `isLive (string|boolean, Optional)` — Live mode flag (true/false).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const accounts = await paymish.transaction.getDebitAccounts(
  { isLive: "true" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getScheduledTransactions(params, [options])`

Retrieves scheduled transactions.

- `params (Object, Required)`
  - `scheduleId (string, Required)` — Schedule ID.
  - `isLive (string|boolean, Optional)` — Live mode flag (true/false).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const scheduled = await paymish.transaction.getScheduledTransactions(
  {
    scheduleId: "sch_123",
    isLive: "true",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

### Transactions Resource (`paymish.transactions`)

#### `verifyTransaction(reference, [options])`

Verifies a transaction by its reference.

- `reference (string, Required)` — The transaction reference used to initiate the transaction.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const verification = await paymish.transactions.verifyTransaction(
  "TXN_waTjNBitbamwNnLuavU1xd",
  {
    headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
  },
);
```

#### `getTransactionStatistics([params], [options])`

Retrieves transaction statistics.

- `params (Object, Optional)` — Optional query parameters.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const statistics = await paymish.transactions.getTransactionStatistics(
  {},
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `exportTransactionsCsv([params], [options])`

Exports transactions as a CSV list.

- `params (Object, Optional)`
  - `businessId (integer, Optional)` — Business ID.
  - `status (string, Optional)` — Filter transactions by status.
  - `from (string, Optional)` — From date.
  - `to (string, Optional)` — To date.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const exportResult = await paymish.transactions.exportTransactionsCsv(
  { businessId: 18, status: "success" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `listPayPlusBanks([params], [options])`

Lists PayPlus banks.

- `params (Object, Optional)` — Optional query parameters.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const banks = await paymish.transactions.listPayPlusBanks(
  {},
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `fetchTransaction(id, [options])`

Fetches a transaction by its ID.

- `id (integer|string, Required)` — An ID for the transaction to fetch.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transaction = await paymish.transactions.fetchTransaction(42, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

### Transfer Resource (`paymish.transfer`)

#### `getAllBanks(params, [options])`

Retrieves the list of banks for transfers.

- `params (Object, Optional)` — Optional query parameters.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const banks = await paymish.transfer.getAllBanks(
  {},
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `createSingleTransfer(payload, [options])`

Initiates a single transfer to a user.

- `payload (Object, Required)`
  - `amount (number, Required)` — Amount to be transferred, in the smallest currency unit (e.g., cents).
  - `bankCode (string, Required)` — Code of the bank where the recipient's account is held.
  - `bankName (string, Optional)` — Name of the bank where the recipient's account is held.
  - `accountNumber (string, Required)` — Recipient's bank account number.
  - `accountName (string, Required)` — Name associated with the recipient's bank account.
  - `emailAddress (string, Required)` — Email address for sending transfer notifications.
  - `transferNote (string, Optional)` — Optional note or memo for the transfer.
  - `transferReference (string, Required)` — Unique reference for the transfer transaction.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transfer = await paymish.transfer.createSingleTransfer(
  {
    amount: 1000,
    bankCode: "999998",
    bankName: "Zenith Bank",
    accountNumber: "0051762787",
    accountName: "Test Account",
    emailAddress: "email@example.com",
    transferNote: "Payment for invoice #1234",
    transferReference: "INV1234TRANS5678",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getTransferList(params, [options])`

Retrieves a paginated list of transfers with required and optional query filters.

- `params (Object, Required)`
  - `businessId (integer, Required)` — The unique identifier of the business.
  - `limit (integer, Required)` — The maximum number of records to return.
  - `page (integer, Required)` — The current page number for pagination.
  - `transferReference (string, Optional)` — The reference number of the transfer.
  - `status (string, Optional)` — The status of the transfer (e.g., `Successful`, `Failed`, `Pending`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transfers = await paymish.transfer.getTransferList(
  {
    businessId: 18,
    limit: 10,
    page: 1,
    status: "Successful",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getBalance(params, [options])`

Retrieves the transfer balance for a business.

- `params (Object, Required)`
  - `businessId (integer, Required)` — The unique identifier of the business.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const balance = await paymish.transfer.getBalance(
  { businessId: 18 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getTransferDetails(params, [options])`

Retrieves transfer details.

- `params (Object, Required)`
  - `transferCode (string, Required)` — The unique code of the transfer.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const details = await paymish.transfer.getTransferDetails(
  { transferCode: "TRF_12345" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `submitBulkTransfer(payload, [options])`

Submits a bulk transfer.

- `payload (Object, Required)`
  - `debitBankCode (string, Required)` — The bank code from which funds are debited.
  - `debitAccountNumber (string, Required)` — The account number from which funds are debited.
  - `data (Array[Object], Required)` — Array of transfer items.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const bulkTransfer = await paymish.transfer.submitBulkTransfer(
  {
    debitBankCode: "998",
    debitAccountNumber: "0112345678",
    data: [
      {
        accountNumber: "0051762787",
        bankCode: "999998",
        amount: 1000,
        accountName: "User One",
        emailAddress: "one@example.com",
        transferReference: "TRF_01",
      },
    ],
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

### Transfers Resource (`paymish.transfers`)

#### `listTransfers([params], [options])`

Retrieves a list of transfers.

- `params (Object, Optional)` — Optional query parameters (e.g., `page`, `limit`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transfers = await paymish.transfers.listTransfers(
  { page: 1, limit: 10 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `listRecipients([params], [options])`

Retrieves a list of recipients.

- `params (Object, Optional)` — Optional query parameters (e.g., `page`, `limit`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const recipients = await paymish.transfers.listRecipients(
  { page: 1, limit: 10 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

### Utility Resource (`paymish.utility`)

#### `fetchBillerGroups([params], [options])`

Fetches biller groups.

- `params (Object, Optional)` — Optional query parameters.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const billerGroups = await paymish.utility.fetchBillerGroups(
  {},
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `fetchBillersByGroupId(groupId, [options])`

Fetches billers by biller group ID.

- `groupId (number|string, Required)` — The ID of the biller group.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const billers = await paymish.utility.fetchBillersByGroupId(5, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `fetchPackagesByBillerId(billerId, [options])`

Fetches packages by biller ID.

- `billerId (number|string, Required)` — The ID of the biller.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const packages = await paymish.utility.fetchPackagesByBillerId(101, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `customerLookup(payload, [options])`

Performs a customer lookup for utilities.

- `payload (Object, Required)`
  - `customerId (string, Optional)` — Customer ID.
  - `billerId (number, Optional)` — Biller ID.
  - `productName (string, Optional)` — Product name.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const customer = await paymish.utility.customerLookup(
  {
    customerId: "0101160313181",
    billerId: 1,
    productName: "PREPAID",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `processPayment(payload, [options])`

Processes a utility payment.

- `payload (Object, Required)`
  - `paymentReference (string, Optional)` — Payment reference.
  - `customerId (string, Optional)` — Customer ID.
  - `packageSlug (string, Optional)` — Package slug.
  - `channel (string, Optional)` — Payment channel (e.g., `WEB`).
  - `amount (number, Optional)` — Payment amount.
  - `customerName (string, Optional)` — Customer name.
  - `phoneNumber (string, Optional)` — Customer phone number.
  - `email (string, Optional)` — Customer email address.
  - `accountNumber (string, Optional)` — Account number.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const payment = await paymish.utility.processPayment(
  {
    paymentReference: "5352405452351",
    customerId: "0101160313181",
    packageSlug: "MTN_NIGERIA",
    channel: "WEB",
    amount: 6800.5,
    customerName: "Tester Example",
    phoneNumber: "23480812345",
    email: "tester.example@sample.com",
    accountNumber: "0012345678",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `paymentLookup(params, [options])`

Performs a payment lookup for utilities.

- `params (Object, Required)`
  - `paymentReference (string, Required)` — Payment reference.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const lookup = await paymish.utility.paymentLookup(
  { paymentReference: "5352405452351" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

### Virtual Accounts Resource (`paymish.virtualAccounts`)

#### `listVirtualAccounts([params], [options])`

Retrieves a list of virtual accounts.

- `params (Object, Optional)` — Optional query parameters (e.g., `page`, `limit`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const virtualAccounts = await paymish.virtualAccounts.listVirtualAccounts(
  { page: 1, limit: 10 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `createVirtualAccount(payload, [options])`

Creates a virtual account.

- `payload (Object, Required)` — Virtual account creation payload (e.g., `accountName`, `bvn`, `email`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const newAccount = await paymish.virtualAccounts.createVirtualAccount(
  {
    accountName: "John Doe",
    bvn: "22222222222",
    email: "john@example.com",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

#### `getVirtualAccount(id, [options])`

Retrieves virtual account details by ID.

- `id (string|number, Required)` — The unique identifier of the virtual account.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const account = await paymish.virtualAccounts.getVirtualAccount("va_123", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateVirtualAccount(id, payload, [options])`

Updates a virtual account by ID.

- `id (string|number, Required)` — The unique identifier of the virtual account.
- `payload (Object, Required)` — Update payload (e.g., `accountName`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const updatedAccount = await paymish.virtualAccounts.updateVirtualAccount(
  "va_123",
  { accountName: "Updated Name" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } },
);
```

---

## Error Handling

All API-level failures, non-JSON response errors, and request timeouts throw a `PaymishError`.

```javascript
const Paymish = require("paymish-node.js-sdk");
const { PaymishError } = Paymish;

try {
  await paymish.business.getDetails();
} catch (error) {
  if (error instanceof PaymishError) {
    console.log(error.name); // "PaymishError"
    console.log(error.statusCode); // e.g., 400, 401, 408, 500
    console.log(error.message); // Human-readable error message
    console.log(error.errors); // Additional error details or server validation payload
    console.log(error.requestData); // Sanitized request payload (sensitive keys automatically redacted)
  }
}
```

---

## Advanced Per-Request Configuration

SDK resource methods accept an optional `options` argument that allows overriding headers or request timeout settings for single calls:

```javascript
await paymish.business.getDetails({
  headers: {
    Authorization: "Bearer YOUR_SECRET_KEY",
    "X-Custom-Header": "CustomValue",
  },
  customTimeout: 3000, // Enforce a 3-second timeout for this request only
});
```

---

## License

This project is licensed under the [ISC](https://www.isc.org/) License.
