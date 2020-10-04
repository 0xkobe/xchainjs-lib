require('dotenv').config()
import * as Bitcoin from 'bitcoinjs-lib'
import { Client, Network } from '../src/client'
import * as asgardexCrypto from '@thorchain/asgardex-crypto'

describe('BitcoinClient Test', () => {
  const net = Network.MAIN
  // const phrase = process.env.VAULT_PHRASE as string
  const phrase = 'chest system bird during town upgrade goddess state enjoy pattern earn pepper'
  // const electrsAPI = process.env.ELECTRS_API as string
  const nodeUrl = 'https://api.blockchair.com/bitcoin/testnet'
  const nodeApiKey = ''
  const btcClient = new Client(net, nodeUrl, nodeApiKey)
  let address: string
  const valueOut = 1690843
  const MEMO = 'SWAP:THOR.RUNE'
  // please don't touch the tBTC in these
  const phraseOne = 'cycle join secret hospital slim party write price myth okay long slight'
  const addyOne = 'tb1qvgn58ktpaacpzp6w8fdjgk9dfgv28gytvvhd5a'
  const phraseTwo = 'heavy spin someone rice laptop minor dice deal fever praise reject panic'
  const addyTwo = 'tb1qmyq44gzke8vzzj0npun6xla4anj92ghqn0g0qn'

  it('should have the correct bitcoin network right prefix', () => {
    const network = btcClient.getNetwork() == Network.TEST ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    expect(network.bech32).toEqual('bc')
  })

  it('should update net', () => {
    const net = Network.TEST
    btcClient.setNetwork(net)
    const network = btcClient.getNetwork() == Network.TEST ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    expect(network.bech32).toEqual('tb')
  })

  it('should generate a valid phrase', () => {
    const _phrase = btcClient.generatePhrase()
    const valid = asgardexCrypto.validatePhrase(_phrase)
    expect(valid).toBeTruthy()
  })

  it('should throw an error for setting a bad phrase', () => {
    if (phrase) {
      expect(() => {
        btcClient.setPhrase('cat')
      }).toThrow()
    }
  })

  it('should not throw an error for setting a good phrase', () => {
    if (phrase) {
      expect(btcClient.setPhrase(phrase)).toBeUndefined
    }
  })

  it('should validate the right address', () => {
    address = btcClient.getAddress()
    const valid = btcClient.validateAddress(address)
    // expect(address).toEqual('tb1qzglk2c42q376utfc2dejwktvmr57yxfja0edrp')
    expect(address).toEqual('2N9Xjg73CkbUtEJA5uA3nrXKczBG751KgEE')
    expect(valid).toBeTruthy()
  })

  it('should get the right balance', async () => {
    const balance = await btcClient.getBalance()
    expect(balance).toEqual(valueOut)
  })

  it('should get the right balance when scanUTXOs is called twice', async () => {
    const net = Network.TEST
    btcClient.purgeClient()
    btcClient.setNetwork(net)
    btcClient.setPhrase(phrase)
    const balance = await btcClient.getBalance()
    expect(balance).toEqual(valueOut)
    const newBalance = await btcClient.getBalance()
    expect(newBalance).toEqual(valueOut)
  })

  // it('should get the right history', async () => {
  //   const net = Network.TEST
  //   btcClient.purgeClient()
  //   btcClient.setNetwork(net)
  //   btcClient.setPhrase(phrase)
  //   address = btcClient.getAddress()
  //   const txArray = await btcClient.getTransactions(address)
  //   expect(txArray[1].txid).toEqual('7fc1d2c1e4017a6aea030be1d4f5365d11abfd295f56c13615e49641c55c54b8')
  // })

  it('should broadcast a normal transfer', async () => {
    const net = Network.TEST
    btcClient.purgeClient()
    btcClient.setNetwork(net)
    btcClient.setPhrase(phraseOne)
    const txid = await btcClient.transfer({ asset: 'BTC.BTC', recipient: addyTwo, amount: 2223, feeRate: 1 })
    expect(txid).toEqual(expect.any(String))
  })

  it('should purge phrase and utxos', async () => {
    btcClient.purgeClient()
    expect(() => {
      btcClient.getAddress()
    }).toThrow('Phrase not set')
    expect(async () => {
      await btcClient.getBalance()
    }).rejects.toThrow('Phrase not set')
  })

  it('should do broadcast a vault transfer with a memo', async () => {
    const net = Network.TEST
    btcClient.purgeClient()
    btcClient.setNetwork(net)
    btcClient.setPhrase(phraseTwo)
    const txid = await btcClient.transfer({
      asset: 'BTC.BTC',
      recipient: addyOne,
      amount: 2223,
      memo: MEMO,
      feeRate: 1,
    })
    expect(txid).toEqual(expect.any(String))
  })

  it('should get the balance of an address without phrase', async () => {
    const balance = await btcClient.getBalance(address)
    expect(balance).toEqual(valueOut)
  })

  it('should prevent a tx when fees and valueOut exceed balance', async () => {
    const net = Network.TEST
    btcClient.purgeClient()
    btcClient.setNetwork(net)
    btcClient.setPhrase(phraseOne)
    expect(
      async () => await btcClient.transfer({ asset: 'BTC.BTC', recipient: addyTwo, amount: 9999999999, feeRate: 1 }),
    ).rejects.toThrow('Balance insufficient for transaction')
  })

  it('should return estimated fees of a normal tx', async () => {
    const net = Network.TEST
    btcClient.setNetwork(net)
    btcClient.setPhrase(phrase)
    const estimates = await btcClient.getFees()
    expect(estimates['fast']).toEqual(expect.any(Number))
    expect(estimates['slow']).toEqual(expect.any(Number))
  })

  it('should return estimated fees of a vault tx that are more expensive than a normal tx', async () => {
    const net = Network.TEST
    btcClient.purgeClient()
    btcClient.setNetwork(net)
    btcClient.setPhrase(phrase)
    const normalTx = await btcClient.getFees()
    const vaultTx = await btcClient.getFeesWithMemo(MEMO)
    const normalTxFee = normalTx['fast']
    const vaultTxFee = vaultTx['fast']
    expect(vaultTxFee).toBeGreaterThan(normalTxFee)
  })

  // it('should calculate average block publish time', async () => {
  //   const blockTimes = await btcClient.getBlockTime()
  //   expect(blockTimes).toBeGreaterThan(1)
  // })

  it('should error when an invalid address is provided', async () => {
    const net = Network.TEST
    btcClient.purgeClient()
    btcClient.setNetwork(net)
    btcClient.setPhrase(phrase)
    const invalidAddress = '23vasdvaxc465sddf23'
    expect(async () => await btcClient.getBalance(invalidAddress)).rejects.toThrow('Invalid address')
    // expect(async () => await btcClient.getTransactions(invalidAddress)).rejects.toThrow('Invalid address')
    expect(
      async () => await btcClient.transfer({ asset: 'BTC.BTC', recipient: invalidAddress, amount: 99000, feeRate: 1 }),
    ).rejects.toThrow('Invalid address')
  })
})
