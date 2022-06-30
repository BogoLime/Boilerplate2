import * as React from 'react';
import styled from 'styled-components';

import Web3Modal from 'web3modal';
// @ts-ignore
import WalletConnectProvider from '@walletconnect/web3-provider';
import Column from './components/Column';
import Wrapper from './components/Wrapper';
import Header from './components/Header';
import Loader from './components/Loader';
import ConnectButton from './components/ConnectButton';
import SubmitForm from './components/SubmitForm';
import TransactionLink from './components/TransctionLink';
import Button from './components/Button';

import { Web3Provider } from '@ethersproject/providers';
import { getChainData } from './helpers/utilities';

import {
  US_ELECTION_ADDRESS
} from './constants/contracts';
import { getContract } from './helpers/ethers';

import ABI from "./constants/abis/USElection.json";
import StatSection from './components/Stats';

const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled(Wrapper)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SLanding = styled(Column)`
  height: 600px;
`;

// @ts-ignore
const SBalances = styled(SLanding)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`;

interface IStats{
  leader: string;
  biden: number;
  trump: number;
  isEnded: boolean;
}

interface IAppState {
  fetching: boolean;
  address: string;
  library: any;
  connected: boolean;
  chainId: number;
  pendingRequest: boolean;
  result: any | null;
  electionContract: any | null;
  info: any | null;
  contract: any | null;
  stats:IStats;
  transactionHash: string | null;
  failMsg: string | null
}

const INITIAL_STATE: IAppState = {
  fetching: false,
  address: '',
  library: null,
  connected: false,
  chainId: 1,
  pendingRequest: false,
  result: null,
  electionContract: null,
  info: null,
  contract: null,
  stats: {
    leader:"",
    biden: 0,
    trump: 0,
    isEnded: false
  },
  transactionHash:null,
  failMsg:null
};

class App extends React.Component<any, any> {
  // @ts-ignore
  public web3Modal: Web3Modal;
  public state: IAppState;
  public provider: any;

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE
    };

    this.web3Modal = new Web3Modal({
      network: this.getNetwork(),
      cacheProvider: true,
      providerOptions: this.getProviderOptions()
    });
  }

  // Load data on initial component load
  public componentDidMount() {
    if (this.web3Modal.cachedProvider) {
      this.setState({fetching:true})
      this.onConnect()
      .then(() =>{
      this.updateStats()})
      .then(()=>{
      this.setState({fetching:false})
    })

    }

    
  }

  public onConnect = async () => {
    this.provider = await this.web3Modal.connect();

    const library = new Web3Provider(this.provider);

    const network = await library.getNetwork();

    const address = this.provider.selectedAddress ? this.provider.selectedAddress : this.provider.accounts[0];

    const contract  = getContract(US_ELECTION_ADDRESS,ABI.abi,library,address)

    await this.setState({
      library,
      chainId: network.chainId,
      address,
      connected: true,
      contract,
    });

    await this.subscribeToProviderEvents(this.provider);

  };

  public subscribeToProviderEvents = async (provider:any) => {
    if (!provider.on) {
      return;
    }

    provider.on("accountsChanged", this.changedAccount);
    provider.on("networkChanged", this.networkChanged);
    provider.on("close", this.close);

    await this.web3Modal.off('accountsChanged');
  };

  public async unSubscribe(provider:any) {
    // Workaround for metamask widget > 9.0.3 (provider.off is undefined);
    window.location.reload(false);
    if (!provider.off) {
      return;
    }

    provider.off("accountsChanged", this.changedAccount);
    provider.off("networkChanged", this.networkChanged);
    provider.off("close", this.close);
  }

  public changedAccount = async (accounts: string[]) => {
    if(!accounts.length) {
      // Metamask Lock fire an empty accounts array 
      await this.resetApp();
    } else {
      await this.setState({ address: accounts[0] });
    }
  }

  public networkChanged = async (networkId: number) => {
    const library = new Web3Provider(this.provider);
    const network = await library.getNetwork();
    const chainId = network.chainId;
    await this.setState({ chainId, library });
  }
  
  public close = async () => {
    this.resetApp();
  }

  public getNetwork = () => getChainData(this.state.chainId).network;

  public getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID
        }
      }
    };
    return providerOptions;
  };

  // Gets the info abput the current election status
  public updateStats = async() => {
    const {contract} = this.state
    const leader = await contract.currentLeader()
    const biden = await contract.seats(1)
    const trump = await contract.seats(2)
    const isEnded = await contract.electionEnded()

    await this.setState({stats:{leader, biden, trump, isEnded}})

  }

  // Preventing code duplication
  public _executeTransaction = async (transaction:any) =>{
    this.setState({fetching:true})
    this.setState({ transactionHash: transaction.hash })

    const receipt = await transaction.wait()
    if (receipt.status !== 1) {
      this.setState({failMsg:"The transaction failed"})
      setTimeout(()=>{
        this.setState({failMsg:null})
      }, 2000)
    }
    await this.updateStats()

    this.setState({fetching:false})
    this.setState({ transactionHash: null})
  }

  public submitVote =  async(state:string,vBiden:number,vTrump:number,seatsNum:number) => {

    const transaction = await this.state.contract.submitStateResult([state,vBiden,vTrump,seatsNum])
    
    this._executeTransaction(transaction)

  }

  public endElection  = async() =>{
    const {contract} = this.state
    
    const transaction = await contract.endElection()

    this._executeTransaction(transaction)

  }

  public resetApp = async () => {
    await this.web3Modal.clearCachedProvider();
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("walletconnect");
    await this.unSubscribe(this.provider);

    this.setState({ ...INITIAL_STATE });

  };

  public render = () => {
    const {
      address,
      connected,
      chainId,
      fetching,
      stats,
      transactionHash,
      failMsg
    } = this.state;
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header
            connected={connected}
            address={address}
            chainId={chainId}
            killSession={this.resetApp}
          />
          <SContent>
            {fetching ? (
              <Column center>
                <SContainer>
                  <Loader />
                  {transactionHash && <TransactionLink hash={transactionHash} />}
                </SContainer>
              </Column>
            ) : (
                <SLanding center>
                  {failMsg!== null && <p>{failMsg}</p>}
                  {!this.state.connected && <ConnectButton onClick={this.onConnect} />}
                  {this.state.connected && <SubmitForm  onClick = {this.submitVote}/>}
                  {this.state.connected && <Button color ={"red"} onClick={this.endElection}> End Election </ Button> }
                  {this.state.connected && <StatSection  stats={stats}/>}
                </SLanding>
              )}
          </SContent>
        </Column>
      </SLayout>
    );
  };
}

export default App;
