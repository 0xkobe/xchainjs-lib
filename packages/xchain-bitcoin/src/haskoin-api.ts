import axios from 'axios'

import { getIsTxConfirmed } from './sochain-api'

const HASKOIN_API_URL = 'https://api.haskoin.com/btc'
const SOCHAIN_API_URL = 'https://sochain.com/api/v2'

export type UtxoData = {
  txid: string
  index: number
  value: number
  pkscript: string
}

export const getUnspentTxs = async (address: string): Promise<UtxoData[]> => {
  const { data: response } = await axios.get(`${HASKOIN_API_URL}/address/${address}/unspent`)

  return response
}

export const getConfirmedUnspentTxs = async (address: string): Promise<UtxoData[]> => {
  try {
    const allUtxos = await getUnspentTxs(address)

    const confirmedUTXOs: UtxoData[] = []

    await Promise.all(
      allUtxos.map(async (tx: UtxoData) => {
        const { is_confirmed: isTxConfirmed } = await getIsTxConfirmed({
          sochainUrl: SOCHAIN_API_URL,
          network: 'mainnet',
          hash: tx.txid,
        })

        if (isTxConfirmed) {
          confirmedUTXOs.push(tx)
        }
      }),
    )

    return confirmedUTXOs
  } catch (error) {
    return Promise.reject(error)
  }
}
