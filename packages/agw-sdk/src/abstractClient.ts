import { 
    createWalletClient,
    createClient,
    custom,
    type Transport,
    type Account,
    type Hex,
    type EIP1193Provider,
    type Client,
    createPublicClient,
    http,
  } from 'viem';
  import { type ChainEIP712 } from 'viem/zksync';
  import { globalWalletActions, type AbstractWalletActions } from './actions.js';
  
  type CreateAbstractClientParameters = {
    smartAccountAddress: Hex;
    signerAddress: Hex;
    validatorAddress: Hex;
    eip1193Provider: EIP1193Provider;
    chain: ChainEIP712;
  };
  
  type AbstractClientActions = AbstractWalletActions<ChainEIP712, Account>;
  
  export type AbstractClient = Client<Transport, ChainEIP712, Account> & AbstractClientActions;
  
  export function createAbstractClient(parameters: CreateAbstractClientParameters): AbstractClient {
    const { smartAccountAddress, validatorAddress, signerAddress, eip1193Provider, chain } = parameters;
    const transport = custom(eip1193Provider);
  
    const baseClient = createClient({
      account: smartAccountAddress,
      chain: chain,
      transport,
    });
  
    // Create a signer wallet client to handle actual signing
    const signerWalletClient = createWalletClient({
      account: signerAddress,
      chain: chain,
      transport: custom(eip1193Provider)
    });
  
    // Create public client for reading contract code
    const publicClient = createPublicClient({
      chain: chain,
      transport: http()
    })
  
    const abstractClient = baseClient.extend(globalWalletActions(validatorAddress, signerWalletClient, publicClient));
    return abstractClient as AbstractClient;
  }
  