import axios from 'axios'
import { BlockChairResponse, AddressDTO, Transactions, RawTxs, ChainStatsBtc } from './types/blockchair-api-types'

const setApiKeyParams = (key?: string) => {
  return key && key.length > 0 ? { params: { key: key } } : {}
}

/**
 * https://blockchair.com/api/docs#link_200
 * @param chain
 * @param hash
 */
export const getTx = async (
  baseUrl: string,
  hash: string,
  erc_20?: boolean,
  apiKey?: string,
): Promise<Transactions> => {
  try {
    const response = await axios.get(`${baseUrl}/dashboards/transaction/${hash}`, {
      params: {
        erc_20,
        key: apiKey && apiKey.length > 0 ? apiKey : undefined,
      },
    })
    const txs: BlockChairResponse<Transactions> = response.data
    return txs.data
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * https://blockchair.com/api/docs#link_201
 * @param chain
 * @param hash
 */
export const getRawTx = async (baseUrl: string, hash: string, apiKey?: string): Promise<RawTxs> => {
  try {
    const response = await axios.get(`${baseUrl}/raw/transaction/${hash}`, setApiKeyParams(apiKey))
    const txs: BlockChairResponse<RawTxs> = response.data
    return txs.data
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * https://blockchair.com/api/docs#link_300
 * @param chain
 * @param address
 */
export const getAddress = async (
  baseUrl: string,
  address: string,
  apiKey?: string,
  limit?: number,
  offset?: number,
): Promise<AddressDTO> => {
  try {
    const params: { [key: string]: string | number } = {}
    if (apiKey) params.key = apiKey
    if (limit) {
      if (limit > 10000) throw new Error('Max limit allowed 10000')
      params.limit = limit
    }
    if (offset) {
      if (offset > 1000000) throw new Error('Max offset allowed 1000000')
      params.offset = offset
    }

    const response = await axios.get(`${baseUrl}/dashboards/address/${address}`, { params })
    const addressResponse: BlockChairResponse<AddressDTO> = response.data
    return addressResponse.data
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * https://blockchair.com/api/docs#link_202
 * @param chain
 * @param txHex
 */
export const broadcastTx = async (baseUrl: string, txHex: string, apiKey?: string): Promise<string> => {
  try {
    const response = await axios.post(`${baseUrl}/push/transaction`, { data: txHex }, setApiKeyParams(apiKey))
    return response.data.data.transaction_hash
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * https://blockchair.com/api/docs#link_001
 * @param chain
 */
export const bitcoinStats = async (baseUrl: string, apiKey?: string): Promise<ChainStatsBtc> => {
  try {
    const response = await axios.get(`${baseUrl}/stats`, setApiKeyParams(apiKey))
    const bcRes: BlockChairResponse<ChainStatsBtc> = response.data
    return bcRes.data
  } catch (error) {
    return Promise.reject(error)
  }
}
