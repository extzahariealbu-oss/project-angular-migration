// Evidence: /angularjs2/models/product.js

export interface ProductLangMeta {
  title?: string;
  description?: string;
}

export interface ProductLang {
  description?: string;
  shortDescription?: string;
  body?: string;
  name?: string;
  meta?: ProductLangMeta;
  linker?: string;
  Tag?: any[];
}

export interface ProductInfo {
  // productType can be an id or a populated object with langs/isProduct
  productType?: string | (ProductTypeRef & { _id?: string; isProduct?: boolean });
  isActive?: boolean;
  autoBarCode?: boolean;
  aclCode?: string;
  SKU: string;
  UPC?: string;
  ISBN?: string;
  EAN?: string;
  brand?: string;
  categories?: string[];
  taxes?: any[];
  notePrivate?: string;
  langs?: ProductLang[];
  optional?: Record<string, any>;
}

export interface ProductInventoryLang {
  availableLater?: string;
}

export interface ProductInventory {
  langs?: ProductInventoryLang[];
  minStockLevel?: number;
  maxStockLevel?: number;
  stockTimeLimit?: number;
}

export interface ProductTax {
  taxeId: string;
  value?: number;
}

export interface ProductPrice {
  currency?: string;
  pu_ht?: number;
  tva_tx?: number; // Deprecated - use product.taxes[] instead
  pricesQty?: Record<string, number>;
}

export interface SupplierPrice {
  societe?: string;
  ref?: string;
  taxes?: ProductTax[];
  minQty?: number;
  replenishmentTime?: number;
  prices?: ProductPrice;
  packing?: number;
}

export interface ProductAttributeChannel {
  channel: string;
  integrationId?: string;
}

export interface ProductAttribute {
  attribute: string;
  value?: any;
  options?: string[];
  channels?: ProductAttributeChannel[];
}

export interface BundleProduct {
  id: string;
  qty?: number;
}

// ProductStatus is a string enum (publication workflow)
export type ProductStatus = 'DRAFT' | 'PREPARED' | 'VALIDATED' | 'PUBLISHED';

// Display badge for status objects provided by API
export interface ProductStatusBadge {
  css?: string;
  name?: string;
}

export interface ProductTypeRef {
  name?: string;
  langs?: Array<{ name?: string }>;
  // present when populated; needed for declinations visibility
  isProduct?: boolean;
  isBundle?: boolean;
  isPackaging?: boolean;
  _id?: string;
}

export interface ProductFamilyRef {
  name?: string;
  langs?: Array<{ name?: string }>;
  _id?: string;
}

export interface ProductRating {
  total?: number;
  marketing?: number;
  attributes?: number;
  images?: number;
  categories?: number;
  ecommerce?: number;
}

export interface ProductChannelLink {
  linkId?: string;
}

export interface ProductChannelData {
  channelName?: string;
  baseUrl?: string;
  channels?: ProductChannelLink[];
}

export interface ProductChannels {
  active?: number;
  data?: ProductChannelData[];
}

export interface ProductUser {
  username?: string;
}

// Image reference object; API returns an object containing imageSrc
export interface ProductImageRef {
  imageSrc?: string;
}

export interface Product {
  _id?: string;
  ID?: number;
  name?: string;
  groupId?: string | null;
  // imageSrc is an object with imageSrc property (for detail/list usage)
  imageSrc?: ProductImageRef;
  entity?: string[];
  oldId?: string;

  isSell?: boolean;
  isBuy?: boolean;
  isBundle?: boolean;
  isPackaging?: boolean;
  isVariant?: boolean;
  isValidated?: boolean;
  canBeSold?: boolean;
  canBeExpensed?: boolean;
  eventSubscription?: boolean;
  onlyWeb?: boolean;
  istop?: boolean;
  ischat?: boolean;
  isremoved?: boolean;
  isProduct?: boolean;

  // Some UIs access a top-level isActive; mirror of info.isActive when present
  isActive?: boolean;

  info?: ProductInfo;
  inventory?: ProductInventory;

  compta_buy?: string;
  compta_buy_eu?: string;
  compta_buy_exp?: string;
  compta_sell?: string;
  compta_sell_eu?: string;
  compta_sell_exp?: string;

  attributes?: ProductAttribute[];
  variants?: string[];
  pack?: BundleProduct[];
  bundles?: BundleProduct[];

  // Evidence: price.html:91 - product.taxes[0].taxeId._id
  taxes?: ProductTax[];

  prices?: ProductPrice;
  directCost?: number;
  units?: string;
  weight?: number;
  packing?: number;
  // computed/aggregated packs count used by UI
  total_pack?: number;

  rating?: ProductRating;
  channels?: ProductChannels;

  // String status if needed by workflow logic
  status?: ProductStatus;
  // Separate badge objects provided by API for display
  _status?: ProductStatusBadge;
  Status?: ProductStatus | ProductStatusBadge;

  // Populated refs for list/detail views
  ProductTypes?: ProductTypeRef;
  ProductFamily?: ProductFamilyRef;
  // Explicit fields commonly used in controllers/templates
  type?: ProductTypeRef | string;
  sellFamily?: ProductFamilyRef | string;

  supplierPrices?: SupplierPrice[];

  quantity?: number;

  // Evidence: /angularjs2/app/views/product/images.html:358
  productImages?: string[];

  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: ProductUser;
  editedBy?: ProductUser;
}
