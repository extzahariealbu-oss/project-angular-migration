/**
 * Sidebar Component
 * Evidence: /angularjs2/themes/tm/views/layout.html
 * 
 * Menu from /erp/api/menus, filtered by implementation status
 * 
 * RULES:
 * - Load menus from backend API
 * - Filter to show only implemented features (menu-mapping.ts)
 * - NO FALLBACKS - if API fails, show error state
 * - Menu visibility controlled by implementation progress
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MenuFilterService } from '../../core/services/menu-filter.service';
import { filter } from 'rxjs';

interface MenuItemApi {
  title: string;
  url?: string;
  route?: string;
  icon?: string;
  position?: number;
  perms?: string | string[][];
  enabled?: string | boolean;
  submenus?: Record<string, MenuItemApi>;
}

interface MenuItem {
  name: string;
  url?: string;
  path?: string;
  queryParams?: Record<string, string>;
  icon?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];
  menuLoadError = false;
  menuLoading = true;
  expandedMenus = new Set<number>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private menuFilterService: MenuFilterService
  ) {}

  ngOnInit(): void {
    this.loadMenu();
    
    // Auto-expand menus based on current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.expandActiveMenus();
      });
  }

  toggleSubmenu(index: number): void {
    if (this.expandedMenus.has(index)) {
      this.expandedMenus.delete(index);
    } else {
      this.expandedMenus.add(index);
    }
  }

  /**
   * Auto-expand parent menus if their children match current route
   */
  private expandActiveMenus(): void {
    const currentUrl = this.router.url;
    
    this.menuItems.forEach((item, index) => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          child.url && currentUrl.startsWith(child.url)
        );
        
        if (hasActiveChild) {
          this.expandedMenus.add(index);
        }
      }
    });
  }

  loadMenu(): void {
    this.menuLoading = true;
    this.menuLoadError = false;

    this.http.get<Record<string, MenuItemApi>>('/erp/api/menus', { withCredentials: true })
      .subscribe({
        next: (backendMenus) => {
          // Filter menus by implementation status
          const filteredMenus = this.menuFilterService.filterMenusByImplementation(backendMenus);
          
          // Transform filtered menus to component format
          this.menuItems = this.transformMenuItems(filteredMenus);
          
          // Add Dashboard/Home menu at the top (not in backend API)
          this.menuItems.unshift({
            name: 'Accueil',
            url: '/dashboard',
            icon: 'home'
          });
          
          // Auto-expand menus based on current route
          this.expandActiveMenus();
          
          this.menuLoading = false;
        },
        error: (err) => {
          console.error('Failed to load menu:', err);
          // NO FALLBACK - show error state
          this.menuItems = [];
          this.menuLoadError = true;
          this.menuLoading = false;
        }
      });
  }

  /**
   * Transform backend menu structure to component format
   * Recursively processes menu items and submenus
   */
  private transformMenuItems(apiItems: Record<string, MenuItemApi>): MenuItem[] {
    // Convert object to array with position-based sorting
    const entries = Object.entries(apiItems)
      .map(([key, item]) => ({
        key,
        item,
        position: item.position || 0
      }))
      .sort((a, b) => a.position - b.position);

    return entries.map(({ item }) => this.transformMenuItem(item));
  }

  /**
   * Transform a single menu item
   */
  private transformMenuItem(item: MenuItemApi): MenuItem {
    const menuItem: MenuItem = {
      name: item.title,
      icon: this.mapIconToMaterial(item.icon)
    };

    // Parse URL to extract path and query params
    if (item.url) {
      const parsed = this.parseUrl(item.url);
      menuItem.path = parsed.path;
      menuItem.queryParams = parsed.queryParams;
      menuItem.url = item.url; // Keep for legacy/display
    }

    // Recursively transform submenus if present
    if (item.submenus && typeof item.submenus === 'object') {
      const children = this.transformMenuItems(item.submenus);
      if (children.length > 0) {
        menuItem.children = children;
      }
    }

    return menuItem;
  }

  /**
   * Parse URL string into path and query params
   * Example: "/organizations?forSales=1" → { path: "/organizations", queryParams: { forSales: "1" } }
   */
  private parseUrl(url: string): { path: string; queryParams?: Record<string, string> } {
    const [path, queryString] = url.split('?');
    
    if (!queryString) {
      return { path };
    }

    const queryParams: Record<string, string> = {};
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key) {
        queryParams[key] = value || '';
      }
    });

    return { path, queryParams };
  }

  /**
   * Map FontAwesome icon classes to Material Icon names
   */
  private mapIconToMaterial(faIcon?: string): string | undefined {
    if (!faIcon) return undefined;

    const iconMap: Record<string, string> = {
      'fa-home': 'home',
      'fa-dashboard': 'dashboard',
      'fa-shopping-cart': 'shopping_cart',
      'fa-cube': 'inventory_2',
      'fa-list': 'list',
      'fa-users': 'people',
      'fa-user': 'person',
      'fa-cog': 'settings',
      'fa-file': 'description',
      'fa-folder': 'folder',
      'fa-chart-bar': 'bar_chart',
      'fa-euro': 'euro',
      'fa-money': 'attach_money'
    };

    return iconMap[faIcon] || 'circle';
  }
}
