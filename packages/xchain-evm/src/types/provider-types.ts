import { Address, Balance, Fees, Network, Tx, TxHistoryParams, TxsPage } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'

import { ExplorerProvider } from '../providers/explorer-provider'

import { GasPrices } from './client-types'

export interface OnlineDataProvider {
  getBalance(address: Address, assets?: Asset[]): Promise<Balance[]>
  getTransactions(params: TxHistoryParams): Promise<TxsPage>
  getTransactionData(txId: string, assetAddress?: Address): Promise<Tx>
  getFees(): Promise<Fees>
  estimateGasPrices(): Promise<GasPrices>
}
export type ExplorerProviders = Record<Network, ExplorerProvider>
export type OnlineDataProviders = Record<Network, OnlineDataProvider>
