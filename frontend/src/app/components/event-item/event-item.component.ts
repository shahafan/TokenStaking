import { Component, Input, OnInit } from '@angular/core';
import { IEvent, Side } from '@app/data-model';

@Component({
  selector: 'app-event-item',
  templateUrl: './event-item.component.html',
  styleUrls: ['./event-item.component.scss'],
})
export class EventItemComponent implements OnInit {

  @Input() event: IEvent;

  constructor() { }

  ngOnInit() {}

  getClass(betSide: Side): string {
    return (betSide === Side.Higher) ? 'status-green' : 'status-red';
  }

  getConditionText(betSide: Side): string {
    return (betSide === Side.Higher) ? 'higher than' : 'lower than';
  }

  // getStatusText(event: any): string {
  //   return this.eventService.getStatusText(event);
  // }

  // getTotalValue(value: any): string {
  //   return this.eventService.getTotalValue(value);
  // }

}

