import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContractService } from '../../services/contract.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-simple-storage',
  imports: [
    FormsModule,
  ],
  templateUrl: './simple-storage.html',
  styleUrl: './simple-storage.scss',
})
export class SimpleStorage {
  inputValue = 0;

  constructor(public contract: ContractService, public wallet: WalletService) {
  }

  async update() {
    try {
      await this.contract.setValue(this.inputValue);
    } catch (error) {
      console.error('Failed to update value:', error);
      // Error is logged; UI will show the error state if needed
    }
  }

  async connect() {
    try {
      await this.wallet.connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }

  async disconnect() {
    try {
      await this.wallet.disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }
}
