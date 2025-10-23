import { Injectable } from '@angular/core';
import { getImplementedMenuKeys, getRouteForMenuKey, MENU_MAPPINGS } from '../config/menu-mapping';

/**
 * Menu Filter Service
 * 
 * Filters backend menu structure to show only implemented features.
 * 
 * RULES:
 * - Only show menu items with status='implemented' in menu-mapping.ts
 * - Remove parent menus with no visible children
 * - Preserve menu hierarchy (up to 3 levels)
 * - Map AngularJS URLs to Angular 20 routes
 * - NO FALLBACKS - if backend fails, show error (don't add fake menus)
 */
@Injectable({
  providedIn: 'root'
})
export class MenuFilterService {

  /**
   * Filter backend menus by implementation status
   * 
   * @param backendMenus - Raw menu object from /erp/api/menus
   * @returns Filtered menu object with only implemented features and mapped routes
   */
  filterMenusByImplementation(backendMenus: any): any {
    const implementedKeys = getImplementedMenuKeys();
    
    if (!backendMenus || typeof backendMenus !== 'object') {
      return {};
    }

    return this.recursiveFilter(backendMenus, implementedKeys);
  }

  /**
   * Recursively filter menu structure
   * 
   * @param menus - Menu object or submenu object
   * @param allowedKeys - Set of implemented menu keys
   * @returns Filtered menu object with Angular routes mapped
   */
  private recursiveFilter(menus: any, allowedKeys: Set<string>): any {
    const filtered: any = {};

    for (const key in menus) {
      if (!menus.hasOwnProperty(key)) {
        continue;
      }

      const menuItem = menus[key];
      
      // Skip separators (they'll be preserved if between visible items)
      if (key.includes('---') || menuItem.title === '--') {
        // We'll add separators back later if needed
        continue;
      }

      // Check if this menu item should be visible
      const isAllowed = allowedKeys.has(key);
      
      // Check if this menu has submenus
      const hasSubmenus = menuItem.submenus && typeof menuItem.submenus === 'object';
      
      if (hasSubmenus) {
        // Recursively filter submenus
        const filteredSubmenus = this.recursiveFilter(menuItem.submenus, allowedKeys);
        const hasVisibleChildren = Object.keys(filteredSubmenus).length > 0;
        
        // Include parent menu if:
        // - It's explicitly allowed OR
        // - It has at least one visible child
        if (isAllowed || hasVisibleChildren) {
          filtered[key] = {
            ...menuItem,
            submenus: filteredSubmenus,
            // Map Angular route if available
            url: this.mapRoute(key, menuItem.url)
          };
        }
      } else {
        // Leaf menu item - include only if explicitly allowed
        if (isAllowed) {
          filtered[key] = { 
            ...menuItem,
            // Map Angular route
            url: this.mapRoute(key, menuItem.url)
          };
        }
      }
    }

    return filtered;
  }

  /**
   * Map backend AngularJS URL to Angular 20 route
   * 
   * @param menuKey - Backend menu key
   * @param backendUrl - AngularJS URL (e.g., "/erp/#!/product")
   * @returns Angular 20 route (e.g., "/products") or undefined
   */
  private mapRoute(menuKey: string, backendUrl?: string): string | undefined {
    // First, check if we have an explicit mapping
    const angularRoute = getRouteForMenuKey(menuKey);
    if (angularRoute) {
      return angularRoute;
    }

    // If no mapping and backend URL exists, return undefined (don't use unmapped URLs)
    return undefined;
  }

  /**
   * Check if a menu object is empty (no visible items)
   */
  isMenuEmpty(menu: any): boolean {
    if (!menu || typeof menu !== 'object') {
      return true;
    }
    return Object.keys(menu).length === 0;
  }
}
