import { Msg, AccAddress } from 'cosmos-client'
import { StdTxFee } from 'cosmos-client/api'
import { StdSignature } from 'cosmos-client/x/auth'

export type MsgCoin = {
  asset: string
  amount: string
}

export class MsgNativeTx extends Msg {
  coins: MsgCoin[]
  memo: string
  signer: AccAddress
  /**
   *
   * @param from_address
   * @param to_address
   * @param amount
   */
  constructor(coins: MsgCoin[], memo: string, signer: AccAddress) {
    super()

    this.coins = coins
    this.memo = memo
    this.signer = signer
  }
}

/**
 * This creates MsgNativeTx from json.
 *
 * @param value
 * @returns {MsgNativeTx}
 */
export const msgNativeTxFromJson = (value: { coins: MsgCoin[]; memo: string; signer: string }): MsgNativeTx => {
  return new MsgNativeTx(value.coins, value.memo, AccAddress.fromBech32(value.signer))
}

export type AminoWrapping<T> = {
  type: string
  value: T
}

export type ThorchainDepositResponse = AminoWrapping<{
  msg: AminoWrapping<{
    coins: MsgCoin[]
    memo: string
    signer: string
  }>[]
  fee: StdTxFee
  signatures: StdSignature[]
  memo: string
  timeout_height: string
}>
