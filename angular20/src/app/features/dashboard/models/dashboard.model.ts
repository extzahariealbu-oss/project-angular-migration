// Evidence: Compiled from box.js controllers and API response analysis
// See: .knowledge/reports/epic-2-xai-generation-report.md.premature (API endpoints section)

export interface DateRange {
  start: Date;
  end: Date;
}

// Evidence: box.js:73-88 (BoxTemporaryController - billPenality endpoint)
export interface PenalityStats {
  total: number;
  cpt: number; // count
}

// Evidence: box.js:90-139 (BoxTemporaryController - bill/stats endpoint)
export interface BillStats {
  dataCaTotal: number;      // Total revenue HT
  TotalCaPrev: number;       // Revenue to invoice
  totalDebit: number;        // Total charges HT
  TotalCaST: number;         // Charges to invoice (sous-traitance)
}

// Evidence: box.js:141-164 (BoxTemporaryController - delivery/statistic endpoint)
export interface DeliveryForecast {
  caBdc: number;            // Command revenue
  caFacturable: number;     // Billable revenue
  nbJoursRestants: number;  // Days remaining in month
}

// Evidence: box.js:166-186 (BoxTemporaryController - accounting/balance endpoint)
export interface YearlyBalance {
  resultYear: number;       // Yearly result
}

// Evidence: box.js:670-773 (BoxBillController - caGraph endpoint)
export interface CAGraphData {
  ca: number;
  charge: number;
  subcontractor: number;
  salary: number;
  graph: {
    data: Array<{
      y: string;      // Period label (e.g., "Jan")
      a: number;      // CA value
      b: number;      // Charge value
      c: number;      // Subcontractor value
      d: number;      // Salary value
    }>;
    labels: string[];
  };
}

// Evidence: box.js:775-798 (BoxBillController - caCommercial endpoint)
export interface CommercialCA {
  data: Array<{
    name: string;
    total: number;
  }>;
  total: number;
}

// Evidence: box.js:800-819 (BoxBillController - caCustomer endpoint)
export interface CustomerCA {
  data: Array<{
    name: string;
    total_ht: number;
  }>;
}

// Evidence: box.js:833-877 (BoxBillController - caFamily endpoint)
export interface CAFamilyData {
  data: any[]; // Family data structure varies
}

// Evidence: box.js:833-877 (BoxBillController - caEvolution endpoint)
export interface CAEvolution {
  data: any[]; // Evolution data structure varies
}

// Evidence: box.js:1126-1171 (BoxBillSupplierController - chEvolution endpoint)
export interface ChargesEvolution {
  data: any[]; // Charges evolution data
}

// Evidence: box.js:1126-1171 (BoxBillSupplierController - chGraph endpoint)
export interface ChargesGraphData {
  graph: {
    data: any[];
    labels: string[];
  };
}

// Evidence: box.js:396-410 (BoxSalaryController - saEvolution endpoint)
export interface SalaryEvolution {
  data: any[]; // Salary evolution data
}

// Evidence: box.js:415-427 (BoxSalaryController - saGraph endpoint)
export interface SalaryGraphData {
  graph: {
    data: any[];
    labels: string[];
  };
}

// Dashboard summary combining top-box widget data
export interface DashboardSummary {
  penality: PenalityStats;
  bills: BillStats;
  yearlyResult: YearlyBalance;
  forecast: DeliveryForecast;
}
