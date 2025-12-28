import { Injectable, signal } from '@angular/core';
import { ethers, ContractMethod } from 'ethers';
import SimpleStorage from '../../assets/abi/SimpleStorage.json';
import { WalletService } from './wallet.service';

declare global { interface Window { ethereum?: any } }

@Injectable({ providedIn: 'root' })
export class ContractService {
  private provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

  // ⬅️ Replace with your deployed address
  // private readonly address = '0xYourDeployedAddressHere';
  private readonly address = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  private contract = new ethers.Contract(
    this.address,
    (SimpleStorage as any).abi,
    this.provider
  );

  value = signal<number | null>(null);

  constructor(private wallet: WalletService) {
    this.loadValue();

    this.contract.on('DataUpdated', (_old: bigint, newest: bigint) => {
      this.value.set(Number(newest));
    });
  }

  async loadValue() {
    // v6: get the method, then call it
    const getFn: ContractMethod = this.contract.getFunction('get');
    const raw: bigint = await getFn();      // read-only call
    this.value.set(Number(raw));
  }

  async setValue(newValue: number): Promise<void> {
    if (!window.ethereum) throw new Error('Wallet not detected');

    // ✅ ensure correct chain before signing/sending
    const ok = await this.wallet.ensureCorrectNetwork();
    if (!ok) return;

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const c = this.contract.connect(signer);

      const setFn: ContractMethod = c.getFunction('set');
      await setFn.staticCall(newValue);                // simulate
      const tx = await setFn(newValue, { gasLimit: 200_000 }); // send
      await tx.wait();
    } catch (error) {
      console.error('Error setting value:', error);
      throw error;
    }
  }
}
