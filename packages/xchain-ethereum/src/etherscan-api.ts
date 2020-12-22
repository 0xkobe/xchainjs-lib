import axios from 'axios'
import { GasOracleResponse } from './types'

const getApiKeyQueryParameter = (apiKey?: string): string => (!!apiKey ? `&apiKey=${apiKey}` : '')

/**
 * @desc SafeGasPrice, ProposeGasPrice And FastGasPrice returned in string-Gwei
 * @see https://etherscan.io/apis#gastracker
 */
export const getGasOracle = (baseUrl: string, apiKey?: string): Promise<GasOracleResponse> => {
  const url = baseUrl + '/api?module=gastracker&action=gasoracle'

  return axios.get(url + getApiKeyQueryParameter(apiKey)).then((response) => response.data.result)
}
