import { Injectable, signal } from '@angular/core';
import { ethers } from 'ethers';

@Injectable({ providedIn: 'root' })
export class BlockchainService {
  provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  blockNumber = signal<number | null>(null);

  constructor() {
    this.provider.on('block', (n) => {
      this.blockNumber.set(n);
    });
  }
}
