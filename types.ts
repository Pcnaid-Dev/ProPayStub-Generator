export enum PayFrequency {
  Weekly = 'Weekly',
  BiWeekly = 'Bi-Weekly',
  SemiMonthly = 'Semi-Monthly',
  Monthly = 'Monthly',
}

export enum PayType {
  Hourly = 'Hourly',
  Salary = 'Salary',
}

export interface Deduction {
  id: string;
  name: string;
  amount: number;
  isPreTax: boolean;
}

export interface PaystubData {
  // Employee Info
  employeeName: string;
  address: string;
  cityStateZip: string;
  ssnLast4: string;
  employeeId: string;
  
  // Company Info
  companyName: string;
  companyAddress: string;
  
  // Bank Info
  bankName: string;
  accountLast4: string;

  // Pay Details
  payType: PayType;
  payFrequency: PayFrequency;
  hourlyRate: number;
  hoursPerWeek: number;
  holidayHours?: number; // New optional field
  annualSalary: number;
  
  // Dates
  hireDate: string;
  checkDate: string; // The most recent check date

  // Tax Configurations (Optional overrides, otherwise calculated)
  federalTaxRate: number; // Percentage 0-100
  stateTaxRate: number; // Percentage 0-100

  // Deductions
  deductions: Deduction[];
}

export interface CalculatedPaystub {
  periodStart: string;
  periodEnd: string;
  checkDate: string;
  checkNumber: number;
  
  current: {
    grossPay: number;
    federalTaxable: number;
    ficaTaxable: number;
    federalTax: number;
    socialSecurity: number;
    medicare: number;
    stateTax: number;
    preTaxDeductions: number;
    postTaxDeductions: number;
    netPay: number;
    hours: number;
  };
  
  ytd: {
    grossPay: number;
    federalTaxable: number;
    ficaTaxable: number;
    federalTax: number;
    socialSecurity: number;
    medicare: number;
    stateTax: number;
    preTaxDeductions: number;
    postTaxDeductions: number;
    netPay: number;
    hours: number;
  };

  lineItems: {
    earnings: Array<{ name: string; rate: number; hours: number; current: number; ytd: number }>;
    deductions: Array<{ name: string; current: number; ytd: number; isPreTax: boolean }>;
    taxes: Array<{ name: string; current: number; ytd: number }>;
    employerBenefits: Array<{ name: string; current: number; ytd: number }>;
  }
}