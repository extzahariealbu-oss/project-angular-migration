import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PresetRange {
  label: string;
  getValue: () => DateRange;
}

@Component({
  selector: 'app-date-range-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './date-range-filter.component.html',
  styleUrls: ['./date-range-filter.component.scss']
})
export class DateRangeFilterComponent {
  @Input() dateRange!: DateRange;
  @Output() rangeChange = new EventEmitter<DateRange>();
  
  presetRanges: PresetRange[] = [
    {
      label: 'Ce mois-ci',
      getValue: () => this.getCurrentMonth()
    },
    {
      label: 'Mois m-1',
      getValue: () => this.getMonthOffset(-1)
    },
    {
      label: 'Mois m-2',
      getValue: () => this.getMonthOffset(-2)
    },
    {
      label: 'Mois m-3',
      getValue: () => this.getMonthOffset(-3)
    },
    {
      label: '3 derniers mois',
      getValue: () => this.getLast3Months()
    },
    {
      label: 'Année en cours',
      getValue: () => this.getYearToDate()
    },
    {
      label: 'Année N-1',
      getValue: () => this.getPreviousYear()
    }
  ];

  selectPreset(preset: PresetRange): void {
    const range = preset.getValue();
    this.dateRange = range;
    this.rangeChange.emit(range);
  }

  private getCurrentMonth(): DateRange {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    };
  }

  private getMonthOffset(offset: number): DateRange {
    const now = new Date();
    const targetMonth = now.getMonth() + offset;
    const targetDate = new Date(now.getFullYear(), targetMonth, 1);
    return {
      start: new Date(targetDate.getFullYear(), targetDate.getMonth(), 1),
      end: new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999)
    };
  }

  private getLast3Months(): DateRange {
    const now = new Date();
    const startMonth = now.getMonth() - 3;
    const endMonth = now.getMonth() - 1;
    const startDate = new Date(now.getFullYear(), startMonth, 1);
    const endDate = new Date(now.getFullYear(), endMonth, 1);
    return {
      start: new Date(startDate.getFullYear(), startDate.getMonth(), 1),
      end: new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0, 23, 59, 59, 999)
    };
  }

  private getYearToDate(): DateRange {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    };
  }

  private getPreviousYear(): DateRange {
    const now = new Date();
    return {
      start: new Date(now.getFullYear() - 1, 0, 1),
      end: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
    };
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }
}
