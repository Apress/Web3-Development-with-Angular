import { Injectable, signal } from '@angular/core';

declare global { 
  interface Window { 
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    }
  } 
}

// === Configure the chain you want ===
// For local Hardhat: 31337 (0x7A69)
const REQUIRED_CHAIN_ID_DEC = 31337;
const REQUIRED_CHAIN_ID_HEX = '0x7A69';

// If you later target Sepolia, for example:
// const REQUIRED_CHAIN_ID_DEC = 11155111;
// const REQUIRED_CHAIN_ID_HEX = '0xaa36a7';

@Injectable({ providedIn: 'root' })
export class WalletService {
  account = signal<string | null>(null);
  chainId = signal<string | null>(null);  // hex, e.g. "0x7a69"
  status = signal<string | null>(null);   // optional UX message

  constructor() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accs: unknown) => {
        const accounts = accs as string[];
        this.account.set(accounts[0] ?? null);
      });
      window.ethereum.on('chainChanged', (id: unknown) => {
        this.chainId.set(id as string);
        // optional: hard reload to fully reset providers if you prefer
        // window.location.reload();
      });

      // hydrate silently if already authorized
      this.refreshAccountSilently();
      this.refreshChainId();
    }
  }

  /** Prompts account picker if needed (MetaMask) */
  async connectWallet() {
    if (!window.ethereum) throw new Error('No wallet found');
    // Ask for the permission explicitly so user can pick a different account
    await window.ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    });
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
    this.account.set(accounts[0] ?? null);
    await this.refreshChainId();
  }

  /** Best-effort "disconnect": revoke eth_accounts permission + clear local state */
  async disconnectWallet() {
    if (window.ethereum?.request) {
      try {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch { /* some wallets don’t support revoke */ }
    }
    this.account.set(null);
  }

  /**
   * Ensure the wallet is on the required network.
   * Returns true if already on the right chain or successfully switched/added.
   */
  async ensureCorrectNetwork(): Promise<boolean> {
    if (!window.ethereum) throw new Error('No wallet found');

    const current = await window.ethereum.request({ method: 'eth_chainId' }) as string;
    this.chainId.set(current);

    if (current.toLowerCase() === REQUIRED_CHAIN_ID_HEX.toLowerCase()) {
      return true; // already correct
    }

    this.status.set('Switching network…');

    try {
      // Try to switch
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: REQUIRED_CHAIN_ID_HEX }],
      });
      this.chainId.set(REQUIRED_CHAIN_ID_HEX);
      this.status.set(null);
      return true;
    } catch (err: any) {
      // 4902 = chain not added to the wallet
      if (err?.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: REQUIRED_CHAIN_ID_HEX,
              chainName: 'Hardhat Local',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['http://127.0.0.1:8545'],
              blockExplorerUrls: [],
            }],
          });
          // after adding, try switching again (some wallets auto-switch)
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: REQUIRED_CHAIN_ID_HEX }],
          });
          this.chainId.set(REQUIRED_CHAIN_ID_HEX);
          this.status.set(null);
          return true;
        } catch (addErr) {
          this.status.set('Failed to add/switch network.');
          return false;
        }
      }

      // 4001 = user rejected
      if (err?.code === 4001) {
        this.status.set('Network switch rejected by user.');
        return false;
      }

      this.status.set('Failed to switch network.');
      return false;
    }
  }

  private async refreshAccountSilently() {
    if (!window.ethereum) return;
    const accs = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
    this.account.set(accs[0] ?? null);
  }

  private async refreshChainId() {
    if (!window.ethereum) return;
    const id = await window.ethereum.request({ method: 'eth_chainId' }) as string;
    this.chainId.set(id);
  }

  // Optional helpers
  isOnRequiredNetwork(): boolean {
    return (this.chainId()?.toLowerCase() === REQUIRED_CHAIN_ID_HEX.toLowerCase());
  }
  requiredChainHex(): string { return REQUIRED_CHAIN_ID_HEX; }
  requiredChainDec(): number { return REQUIRED_CHAIN_ID_DEC; }
}
