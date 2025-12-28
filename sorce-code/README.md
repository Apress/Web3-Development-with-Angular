# Angular 20 + Hardhat 2.9.9 dApp Starter

A minimal local-only starter that shows how to:
- compile & deploy a Solidity (0.7.3) contract with Hardhat 2.9.9
- connect an Angular 20 app to a local RPC
- read/write contract state with ethers **v6** in the frontend
- listen to on-chain events in real time

> Note: Hardhat's deploy script uses ethers **v5** via `@nomiclabs/hardhat-ethers`.  
> Your Angular app uses ethers **v6**. This split is intentional and safe.

## Prereqs
- Node LTS
- npm (or yarn/pnpm)
- Angular CLI (`npm i -g @angular/cli`)
- MetaMask (for local testing)

## Quick start

### 1) Contracts
```bash
cd smart-contracts
cp .env.example .env          # not required for local, handy later
npm install
npx hardhat compile
npx hardhat node
# in a new terminal:
npx hardhat run scripts/deploy.js --network localhost
