/**
 * Application Routes
 * Evidence: /angularjs2/themes/tm/views/layout.html
 * Base href: /erp/
 */

import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./features/products/product-detail/product-detail').then(m => m.ProductDetailComponent)
      },
      {
        path: 'organizations',
        loadComponent: () => import('./features/organizations/pages/organizations-list/organizations-list.page').then(m => m.OrganizationsListPage)
      },
      {
        path: 'organizations/:id',
        loadComponent: () => import('./features/organizations/pages/organization-detail/organization-detail').then(m => m.OrganizationDetailComponent),
        children: [
          {
            path: '',
            redirectTo: 'company',
            pathMatch: 'full'
          },
          {
            path: 'company',
            loadComponent: () => import('./features/organizations/components/organization-detail/tabs/company-info-tab/company-info-tab.component').then(m => m.CompanyInfoTabComponent)
          },
          {
            path: 'person',
            loadComponent: () => import('./features/organizations/components/organization-detail/tabs/company-info-tab/company-info-tab.component').then(m => m.CompanyInfoTabComponent)
          },
          {
            path: 'commercial',
            loadComponent: () => import('./features/organizations/components/commercial-tab/commercial-tab.component').then(m => m.CommercialTabComponent)
          },
          {
            path: 'billing',
            loadComponent: () => import('./features/organizations/components/billing-tab/billing-tab.component').then(m => m.BillingTabComponent)
          },
          {
            path: 'addresses',
            loadComponent: () => import('./features/organizations/components/addresses-tab/addresses-tab.component').then(m => m.AddressesTabComponent)
          },
          {
            path: 'attributes',
            loadComponent: () => import('./features/organizations/components/organization-detail/tabs/company-info-tab/company-info-tab.component').then(m => m.CompanyInfoTabComponent)
          },
          {
            path: 'task',
            loadComponent: () => import('./features/organizations/components/task-tab/task-tab.component').then(m => m.TaskTabComponent)
          },
          {
            path: 'files',
            loadComponent: () => import('./features/organizations/components/files-tab/files-tab.component').then(m => m.FilesTabComponent)
          },
          {
            path: 'feeds',
            loadComponent: () => import('./features/organizations/components/feeds-tab/feeds-tab.component').then(m => m.FeedsTabComponent)
          },
          {
            path: 'stats',
            loadComponent: () => import('./features/organizations/components/stats-tab/stats-tab.component').then(m => m.StatsTabComponent)
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
