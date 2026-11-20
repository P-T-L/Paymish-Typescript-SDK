import HttpClient, { type HttpClientOptions } from "./client.js";
import { PaymishError } from "./errors.js";
import Auth from "./resources/auth.js";
import Banks from "./resources/banks.js";
import Business from "./resources/business.js";
import Customer from "./resources/customer.js";
import DedicatedVirtualAccount from "./resources/dedicated-virtual-account.js";
import Dispute from "./resources/dispute.js";
import InitializeCheckout from "./resources/initialize-checkout.js";
import Invoices from "./resources/invoices.js";
import PaymentPages from "./resources/payment-pages.js";
import Plans from "./resources/plans.js";
import Products from "./resources/products.js";
import Recipients from "./resources/recipients.js";
import Settlements from "./resources/settlements.js";
import SplitPages from "./resources/split-pages.js";
import Subaccounts from "./resources/subaccounts.js";
import Subscription from "./resources/subscription.js";
import Transaction from "./resources/transaction.js";
import TransactionCustomer from "./resources/transaction-customer.js";
import TransactionDisputes from "./resources/transaction-disputes.js";
import Transactions from "./resources/transactions.js";
import Transfer from "./resources/transfer.js";
import Transfers from "./resources/transfers.js";
import Utility from "./resources/utility.js";
import VirtualAccounts from "./resources/virtual-accounts.js";

export class Paymish {
  private readonly client: HttpClient;

  public readonly auth: Auth;
  public readonly business: Business;
  public readonly customer: Customer;
  public readonly transactionCustomer: TransactionCustomer;
  public readonly dedicatedVirtualAccount: DedicatedVirtualAccount;
  public readonly banks: Banks;
  public readonly dispute: Dispute;
  public readonly transactionDisputes: TransactionDisputes;
  public readonly initializeCheckout: InitializeCheckout;
  public readonly invoices: Invoices;
  public readonly paymentPages: PaymentPages;
  public readonly plans: Plans;
  public readonly products: Products;
  public readonly recipients: Recipients;
  public readonly settlements: Settlements;
  public readonly splitPages: SplitPages;
  public readonly subaccounts: Subaccounts;
  public readonly subscription: Subscription;
  public readonly transaction: Transaction;
  public readonly transactions: Transactions;
  public readonly transfer: Transfer;
  public readonly transfers: Transfers;
  public readonly utility: Utility;
  public readonly virtualAccounts: VirtualAccounts;

  constructor(options: HttpClientOptions = {}) {
    this.client = new HttpClient(options);

    this.auth = new Auth(this.client);
    this.business = new Business(this.client);
    this.customer = new Customer(this.client);
    this.transactionCustomer = new TransactionCustomer(this.client);
    this.dedicatedVirtualAccount = new DedicatedVirtualAccount(this.client);
    this.banks = new Banks(this.client);
    this.dispute = new Dispute(this.client);
    this.transactionDisputes = new TransactionDisputes(this.client);
    this.initializeCheckout = new InitializeCheckout(this.client);
    this.invoices = new Invoices(this.client);
    this.paymentPages = new PaymentPages(this.client);
    this.plans = new Plans(this.client);
    this.products = new Products(this.client);
    this.recipients = new Recipients(this.client);
    this.settlements = new Settlements(this.client);
    this.splitPages = new SplitPages(this.client);
    this.subaccounts = new Subaccounts(this.client);
    this.subscription = new Subscription(this.client);
    this.transaction = new Transaction(this.client);
    this.transactions = new Transactions(this.client);
    this.transfer = new Transfer(this.client);
    this.transfers = new Transfers(this.client);
    this.utility = new Utility(this.client);
    this.virtualAccounts = new VirtualAccounts(this.client);
  }
}

export { PaymishError };
export type { HttpClientOptions };
export default Paymish;
