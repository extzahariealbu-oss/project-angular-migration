// Evidence: /angularjs2/app/controllers/DashboardController.js:26-41
// Evidence: /angularjs2/app/views/home/dashboard.html (responsive grid layout)
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DashboardStatBoxComponent } from '../../shared/components/dashboard-stat-box/dashboard-stat-box';
import { DateRangeFilterComponent } from '../../shared/components/date-range-filter/date-range-filter.component';
import { DashboardService } from './services/dashboard.service';

interface DateRange {
  start: Date;
  end: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardStatBoxComponent, DateRangeFilterComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Evidence: DashboardController.js:49-52 (default to current month)
  dateRange = signal<DateRange>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  });

  // Evidence: epic-2-evidence.md:122-206 (four stat boxes)
  revenue = signal<string>('0 €');
  charges = signal<string>('0 €');
  yearlyResult = signal<string>('0 €');
  penalties = signal<string>('0 €');

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadKPIs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDateRangeChange(range: DateRange): void {
    this.dateRange.set(range);
    this.loadKPIs();
  }

  private loadKPIs(): void {
    const range = this.dateRange();
    
    // Evidence: DashboardService methods for each KPI
    this.dashboardService.getRevenue(range.start, range.end)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.revenue.set(`${data.value.toLocaleString('fr-FR')} €`));

    this.dashboardService.getCharges(range.start, range.end)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.charges.set(`${data.value.toLocaleString('fr-FR')} €`));

    this.dashboardService.getYearlyResult(range.start, range.end)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.yearlyResult.set(`${data.value.toLocaleString('fr-FR')} €`));

    this.dashboardService.getPenalties(range.start, range.end)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.penalties.set(`${data.value.toLocaleString('fr-FR')} €`));
  }
}
