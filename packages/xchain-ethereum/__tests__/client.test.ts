import Client from '../src/client'
import { ethers, Wallet, providers } from 'ethers'
import { formatEther, parseEther } from '@ethersproject/units'
import { TransactionResponse, TransactionReceipt } from '@ethersproject/abstract-provider'
import * as blockChair from '../src/blockchair-api'
import { AddressDTO } from '@xchainjs/xchain-ethereum/src/types/blockchair-api-types'
import { baseAmount, AssetETH, BaseAmount } from '@xchainjs/xchain-util'
import { Balances } from '@xchainjs/xchain-client'

/**
 * Test Data
 * @todo import from .ts
 */
const phrase = 'canyon throw labor waste awful century ugly they found post source draft'
const newPhrase = 'logic neutral rug brain pluck submit earth exit erode august remain ready'
const address = '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E'
const vault = '0x8c2A90D36Ec9F745C9B28B588Cba5e2A978A1656'
const wallet = {
  signingKey: {
    curve: 'secp256k1',
    privateKey: '0x739172c3520ea86ad6238b4f303cc09da6ca7254c76af1a1e8fa3fb00eb5c16f',
    publicKey:
      '0x04ef84375983ef666afdf0e430929574510aa56fb5ee0ee8c02a73f2d2c12ff8f7eee6cdaf9ab6d14fdeebc7ff3d7890f5f98376dac0e5d816dca347bc71d2aec8',
    compressedPublicKey: '0x02ef84375983ef666afdf0e430929574510aa56fb5ee0ee8c02a73f2d2c12ff8f7',
    _isSigningKey: true,
  },
}

const txResponse = {
  hash: '0x9eb9db9c3ec72918c7db73ae44e520139e95319c421ed6f9fc11fa8dd0cddc56',
  parentHash: '0x9b095b36c15eaf13044373aef8ee0bd3a382a5abb92e402afa44b8249c3a90e9',
  number: 3,
  timestamp: 1492010489,
  nonce: 1,
  difficulty: 2,
  gasLimit: ethers.BigNumber.from('0x47e7c4'),
  gasPrice: ethers.BigNumber.from('0x3b9aca00'),
  to: '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E',
  from: '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E',
  value: ethers.BigNumber.from('0x00'),
  data: '0x54455354',
  chainId: 4,
  gasUsed: ethers.BigNumber.from(0),
  miner: '0x0000000000000000000000000000000000000000',
  extraData:
    '0xd783010600846765746887676f312e372e33856c696e757800000000000000004e10f96536e45ceca7e34cc1bdda71db3f3bb029eb69afd28b57eb0202c0ec0859d383a99f63503c4df9ab6c1dc63bf6b9db77be952f47d86d2d7b208e77397301',
  transactions: [],
  confirmations: 1,
  wait: (_?: number): Promise<TransactionReceipt> => Promise.reject(new Error('no need to implement')),
}

/**
 * Wallet Tests
 */
describe('Wallets', () => {
  it('should throw error on bad phrase', () => {
    expect(() => {
      new Client({ phrase: 'bad bad phrase' })
    }).toThrowError()
  })

  it('should create a wallet from phrase', () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })
    expect(ethClient.getWallet()).toBeInstanceOf(Wallet)
    expect(ethClient.getWallet()._signingKey()).toMatchObject(wallet.signingKey)
  })

  it('should set new phrase', () => {
    const ethClient = new Client({})
    const newWallet = ethClient.setPhrase(newPhrase)
    expect(ethClient.getWallet().mnemonic.phrase).toEqual(newPhrase)
    expect(newWallet).toBeTruthy()
  })

  it('should fail to set new phrase', () => {
    const ethClient = new Client({})
    expect(() => ethClient.setPhrase('bad bad phrase')).toThrowError()
  })
})

/**
 * Connectivity Tests (networks/providers)
 */
describe('Connecting', () => {
  it('should connect to specified network', async () => {
    const ethClient = new Client({
      network: 'mainnet',
      phrase,
    })

    expect(ethClient.getWallet()).toBeInstanceOf(Wallet)
    expect(ethClient.getWallet().provider).toBeInstanceOf(providers.FallbackProvider)
    expect(ethClient.getWallet()._signingKey()).toMatchObject(wallet.signingKey)
    const network = await ethClient.getWallet().provider.getNetwork()
    expect(network.name).toEqual('homestead')
    expect(network.chainId).toEqual(1)
  })

  it('should set network', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })
    ethClient.setNetwork('testnet')

    const network = await ethClient.getWallet().provider.getNetwork()
    expect(network.name).toEqual('goerli')
    expect(network.chainId).toEqual(5)
  })
})

/**
 * Utils
 */
describe('Utils', () => {
  it('should get address', () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })
    expect(ethClient.getAddress()).toEqual(address)
  })

  it('should get network', () => {
    const ethClient = new Client({ network: 'testnet' })
    expect(ethClient.getNetwork()).toEqual('testnet')
  })

  it('should fail a bad address', () => {
    const ethClient = new Client({ network: 'testnet' })
    expect(ethClient.validateAddress('0xBADbadBad')).toBeFalsy()
  })

  it('should pass a good address', () => {
    const ethClient = new Client({ network: 'testnet' })
    const goodAddress = ethClient.validateAddress(address)
    expect(goodAddress).toBeTruthy()
  })
})

describe('Transactions', () => {
  it('gets transaction count', async () => {
    const ethClient = new Client({ network: 'testnet', phrase })

    const mockTxCount = jest.spyOn(ethClient.getProvider(), 'getTransactionCount')
    mockTxCount.mockImplementation(async (_): Promise<number> => Promise.resolve(1))

    const count = await ethClient.getTransactionCount()

    expect(mockTxCount).toHaveBeenCalledWith(ethClient.getAddress(), 'latest')
    expect(count).toEqual(1)
  })

  it('checks vault and vaultTx', async () => {
    const ethClient = new Client({ network: 'mainnet', phrase })

    const vaultTx = ethClient.vaultTx(ethClient.getAddress(), baseAmount(parseEther('1').toString(), 18), 'SWAP')
    expect(vaultTx).rejects.toThrowError()
    ethClient.setVault(vault)
    expect(ethClient.getVault()).toEqual(vault)
  })

  it('sends a normalTx', async () => {
    const ethClient = new Client({ network: 'mainnet', phrase })

    const mockTx = jest.spyOn(ethClient.getWallet(), 'sendTransaction')
    mockTx.mockImplementation(
      async (_): Promise<TransactionResponse> => {
        return Promise.resolve(txResponse)
      },
    )

    await ethClient.normalTx({ recipient: ethClient.getAddress(), amount: baseAmount(parseEther('1').toString(), 18) })
    expect(mockTx).toHaveBeenCalledWith({
      to: '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E',
      value: '1',
    })
  })

  it('sends a normalTx with special parameters', async () => {
    const ethClient = new Client({ network: 'mainnet', phrase })

    const mockTx = jest.spyOn(ethClient.getWallet(), 'sendTransaction')
    mockTx.mockImplementation(
      async (_): Promise<TransactionResponse> => {
        return Promise.resolve(txResponse)
      },
    )

    await ethClient.normalTx({
      recipient: ethClient.getAddress(),
      amount: baseAmount(parseEther('1').toString(), 18),
      overrides: {
        nonce: 123,
        data: '0xdeadbeef',
      },
    })
    expect(mockTx).toHaveBeenCalledWith({
      data: '0xdeadbeef',
      nonce: 123,
      to: '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E',
      value: '1',
    })
  })
})

describe('Balances', () => {
  it('gets a balance without address args', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
      blockchairUrl: 'urlHere',
      blockchairNodeApiKey: 'etherKey',
    })

    const mockBalance = jest.spyOn(blockChair, 'getAddress')
    mockBalance.mockImplementation(async () => {
      return Promise.resolve(({
        [address]: {
          address: {
            balance: parseEther('1.786'),
          },
        },
      } as unknown) as AddressDTO)
    })

    await ethClient.getBalance()

    expect(mockBalance).toHaveBeenCalledWith('urlHere', address, 'etherKey')
  })

  it('gets a balance from address', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
      blockchairUrl: 'urlHere',
      blockchairNodeApiKey: 'etherKey',
    })

    const mockBalance = jest.spyOn(blockChair, 'getAddress')
    mockBalance.mockImplementation(async () => {
      return Promise.resolve(({
        ['0xb1d133e115E32Bee0F163EcD2c60FB462b8cDdC1']: {
          address: {
            balance: parseEther('1.786'),
          },
        },
      } as unknown) as AddressDTO)
    })

    await ethClient.getBalance('0xb1d133e115E32Bee0F163EcD2c60FB462b8cDdC1')

    expect(mockBalance).toHaveBeenCalledWith('urlHere', '0xb1d133e115E32Bee0F163EcD2c60FB462b8cDdC1', 'etherKey')
  })

  it('throws error on bad address', async () => {
    const ethClient = new Client({ network: 'testnet', phrase })
    const balances = ethClient.getBalance('0xbad')
    expect(balances).rejects.toThrowError()
  })
})

describe('ERC20', () => {
  it('gets erc 20 balance for a contract without addr', async () => {
    const ethClient = new Client({ network: 'testnet', phrase })

    const mockerc20Bal = jest.spyOn(ethClient, 'getERC20Balance')
    mockerc20Bal.mockImplementation(
      async (_): Promise<Balances> =>
        Promise.resolve([
          {
            asset: AssetETH,
            amount: baseAmount(parseEther('1').toString(), 18),
          },
        ]),
    )

    const erc20Bal = await ethClient.getERC20Balance('0xc3dbf84Abb494ce5199D5d4D815b10EC29529ff8')
    expect(erc20Bal.length).toEqual(1)
    expect(formatEther(erc20Bal[0].amount.amount().toString())).toEqual('1.0')
  })

  it('gets gas estimate for a erc20 transfer', async () => {
    const ethClient = new Client({ network: 'testnet', phrase })
    const mockerc20 = jest.spyOn(ethClient, 'estimateGasERC20Tx')
    mockerc20.mockImplementation(async (_): Promise<BaseAmount> => Promise.resolve(baseAmount(100000, 18)))

    const gasEstimate = await ethClient.estimateGasERC20Tx({
      erc20ContractAddress: '0xc3dbf84Abb494ce5199D5d4D815b10EC29529ff8',
      recipient: '0x2fe25ca708fc485cf356b2f27399247d91c6edbd',
      amount: 1,
    })

    expect(gasEstimate.amount().toString()).toEqual(baseAmount(100000, 18).amount().toString())
  })

  it('sends erc20 with params', async () => {
    const ethClient = new Client({ network: 'testnet', phrase })

    const mockerc20 = jest.spyOn(ethClient, 'erc20Tx')
    mockerc20.mockImplementation(async (_): Promise<TransactionResponse> => Promise.resolve(txResponse))

    const txR = await ethClient.erc20Tx({
      erc20ContractAddress: '0xc3dbf84Abb494ce5199D5d4D815b10EC29529ff8',
      recipient: '0x2fe25ca708fc485cf356b2f27399247d91c6edbd',
      amount: 1,
      overrides: {
        gasLimit: 100000,
      },
    })

    expect(txR).toEqual(txResponse)
    expect(mockerc20).toHaveBeenCalledWith({
      erc20ContractAddress: '0xc3dbf84Abb494ce5199D5d4D815b10EC29529ff8',
      recipient: '0x2fe25ca708fc485cf356b2f27399247d91c6edbd',
      amount: 1,
      overrides: {
        gasLimit: 100000,
      },
    })
  })
})
