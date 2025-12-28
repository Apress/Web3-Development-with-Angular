import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContractService } from '../../services/contract.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-simple-storage',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './simple-storage.html',
  styleUrl: './simple-storage.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleStorage {
  contract = inject(ContractService);
  wallet = inject(WalletService);
  
  inputValue = new FormControl<number>(0, {
    validators: [Validators.required],
    nonNullable: true,
  });

  async update() {
    if (this.inputValue.invalid) return;
    
    try {
      await this.contract.setValue(this.inputValue.value);
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
