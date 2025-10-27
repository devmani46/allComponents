import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './date-picker.html',
  styleUrls: ['./date-picker.scss'],
})
export class DatePicker {
  selectedDate: Date | null = null;
  focusedDate: Date | null = null;
  showCalendar = false;
  displayMonth = new Date();
  daysInMonth: (Date | null)[] = [];
  months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  inputValue = '';

  ngOnInit() {
    this.generateCalendar();
  }

  get displayMaskedValue(): string {
    const placeholder = 'MM/DD/YYYY';
    const val = this.inputValue;
    const parts = [val.slice(0, 2), val.slice(2, 4), val.slice(4, 8)];
    let masked = '';

    masked += parts[0] || 'MM';
    if (val.length > 2) masked += '/';
    masked += parts[1] || (val.length > 2 ? 'DD' : '/DD');
    if (val.length > 4) masked += '/';
    masked += parts[2] || (val.length > 4 ? 'YYYY' : '/YYYY');

    return masked.replace(/\/{2,}/g, '/');
  }

  onInput(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    this.inputValue = val;

    if (val.length === 8) {
      const m = parseInt(val.slice(0, 2), 10);
      const d = parseInt(val.slice(2, 4), 10);
      const y = parseInt(val.slice(4, 8), 10);
      const date = new Date(y, m - 1, d);
      if (!isNaN(date.getTime())) {
        this.selectedDate = date;
        this.focusedDate = date;
      }
    } else {
      this.selectedDate = null;
    }

    event.target.value = this.displayMaskedValue;
  }

  onIconClick(event: MouseEvent) {
    event.stopPropagation();
    this.toggleCalendar();
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
    if (this.showCalendar) {
      this.focusedDate = this.selectedDate || new Date();
      this.displayMonth = new Date(this.focusedDate);
      this.generateCalendar();
    }
  }

  clearDate() {
    this.selectedDate = null;
    this.focusedDate = null;
    this.inputValue = '';
  }

  selectDate(day: Date | null) {
    if (!day) return;
    this.selectedDate = day;
    this.focusedDate = day;
    this.showCalendar = false;

    const formatted = this.formatDate(day).replace(/\D/g, '');
    this.inputValue = formatted;
  }

  formatDate(date: Date): string {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const y = date.getFullYear();
    return `${m}/${d}/${y}`;
  }

  prevMonth() {
    this.displayMonth = new Date(this.displayMonth.getFullYear(), this.displayMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.displayMonth = new Date(this.displayMonth.getFullYear(), this.displayMonth.getMonth() + 1);
    this.generateCalendar();
  }

  generateCalendar() {
    const year = this.displayMonth.getFullYear();
    const month = this.displayMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
    this.daysInMonth = days;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.showCalendar) return;
    const focus = this.focusedDate || new Date(this.displayMonth);
    let newDate = new Date(focus);

    switch (event.key) {
      case 'ArrowLeft': newDate.setDate(focus.getDate() - 1); break;
      case 'ArrowRight': newDate.setDate(focus.getDate() + 1); break;
      case 'ArrowUp': newDate.setDate(focus.getDate() - 7); break;
      case 'ArrowDown': newDate.setDate(focus.getDate() + 7); break;
      case 'Enter': this.selectDate(focus); return;
      case 'Escape': this.showCalendar = false; return;
      default: return;
    }

    event.preventDefault();
    this.focusedDate = newDate;

    if (
      newDate.getMonth() !== this.displayMonth.getMonth() ||
      newDate.getFullYear() !== this.displayMonth.getFullYear()
    ) {
      this.displayMonth = new Date(newDate);
      this.generateCalendar();
    }
  }
}
