import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Player } from '../shared/interfaces/player.interface';
import { AccountService } from '../shared/providers/account.service';
import { ElectronService } from '../shared/providers/electron.service';
import { IncomeService } from '../shared/providers/income.service';
import { KeybindService } from '../shared/providers/keybind.service';
import { MapService } from '../shared/providers/map.service';
import { MessageValueService } from '../shared/providers/message-value.service';
import { PartyService } from '../shared/providers/party.service';
import { RobotService } from '../shared/providers/robot.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.scss']
})
export class AuthorizeComponent implements OnInit, OnDestroy {
  form: FormGroup;
  player: Player;
  private playerSub: Subscription;
  constructor(@Inject(FormBuilder) fb: FormBuilder,
    public partyService: PartyService,
    private mapService: MapService,
    private robotService: RobotService,
    private keybindService: KeybindService,
    private accountService: AccountService,
    private messageValueService: MessageValueService,
    private incomeService: IncomeService,
    private electronService: ElectronService,
    private router: Router) {
    this.form = fb.group({
      partyCode: [this.partyService.party.name !== '' ? this.partyService.party.name : this.generatePartyName(),
      [Validators.maxLength(25), Validators.required]]
    });
  }

  ngOnInit() {
    this.playerSub = this.accountService.player.subscribe(res => {
      this.player = res;
    });
  }

  ngOnDestroy() {
    if (this.playerSub !== undefined) {
      this.playerSub.unsubscribe();
    }
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }

  generatePartyName(): string {
    let partyName = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 5; i++) {
      partyName += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return partyName;
  }

  enterParty() {
    this.partyService.leaveParty(this.partyService.party.name, this.player);
    setTimeout(() => {
      this.partyService.joinParty(this.form.controls.partyCode.value.toUpperCase(), this.player);
      this.incomeService.Snapshot();
      this.partyService.addPartyToRecent(this.form.controls.partyCode.value.toUpperCase());
      this.router.navigateByUrl('/404', { skipLocationChange: true }).then(() =>
        this.router.navigate(['/authorized/party']));
    }, 750);
  }
}
