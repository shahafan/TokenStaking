import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
// import { TranslateModule} from "@ngx-translate/core"
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from "@pipes/pipes.module";
import {RouterModule} from '@angular/router';
import { ConnectWallet } from "@components/connect-wallet/connect-wallet.component";
import { AppHeaderComponent } from "@components/app-header/app-header.component";
import { WagerInformationOutputComponent } from "@components/wager-information-output/wager-information-output.component";
import { WagerSelectedTokenComponent } from "@components/wager-selected-token/wager-selected-token.component";
import { EventItemComponent } from "@components/event-item/event-item.component";
import { DepositModalComponent } from "@components/deposit-modal/deposit-modal.component";
import { WalletSelectionModalComponent } from "@components/wallet-selection-modal/wallet-selection-modal.component";
import { WalletOptionsModalComponent } from "@components/wallet-options-modal/wallet-options-modal.component";

const components = [
  ConnectWallet,
  AppHeaderComponent,
  WagerInformationOutputComponent,
  WagerSelectedTokenComponent,
  EventItemComponent,
  DepositModalComponent,
  WalletSelectionModalComponent,
  WalletOptionsModalComponent,
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    // TranslateModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  providers: [],
  declarations: components,  
  entryComponents: components,  
  exports: components
})
export class ComponentsModule {}