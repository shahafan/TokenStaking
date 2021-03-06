import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { DepositModalComponent } from '@app/components/deposit-modal/deposit-modal.component';
import { AuthQuery } from '@app/services/auth-service/auth.service.query';
import { AuthService } from '@app/services/auth-service/auth.service';
import { WalletSelectionModalComponent } from '@app/components/wallet-selection-modal/wallet-selection-modal.component';
import { Observable } from 'rxjs';
import { UiService } from '@app/services/ui-service/ui.service';
import { StakingService } from '@app/services/staking-service/staking.service';
import { StakingQuery } from '@app/services/staking-service/staking.service.query';
import { IStaking } from '@app/data-model';
import { ethers } from 'ethers';
import { BaseForm } from '@app/helpers/BaseForm';

@Component({
  selector: 'app-otp-staking',
  templateUrl: 'otp-staking.page.html',
  styleUrls: ['otp-staking.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OtpStakingPage implements OnInit {

  loggedIn$: Observable<boolean> = this.authQuery.select( user => !!user.wallet );
  stakingData$ = this.stakingQuery.select();
  maxBet: any;
  interval: any;
  loadTimeReward: boolean = false;

  constructor(
    public modalCtrl: ModalController,
    private authQuery: AuthQuery,
    private stakingService: StakingService,
    private stakingQuery: StakingQuery,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public ui: UiService, ) {}

  ngOnInit() {
    this.stakingData$.subscribe( stakingData => {
      let remainingInContract = 35000 - +this.getContractBalance(stakingData, false);
      let walletBalance = +this.getWalletBalance(stakingData, false);
      let walletBalanceAsString = this.getWalletBalanceAsString(stakingData);
      this.maxBet = (remainingInContract < walletBalance) ? remainingInContract.toString() : walletBalanceAsString;
    });

    this.initializeTime('rewardStatus_value', this.stakingService.timeToReward);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  initializeTime(id, endtime) {
    setTimeout(() => {
      if(endtime !== undefined && endtime != "") {
        const secondsSpan = document.getElementById(id);
        let timeLeft = endtime;
        this.interval = setInterval(() => {
          if(endtime > 0) {
            timeLeft--;
            this.loadTimeReward = true;
            secondsSpan.innerHTML = new Date(timeLeft * 1000).toISOString().substr(11, 8);
          } else {
            clearInterval(this.interval);
          }
        },1000)
      } else {
        this.initializeTime(id, this.stakingService.timeToReward);
      }
    }, 500);
  }

  // ***************** Buttons *****************
  async harvest() {
    try {
      const interaction = await this.ui
                              .loading(  this.stakingService.withdraw(),
                              'You will be prompted for contract interactions, please approve to successfully harvest, and please be patient as it may take a few moments to broadcast to the network.' )
                              .catch( e => alert(`Error with contract interactions ${JSON.stringify(e)}`) );
      if (interaction) {
          this.showContractCallSuccess('Success! Your winnings have been harvested.');
       }
     } catch (error) {
       alert(`Error ! ${error}`);
     }
  }

  async stake() {
    try {
      const modalOpts = {
        component: DepositModalComponent,
        componentProps: {
          balance: 0,
          maxBet: this.maxBet
        },
        cssClass: 'deposit-modal',
      };
      const modal: HTMLIonModalElement = await this.modalCtrl.create(modalOpts);
      await modal.present();
      const selection = await modal.onDidDismiss();
      console.log(selection)
      if ( selection.data ) {
        // const amount = BaseForm.transformAmount(selection.data);
        const amount = selection.data;
        console.log('amount:' + amount); // Do something with this Value i.e send it somewhere etc

        try {
          const interaction = await this.ui
                                  .loading(  this.stakingService.deposit(amount),
                                  'You will be prompted for contract interactions, please approve all to successfully stake, and please be patient as it may take a few moments to broadcast to the network.' )
                                  .catch( e => alert(`Error with contract interactions ${JSON.stringify(e)}`) );
          if (interaction) {
              this.showContractCallSuccess('Success! Your stake has been placed.');
           }
         } catch (error) {
           alert(`Error ! ${error}`);
         }

      }
    } catch (error) {
       console.log(`modal present error ${error}`);
       throw error;
    }
  }

  async login() {
    try {
      const modalOpts = {
        component: WalletSelectionModalComponent,
        componentProps: {
        },
        cssClass: 'deposit-modal',
      };
      let modal: HTMLIonModalElement = await this.modalCtrl.create(modalOpts);
      await modal.present();
    } catch (error) {
       console.log(`modal present error ${error}`);
       throw error;
    }
  }
// ***************** Buttons *****************

  // *************** Messages *********************
  async showContractCallSuccess(messageArg: string) {
    const toast = await this.toastCtrl.create({
      position: 'middle',
      duration: 2000,
      cssClass: 'successToast',
      message: messageArg,
    });
    await toast.present();
    setTimeout( async () => {
      await toast.dismiss();
    }, 3000);
  }
// *************** Messages *********************

// ************** helper functions ***************
  getStaked(stakingData, fix){
    return stakingData.entities[this.stakingService.address] !== undefined
      ? this.parseAmount(stakingData.entities[this.stakingService.address].staked, fix)
      : 0.0;
  }

  getRewards(stakingData, fix){
    return stakingData.entities[this.stakingService.address] !== undefined
      ? this.parseAmount(stakingData.entities[this.stakingService.address].rewards, fix)
      : 0.0;
  }

  getContractBalance(stakingData, fix){
    return stakingData.entities[this.stakingService.address] !== undefined
      ? this.parseAmount(stakingData.entities[this.stakingService.address].ContractBalance, fix)
      : 0.0;
  }

  getWalletBalance(stakingData, fix){
    return stakingData.entities[this.stakingService.address] !== undefined
      ? this.parseAmount(stakingData.entities[this.stakingService.address].WalletBalance, fix)
      : 0.0;
  }

  getWalletBalanceAsString(stakingData){
    return stakingData.entities[this.stakingService.address] !== undefined
      ? ethers.utils.formatUnits(stakingData.entities[this.stakingService.address].WalletBalance.toString())
      : 0.0;
  }

  hasBalance(balance) {
    return (isNaN(balance)) ? false : (balance > 0);
  }

  parseAmount(amount, fix) {
    const parsed = (isNaN(amount)) ? 0 : parseFloat(ethers.utils.formatUnits(amount.toString()));
    return (fix) ? parsed.toFixed(2) : parsed;
  }

  goBack() {
    this.navCtrl.back();
  }      
}
