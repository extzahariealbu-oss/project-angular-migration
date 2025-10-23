/**
 * Task Tab Component (Stub)
 * Evidence: /angularjs2/app/views/company/task.html (0 lines - empty file)
 * Evidence: /angularjs2/app/views/company/fiche.html:174 (tab commented out)
 * 
 * Status: Stub component - Task tab was inactive in reference application
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Organization } from '../../models/organization.model';

@Component({
  selector: 'app-task-tab',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './task-tab.component.html',
  styleUrl: './task-tab.component.scss'
})
export class TaskTabComponent {
  organization = input.required<Organization>();
}
