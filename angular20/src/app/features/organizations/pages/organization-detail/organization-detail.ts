import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrganizationsApiService } from '../../services/organizations-api.service';
import { Organization } from '../../models/organization.model';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    MatProgressBarModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './organization-detail.html',
  styleUrls: ['./organization-detail.scss']
})
export class OrganizationDetailComponent implements OnInit {
  organization = signal<Organization | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  isActive = computed(() => this.organization()?.salesPurchases?.isActive ?? false);
  isProspect = computed(() => this.organization()?.salesPurchases?.isProspect ?? false);
  isCustomer = computed(() => this.organization()?.salesPurchases?.isCustomer ?? false);
  isSupplier = computed(() => this.organization()?.salesPurchases?.isSupplier ?? false);
  isSubcontractor = computed(() => this.organization()?.salesPurchases?.isSubcontractor ?? false);
  showCommercialTab = computed(() => this.isCustomer() || this.isProspect());

  statusCss = computed(() => this.organization()?._status?.css || 'default');
  statusName = computed(() => this.organization()?._status?.name || 'N/A');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationService: OrganizationsApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrganization(id);
    }
  }

  loadOrganization(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.organizationService.getById(id).subscribe({
      next: (org) => {
        this.organization.set(org);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load organization');
        this.loading.set(false);
        console.error('Error loading organization:', err);
      }
    });
  }

  toggleActive(): void {
    const org = this.organization();
    if (!org) return;
    
    const updated: Organization = {
      ...org,
      salesPurchases: {
        ...org.salesPurchases,
        isActive: !(org.salesPurchases?.isActive ?? false)
      }
    };
    
    this.updateOrganization(updated);
  }

  toggleProspect(): void {
    const org = this.organization();
    if (!org) return;
    
    const newProspectValue = !(org.salesPurchases?.isProspect ?? false);
    const updated: Organization = {
      ...org,
      salesPurchases: {
        ...org.salesPurchases,
        isProspect: newProspectValue,
        isCustomer: newProspectValue ? false : (org.salesPurchases?.isCustomer ?? false)
      }
    };
    
    this.updateOrganization(updated);
  }

  toggleCustomer(): void {
    const org = this.organization();
    if (!org) return;
    
    const newCustomerValue = !(org.salesPurchases?.isCustomer ?? false);
    const updated: Organization = {
      ...org,
      salesPurchases: {
        ...org.salesPurchases,
        isCustomer: newCustomerValue,
        isProspect: newCustomerValue ? false : (org.salesPurchases?.isProspect ?? false)
      }
    };
    
    this.updateOrganization(updated);
  }

  toggleSupplier(): void {
    const org = this.organization();
    if (!org) return;
    
    const updated: Organization = {
      ...org,
      salesPurchases: {
        ...org.salesPurchases,
        isSupplier: !(org.salesPurchases?.isSupplier ?? false)
      }
    };
    
    this.updateOrganization(updated);
  }

  toggleSubcontractor(): void {
    const org = this.organization();
    if (!org) return;
    
    const updated: Organization = {
      ...org,
      salesPurchases: {
        ...org.salesPurchases,
        isSubcontractor: !(org.salesPurchases?.isSubcontractor ?? false)
      }
    };
    
    this.updateOrganization(updated);
  }

  cloneOrganization(): void {
    console.log('Clone organization');
  }

  deleteOrganization(): void {
    const org = this.organization();
    if (!org || !org._id || !confirm('Are you sure you want to delete this organization?')) return;
    
    this.organizationService.delete(org._id).subscribe({
      next: () => {
        this.router.navigate(['/organizations']);
      },
      error: (err) => {
        this.error.set('Failed to delete organization');
        console.error('Error deleting organization:', err);
      }
    });
  }

  private updateOrganization(updated: Organization): void {
    if (!updated._id) return;
    
    this.organizationService.update(updated._id, updated).subscribe({
      next: (org) => {
        this.organization.set(org);
      },
      error: (err) => {
        this.error.set('Failed to update organization');
        console.error('Error updating organization:', err);
      }
    });
  }

  get progressValue(): number {
    return 60;
  }
}
