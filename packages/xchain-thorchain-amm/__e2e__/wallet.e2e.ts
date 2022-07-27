import { Network } from '@xchainjs/xchain-client'
import { baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'

import { Wallet } from '../src/Wallet'

const testnetWallet = new Wallet(Network.Testnet, process.env.TESTNETPHRASE || 'you forgot to set the phrase')

describe('xchain-swap temp Tests', () => {
  it(`Should show balances `, async () => {
    try {
      const allBalances = await testnetWallet.getAllBalances()

      console.log(JSON.stringify(allBalances, null, 2))
      for (const allBalance of allBalances) {
        console.log(`chain:${allBalance.chain} address: ${allBalance.address}`)
        if (typeof allBalance.balances === 'string') {
          console.log(`error:${allBalance.balances}`)
        } else {
          for (let index = 0; index < allBalance.balances.length; index++) {
            const balance = allBalance.balances[index]
            console.log(
              `${formatAssetAmountCurrency({
                amount: baseToAsset(balance.amount),
                asset: balance.asset,
                trimZeros: true,
              })}`,
            )
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  })
})
