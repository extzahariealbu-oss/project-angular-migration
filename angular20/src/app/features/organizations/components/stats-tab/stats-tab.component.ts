/**
 * Stats Tab Component (Stub)
 * Evidence: /angularjs2/app/views/company/stats.html (81 lines)
 * Evidence: /angularjs2/app/views/company/fiche.html:186 (tab commented out)
 * 
 * Status: Stub component - Stats tab requires Handsontable integration (complex library)
 * 
 * Reference Implementation:
 * - Date range selector with reportDateRange directive
 * - Entity and Commercial filters
 * - Dynamic Handsontable grid per organization (ng-repeat)
 * - Columns: Name (400px) + Product families (120px each) + Total (120px, yellow bg)
 * - CSV export: GET /erp/api/stats/DetailsClientCsv?start&end&entity
 * - Data model: dataClients array with nested sales data by family
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Organization } from '../../models/organization.model';

@Component({
  selector: 'app-stats-tab',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './stats-tab.component.html',
  styleUrl: './stats-tab.component.scss'
})
export class StatsTabComponent {
  organization = input.required<Organization>();
}
