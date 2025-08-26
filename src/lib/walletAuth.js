// Global wallet authentication manager to prevent duplicate calls
class WalletAuthManager {
  constructor() {
    this.authenticatedWallets = new Set();
    this.pendingAuthentications = new Set();
    this.lastAuthTime = 0;
    this.MIN_TIME_BETWEEN_CALLS = 2000; // 2 seconds
  }

  isAuthenticated(address) {
    return this.authenticatedWallets.has(address?.toLowerCase());
  }

  isPending(address) {
    return this.pendingAuthentications.has(address?.toLowerCase());
  }

  canAuthenticate(address) {
    if (!address) return false;

    const normalizedAddress = address.toLowerCase();
    const now = Date.now();
    const timeSinceLastAuth = now - this.lastAuthTime;

    return (
      !this.isAuthenticated(normalizedAddress) &&
      !this.isPending(normalizedAddress) &&
      timeSinceLastAuth >= this.MIN_TIME_BETWEEN_CALLS
    );
  }

  markAsAuthenticated(address) {
    const normalizedAddress = address?.toLowerCase();
    if (normalizedAddress) {
      this.authenticatedWallets.add(normalizedAddress);
      this.pendingAuthentications.delete(normalizedAddress);
    }
  }

  markAsPending(address) {
    const normalizedAddress = address?.toLowerCase();
    if (normalizedAddress) {
      this.pendingAuthentications.add(normalizedAddress);
      this.lastAuthTime = Date.now();
    }
  }

  markAsFailed(address) {
    const normalizedAddress = address?.toLowerCase();
    if (normalizedAddress) {
      this.pendingAuthentications.delete(normalizedAddress);
      // Don't add to authenticated set on failure, so it can be retried
    }
  }

  reset() {
    this.authenticatedWallets.clear();
    this.pendingAuthentications.clear();
    this.lastAuthTime = 0;
  }

  removeWallet(address) {
    const normalizedAddress = address?.toLowerCase();
    if (normalizedAddress) {
      this.authenticatedWallets.delete(normalizedAddress);
      this.pendingAuthentications.delete(normalizedAddress);
    }
  }
}

// Global singleton instance
const walletAuthManager = new WalletAuthManager();

// Development helper - expose to window for debugging
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  window.walletAuthManager = walletAuthManager;
}

export default walletAuthManager;
