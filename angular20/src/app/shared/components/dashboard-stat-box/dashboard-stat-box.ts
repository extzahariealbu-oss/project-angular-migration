import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard-stat-box',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './dashboard-stat-box.html',
  styleUrls: ['./dashboard-stat-box.scss']
})
export class DashboardStatBoxComponent {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() icon: string = '';
  @Input() colorClass: string = 'green-haze';
}
