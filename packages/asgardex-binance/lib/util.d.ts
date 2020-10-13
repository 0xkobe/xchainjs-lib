import { Transfer, TransferEvent } from './types/binance-ws';
import { TransferFee, DexFees, Fee, TxType as BinanceTxType } from './types/binance';
import { TxType } from '@asgardex-clients/asgardex-client';
/**
 * Get `hash` from transfer event sent by Binance chain
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 */
export declare const getHashFromTransfer: (transfer?: {
    data?: Pick<Transfer, 'H'>;
}) => string | undefined;
/**
 * Get `hash` from memo
 */
export declare const getTxHashFromMemo: (transfer?: TransferEvent) => string;
/**
 * Type guard for runtime checks of `Fee`
 */
export declare const isFee: (v: Fee | TransferFee | DexFees) => v is Fee;
/**
 * Type guard for `FreezeFee`
 */
export declare const isFreezeFee: (v: Fee | TransferFee | DexFees) => v is Fee;
/**
 * Type guard for `TransferFee`
 */
export declare const isTransferFee: (v: Fee | TransferFee | DexFees) => v is TransferFee;
/**
 * Type guard for `DexFees`
 */
export declare const isDexFees: (v: Fee | TransferFee | DexFees) => v is DexFees;
/**
 * Get TxType
 */
export declare const getTxType: (t: BinanceTxType) => TxType;
