import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './date-picker.html',
  styleUrls: ['./date-picker.scss'],
})
export class DatePicker {
  @ViewChild('monthInput', { static: false }) monthInput!: ElementRef;
  @ViewChild('dayInput', { static: false }) dayInput!: ElementRef;
  @ViewChild('yearInput', { static: false }) yearInput!: ElementRef;
  @ViewChild('container', { static: false }) container!: ElementRef;
  @ViewChild('yearSelector', { static: false }) yearSelector!: ElementRef;

  month = '';
  day = '';
  year = '';
  activePart: 'month' | 'day' | 'year' | null = null;

  selectedDate: Date | null = null;
  focusedDate: Date | null = null;
  showCalendar = false;
  displayMonth = new Date();
  daysInMonth: (Date | null)[] = [];
  months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  showMonthSelector = false;
  showYearSelector = false;
  years: number[] = [];
  calendarPosition: 'above' | 'below' = 'below';

  ngOnInit() {
    this.generateCalendar();
    this.generateYears();
  }

  setActive(part: 'month' | 'day' | 'year') {
    this.activePart = part;
  }

  onSegmentInput(part: 'month' | 'day' | 'year', event: any) {
    let val = event.target.value.replace(/\D/g, '');
    if (part === 'month' || part === 'day') val = val.slice(0, 2);
    if (part === 'year') val = val.slice(0, 4);

    if (part === 'month') this.month = val;
    if (part === 'day') this.day = val;
    if (part === 'year') this.year = val;

    // Auto-advance to next segment
    if (part === 'month' && val.length === 2 && this.activePart === 'month') {
      this.setActive('day');
      this.focusSegment('day');
    } else if (part === 'day' && val.length === 2 && this.activePart === 'day') {
      this.setActive('year');
      this.focusSegment('year');
    }

    if (this.month.length === 2 && this.day.length === 2 && this.year.length === 4) {
      const m = parseInt(this.month, 10);
      const d = parseInt(this.day, 10);
      const y = parseInt(this.year, 10);
      const date = new Date(y, m - 1, d);
      if (!isNaN(date.getTime())) {
        this.selectedDate = date;
        this.focusedDate = date;
      }
    } else {
      this.selectedDate = null;
    }
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
      this.adjustCalendarPosition();
    }
  }

  adjustCalendarPosition() {
    if (this.container) {
      const rect = this.container.nativeElement.getBoundingClientRect();
      const calendarHeight = 280; // Fixed height from SCSS
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If there's not enough space below but enough above, show above
      if (spaceBelow < calendarHeight && spaceAbove > calendarHeight) {
        this.calendarPosition = 'above';
      } else {
        this.calendarPosition = 'below';
      }
    }
  }

  clearDate() {
    this.month = '';
    this.day = '';
    this.year = '';
    this.selectedDate = null;
  }

  selectDate(day: Date | null) {
    if (!day) return;
    this.selectedDate = day;
    this.focusedDate = day;
    this.showCalendar = false;

    this.month = String(day.getMonth() + 1).padStart(2, '0');
    this.day = String(day.getDate()).padStart(2, '0');
    this.year = String(day.getFullYear());
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

  generateYears() {
    const currentYear = new Date().getFullYear();
    this.years = [];
    for (let i = currentYear - 100; i <= currentYear + 100; i++) {
      this.years.push(i);
    }
  }

  toggleMonthSelector() {
    this.showMonthSelector = !this.showMonthSelector;
    this.showYearSelector = false;
  }

  toggleYearSelector() {
    this.showYearSelector = !this.showYearSelector;
    this.showMonthSelector = false;
    if (this.showYearSelector) {
      setTimeout(() => {
        this.scrollToSelectedYear();
      });
    }
  }

  scrollToSelectedYear() {
    if (this.yearSelector) {
      const selectedYear = this.displayMonth.getFullYear();
      const currentYear = new Date().getFullYear();
      const index = selectedYear - (currentYear - 100);
      const buttonHeight = 40; 
      const rowIndex = Math.floor(index / 3); 
      const scrollTop = rowIndex * buttonHeight + buttonHeight * 3; 
      this.yearSelector.nativeElement.scrollTop = scrollTop;
    }
  }

  selectMonth(monthIndex: number) {
    this.displayMonth = new Date(this.displayMonth.getFullYear(), monthIndex);
    this.generateCalendar();
    this.showMonthSelector = false;
  }

  selectYear(year: number) {
    this.displayMonth = new Date(year, this.displayMonth.getMonth());
    this.generateCalendar();
    this.showYearSelector = false;
  }

  focusSegment(part: 'month' | 'day' | 'year') {
    setTimeout(() => {
      if (part === 'month' && this.monthInput) {
        this.monthInput.nativeElement.focus();
      } else if (part === 'day' && this.dayInput) {
        this.dayInput.nativeElement.focus();
      } else if (part === 'year' && this.yearInput) {
        this.yearInput.nativeElement.focus();
      }
    });
  }

  updateSelectedDate() {
    if (this.month.length === 2 && this.day.length === 2 && this.year.length === 4) {
      const m = parseInt(this.month, 10);
      const d = parseInt(this.day, 10);
      const y = parseInt(this.year, 10);
      const date = new Date(y, m - 1, d);
      if (!isNaN(date.getTime())) {
        this.selectedDate = date;
        this.focusedDate = date;
      }
    } else {
      this.selectedDate = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.container && !this.container.nativeElement.contains(event.target)) {
      this.showCalendar = false;
      this.showMonthSelector = false;
      this.showYearSelector = false;
      this.activePart = null;
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    if (this.showCalendar) {
      this.adjustCalendarPosition();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event) {
    if (this.showCalendar) {
      this.adjustCalendarPosition();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.showCalendar) {
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
    } else {
      // Handle segment-specific arrow keys
      if (this.activePart === 'month') {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          const currentMonth = parseInt(this.month) || 1;
          const newMonth = Math.max(1, currentMonth - 1);
          this.month = String(newMonth).padStart(2, '0');
          this.updateSelectedDate();
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          const currentMonth = parseInt(this.month) || 1;
          const newMonth = Math.min(12, currentMonth + 1);
          this.month = String(newMonth).padStart(2, '0');
          this.updateSelectedDate();
        }
      } else if (this.activePart === 'year') {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          const currentYear = parseInt(this.year) || new Date().getFullYear();
          const newYear = currentYear - 1;
          this.year = String(newYear);
          this.updateSelectedDate();
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          const currentYear = parseInt(this.year) || new Date().getFullYear();
          const newYear = currentYear + 1;
          this.year = String(newYear);
          this.updateSelectedDate();
        }
      } else if (this.activePart === 'day') {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          const currentDay = parseInt(this.day) || 1;
          const newDay = Math.max(1, currentDay - 1);
          this.day = String(newDay).padStart(2, '0');
          this.updateSelectedDate();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          const currentDay = parseInt(this.day) || 1;
          const newDay = Math.min(31, currentDay + 1); // Simplified, could be month-specific
          this.day = String(newDay).padStart(2, '0');
          this.updateSelectedDate();
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          const currentDay = parseInt(this.day) || 1;
          const newDay = Math.max(1, currentDay - 7);
          this.day = String(newDay).padStart(2, '0');
          this.updateSelectedDate();
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          const currentDay = parseInt(this.day) || 1;
          const newDay = Math.min(31, currentDay + 7); // Simplified
          this.day = String(newDay).padStart(2, '0');
          this.updateSelectedDate();
        }
      }

      // Handle arrow navigation between segments
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        if (this.activePart !== 'day' || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
          event.preventDefault();
          let nextPart: 'month' | 'day' | 'year' | null = null;
          if (event.key === 'ArrowLeft') {
            if (this.activePart === 'day') nextPart = 'month';
            else if (this.activePart === 'year') nextPart = 'day';
          } else if (event.key === 'ArrowRight') {
            if (this.activePart === 'month') nextPart = 'day';
            else if (this.activePart === 'day') nextPart = 'year';
          }
          if (nextPart) {
            this.setActive(nextPart);
            this.focusSegment(nextPart);
          }
        }
      }
    }
  }
}
