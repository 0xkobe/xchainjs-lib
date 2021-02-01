import nock from 'nock'
import { AddressBalance, Transaction } from '../src/types'

export const mock_getBalance = (url: string, address: string, result: AddressBalance) => {
  nock(url)
    .get(`/address/${address}/balance`)
    .reply(200, result)
}

export const mock_getTransactionData = (url: string, txId: string, txData: Transaction) => {
  nock(url)
    .get(`/transaction/${txId}`)
    .reply(200, txData)
}

export const mock_getTransactions = (url: string, address: string, txs: Transaction[]) => {
  nock(url)
    .get(`/address/${address}/transactions/full`)
    .query((_) => true)
    .reply(200, txs)
}
