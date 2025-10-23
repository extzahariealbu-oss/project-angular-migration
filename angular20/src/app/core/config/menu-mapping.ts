/**
 * Menu Mapping Configuration
 * 
 * Maps AngularJS backend menu keys to Angular 20 routes based on implementation status.
 * 
 * RULES:
 * - Only add menus when the corresponding component/route is implemented and tested
 * - Status 'implemented' means the feature is complete and should be visible
 * - Backend menu keys from `/erp/api/menus` API response
 * - See `.knowledge/analysis/menu-structure-analysis.md` for complete menu structure
 */

export interface MenuMapping {
  /** Backend menu key (e.g., "menu:productlist") */
  menuKey: string;
  
  /** Angular 20 route path (e.g., "/products") */
  angularRoute: string;
  
  /** Epic-Task identifier (e.g., "EPIC-3-TASK-001") */
  epicTask: string;
  
  /** Implementation status */
  status: 'implemented' | 'planned' | 'not-started';
  
  /** Required permission from backend (optional, inherited from backend) */
  requiredPermission?: string;
  
  /** Notes about implementation */
  notes?: string;
}

/**
 * Current Menu Mappings (Epic 3 - Product Management in progress)
 * 
 * UPDATE THIS ARRAY as each Epic/Task completes:
 * 1. Change status from 'planned' to 'implemented'
 * 2. Add angularRoute if not set
 * 3. Run tests to verify
 * 4. Menu will automatically appear in sidebar
 */
export const MENU_MAPPINGS: MenuMapping[] = [
  // ============================================================================
  // EPIC 3: PRODUCT MANAGEMENT
  // ============================================================================
  
  {
    menuKey: 'menu:products',
    angularRoute: '', // Parent menu, no direct route
    epicTask: 'EPIC-3',
    status: 'implemented',
    notes: 'Top-level parent menu. Visible if any child is implemented.'
  },
  
  {
    menuKey: 'menu:productlist',
    angularRoute: '/products',
    epicTask: 'EPIC-3-TASK-001',
    status: 'implemented',
    requiredPermission: 'product.read',
    notes: 'Product list view with search and pagination'
  },
  
  {
    menuKey: 'menu:productfamily',
    angularRoute: '', // NOT a menu item - family data is used in ProductDetailComponent dropdown, no separate route
    epicTask: 'EPIC-3-TASK-002',
    status: 'planned', // DO NOT SHOW - not a separate page, just API data
    requiredPermission: 'product.read',
    notes: 'Product families API is working but this is not a separate menu/page - families appear in product detail form dropdown'
  },
  
  {
    menuKey: 'menu:productpricelevel',
    angularRoute: '/products/price-levels', // TODO: Create route when implemented
    epicTask: 'EPIC-3-TASK-003',
    status: 'planned',
    requiredPermission: 'product.read',
    notes: 'Price level management - not yet implemented'
  },
  
  {
    menuKey: 'menu:productattributes',
    angularRoute: '/products/attributes', // TODO: Create route when implemented
    epicTask: 'EPIC-3-TASK-004',
    status: 'planned',
    requiredPermission: 'product.read',
    notes: 'Product attributes management - not yet implemented'
  },
  
  {
    menuKey: 'menu:productcategories',
    angularRoute: '/products/categories', // TODO: Create route when implemented
    epicTask: 'EPIC-3-TASK-005',
    status: 'planned',
    requiredPermission: 'product.read',
    notes: 'Product categories management - not yet implemented'
  },
  
  {
    menuKey: 'menu:images',
    angularRoute: '/products/images', // TODO: Create route when implemented
    epicTask: 'EPIC-3-TASK-006',
    status: 'planned',
    requiredPermission: 'product.read',
    notes: 'Product images management - not yet implemented'
  },
  
  {
    menuKey: 'menu:productconsumption',
    angularRoute: '/products/consumption', // TODO: Create route when implemented
    epicTask: 'EPIC-3-TASK-007',
    status: 'planned',
    requiredPermission: 'product.read',
    notes: 'Product consumption statistics - not yet implemented'
  },
  
  // ============================================================================
  // EPIC 4: ORGANIZATIONS MANAGEMENT (Phase 2 Complete - E2E Tests Pending)
  // ============================================================================
  
  {
    menuKey: 'menu:organizations',
    angularRoute: '',
    epicTask: 'EPIC-4',
    status: 'implemented',
    notes: 'Top-level parent menu for customers/suppliers'
  },
  
  {
    menuKey: 'menu:customers',
    angularRoute: '/organizations?forSales=1',
    epicTask: 'EPIC-4-TASK-2.1',
    status: 'implemented',
    requiredPermission: 'societe.read',
    notes: 'Organizations list filtered for customers (forSales=1). Evidence: list.html L9-10'
  },
  
  {
    menuKey: 'menu:suppliers',
    angularRoute: '/organizations?forSales=0',
    epicTask: 'EPIC-4-TASK-2.1',
    status: 'implemented',
    requiredPermission: 'societe.read',
    notes: 'Organizations list filtered for suppliers (forSales=0). Evidence: list.html L12-13'
  },
  
  {
    menuKey: 'menu:contacts',
    angularRoute: '/organizations?type=Person',
    epicTask: 'EPIC-4-TASK-2.2.5',
    status: 'implemented',
    requiredPermission: 'contact.read',
    notes: 'Organizations list filtered for contacts/persons (type=Person). Evidence: list.html L15-16'
  },
  
  {
    menuKey: 'menu:thirdpartystats',
    angularRoute: '', // Stats tab is stub, no separate route
    epicTask: 'EPIC-4-TASK-2.2.9',
    status: 'planned',
    requiredPermission: 'societe.stats',
    notes: 'Stats tab implemented as stub (Handsontable integration pending)'
  },
  
  // ============================================================================
  // EPIC 5: ORDERS MANAGEMENT (Not Started)
  // ============================================================================
  
  {
    menuKey: 'menu:orders',
    angularRoute: '',
    epicTask: 'EPIC-5',
    status: 'not-started',
    notes: 'Top-level parent menu for orders'
  },
  
  {
    menuKey: 'menu:offerlist',
    angularRoute: '/offers', // TODO: Create route
    epicTask: 'EPIC-5-TASK-001',
    status: 'not-started',
    requiredPermission: 'offer.read'
  },
  
  {
    menuKey: 'menu:orderslist',
    angularRoute: '/orders', // TODO: Create route
    epicTask: 'EPIC-5-TASK-002',
    status: 'not-started',
    requiredPermission: 'order.read'
  },
  
  // ============================================================================
  // FUTURE EPICS (Not Yet Planned)
  // ============================================================================
  // Add mappings for:
  // - menu:purchase (Purchases)
  // - menu:delivery (Logistics)
  // - menu:stock (Stock)
  // - menu:invoices (Invoices)
  // - menu:accounting (Accounting)
  // - menu:HR (HR)
  // - menu:parameters (Settings)
];

/**
 * Helper function to get all implemented menu keys
 */
export function getImplementedMenuKeys(): Set<string> {
  return new Set(
    MENU_MAPPINGS
      .filter(m => m.status === 'implemented')
      .map(m => m.menuKey)
  );
}

/**
 * Helper function to get Angular route for a menu key
 */
export function getRouteForMenuKey(menuKey: string): string | undefined {
  const mapping = MENU_MAPPINGS.find(m => m.menuKey === menuKey);
  return mapping?.status === 'implemented' ? mapping.angularRoute : undefined;
}
