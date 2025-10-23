import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

interface TotalsMeta {
  total: number;
  statusBreakdown?: Record<string, number>;
}

@Component({
  selector: 'app-organizations-totals',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './organizations-totals.component.html',
  styleUrls: ['./organizations-totals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationsTotalsComponent {
  @Input() totals: TotalsMeta | null = null;

  get statusKeys(): string[] {
    return this.totals?.statusBreakdown 
      ? Object.keys(this.totals.statusBreakdown)
      : [];
  }

  getStatusCount(status: string): number {
    return this.totals?.statusBreakdown?.[status] ?? 0;
  }
}
