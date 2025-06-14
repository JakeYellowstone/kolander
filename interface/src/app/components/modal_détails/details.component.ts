import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-details-modal',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
  imports : [CommonModule],
})
export class DetailModalComponent {
  @Input() show = false;
  @Input() menace: any = null;
  @Output() cancel = new EventEmitter<void>();


  onCancel() {
    this.cancel.emit();
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }
}
