import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LedgerWallet} from '@app/data-model';
import Transport from '@ledgerhq/hw-transport-webusb';
import { Wallet, ethers } from 'ethers';
import AppEth from '@ledgerhq/hw-app-eth';

import { Storage } from '@ionic/storage';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import { BehaviorSubject, Observable } from 'rxjs';
// import { AuthService } from '../auth-service/auth.service';


const rlp = require('rlp');
const keccak = require('keccak');

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  private activeDerivation = `m/44'/60'/0'/0/0`;
  address: string;
  maxDecimals = 18;
  _provider = null;

  private _currentNetwork = new BehaviorSubject<string>('');
  $currentNetwork: Observable<Readonly<string>> = this._currentNetwork.asObservable()

  constructor(
    public router: Router,
    private storage: Storage) {}


  async setNetwork() {
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    const currentNetwork = await provider.getNetwork();
    this.storage.set('chainId', currentNetwork.chainId);
    this.storage.set('chainName', currentNetwork.name);
    this._currentNetwork.next(currentNetwork.name);
  }

  async netChange() {
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    const lastChainId = await this.storage.get('chainId');
    provider.on('network', (newNetwork) => {
        if (String(newNetwork.chainId) !== String(lastChainId)) {
          window.location.reload();
        }
    });
  }


  provider() {
    if (this._provider === null){
      window.ethereum.enable().then(this._provider = new ethers.providers.Web3Provider(window.ethereum));
    }
    return this._provider;
  }

  signer(): any {
    return this.provider().getSigner();
  }

 async signerAddress() {
    return await this.signer().getAddress();
  }

  /**
   * Get the default address from the window object/provider i.e metamask
   */
  async connectWallet(): Promise<string[]> {
    return new Promise( async (resolve, reject) => {
      try {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const accs: Array<string> = await provider.listAccounts();
        if (accs && accs.length) {
          resolve(accs);
        }
      } catch (error) {
        reject(
          new Error(error)
        );
      }
    });
  }

  async ledgerDefaultSigner(): Promise<LedgerWallet> {
    return new Promise( async (resolve, reject) => {
      try {
        const transport = await Transport.create();
        const ethApp = new AppEth(transport);
        const result: LedgerWallet = await ethApp.getAddress(this.activeDerivation);
        if (result) {
          resolve(result);
        }
      } catch (error) {
        reject(
          new Error(error)
        );
      }
    });
  }

  /**
   * Get the default address from the window object/provider i.e metamask
   */
  async metamaskDefaultSigner(): Promise<string[]> {
    return new Promise( async (resolve, reject) => {
      try {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accs: Array<string> = await provider.listAccounts();
        if (accs && accs.length) {
          resolve(accs);
        }
      } catch (error) {
        reject(
          new Error(error)
        );
      }
    });
  }

  getSigner() {
    return new Promise( async (resolve, reject) => {
      try {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accs = provider.getSigner();
        if (accs) {
          resolve(accs);
        }
      } catch (error) {
        reject(
          new Error(error)
        );
      }
    });
  }


  async activeSigner() {
    return new Promise( async (resolve, reject) => {
      try {
        // this.opEventQuery.clearState();
        const signer: any = await this.getSigner();
        const wallet: any = await this.signerAddress();
        if (wallet && signer) {
          this.address = wallet;
          return resolve({ wallet, signer});
        }
      } catch (error) {
       return reject(false);
      }
    });
  }

/** Utils  */
getNextContractAddress(address: any, nonce: any){
  const inputArr = [ address, nonce ];
  const rlpEncoded = rlp.encode(inputArr);
  const contractAddressLong = keccak('keccak256').update(rlpEncoded).digest('hex');
  const contractAddress = '0x'.concat(contractAddressLong.substring(24));
  return contractAddress;
}

EncodeTokenAmount(tokenAmount: any, decimalRepresentation: any, decimalsInArgument: any) {
  if (decimalRepresentation > this.maxDecimals || decimalsInArgument > this.maxDecimals){
      throw new Error('decimal encoding incorrect');
  }
  console.log(`@EncodeTokenAmount ${tokenAmount}  ${decimalRepresentation} ${decimalsInArgument} `);
  console.log(`@EncodeTokenAmount ${typeof tokenAmount}  ${typeof decimalRepresentation} ${typeof decimalsInArgument} `);
  const tokenAmountBN = ethers.BigNumber.from(tokenAmount);
  const DecimalsBN = ethers.BigNumber.from(decimalRepresentation - decimalsInArgument);
  const tokenAmountEncoded = ethers.utils.hexValue( tokenAmountBN.mul( ethers.BigNumber.from(10).pow(DecimalsBN) ) );
  return tokenAmountEncoded;
}


}
