import { PayFrequency, PayType, PaystubData, CalculatedPaystub, Deduction } from '../types';
import { subDays, format, parseISO, differenceInCalendarDays, startOfYear, isBefore } from 'date-fns';

const SOCIAL_SECURITY_RATE = 0.062;
const MEDICARE_RATE = 0.0145;

export const getFrequencyPerYear = (freq: PayFrequency): number => {
  switch (freq) {
    case PayFrequency.Weekly: return 52;
    case PayFrequency.BiWeekly: return 26;
    case PayFrequency.SemiMonthly: return 24;
    case PayFrequency.Monthly: return 12;
    default: return 26;
  }
};

const getPeriodLengthInDays = (freq: PayFrequency): number => {
  switch (freq) {
    case PayFrequency.Weekly: return 7;
    case PayFrequency.BiWeekly: return 14;
    case PayFrequency.SemiMonthly: return 15; // Approx
    case PayFrequency.Monthly: return 30; // Approx
    default: return 14;
  }
};

// Deterministic random number generator based on seed string
const getPseudoRandom = (seed: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const normalized = (Math.abs(hash) % 1000) / 1000; 
    return min + (normalized * (max - min));
};

export const calculatePaystub = (data: PaystubData, periodsBack: number = 0): CalculatedPaystub => {
  const checkDate = parseISO(data.checkDate);
  const freqPerYear = getFrequencyPerYear(data.payFrequency);
  const periodDays = getPeriodLengthInDays(data.payFrequency);

  // 1. Determine Dates
  const offsetDays = periodsBack * periodDays;
  const currentCheckDate = subDays(checkDate, offsetDays);
  const periodEnd = subDays(currentCheckDate, 3); 
  const periodStart = subDays(periodEnd, periodDays - 1);

  // 2. Calculate Gross Pay Components (Current)
  let regHours = 0;
  let regRate = 0;
  let regAmount = 0;
  
  let otHours = 0;
  let otRate = 0;
  let otAmount = 0;

  let holHours = data.holidayHours || 0;
  let holRate = 0;
  let holAmount = 0;

  if (data.payType === PayType.Hourly) {
    regRate = data.hourlyRate;
    otRate = data.hourlyRate * 1.5;
    holRate = data.hourlyRate;

    // Calculate hours per pay period
    let periodHours = data.hoursPerWeek;
    if (data.payFrequency === PayFrequency.BiWeekly) periodHours *= 2;
    else if (data.payFrequency === PayFrequency.SemiMonthly) periodHours = (data.hoursPerWeek * 52) / 24;
    else if (data.payFrequency === PayFrequency.Monthly) periodHours = (data.hoursPerWeek * 52) / 12;

    // Split Overtime (Assuming 40hr work week base)
    // If BiWeekly (2 weeks), threshold is 80. Weekly is 40.
    let otThreshold = 40;
    if (data.payFrequency === PayFrequency.BiWeekly) otThreshold = 80;
    else if (data.payFrequency === PayFrequency.SemiMonthly) otThreshold = 86.67;
    else if (data.payFrequency === PayFrequency.Monthly) otThreshold = 173.33;

    if (periodHours > otThreshold) {
        regHours = otThreshold;
        otHours = periodHours - otThreshold;
    } else {
        regHours = periodHours;
        otHours = 0;
    }

    regAmount = regHours * regRate;
    otAmount = otHours * otRate;
    holAmount = holHours * holRate;

  } else {
    // Salary
    regAmount = data.annualSalary / freqPerYear;
    regRate = data.annualSalary / 2080; // Informational hourly rate
    
    // Set informative hours
    if (data.payFrequency === PayFrequency.BiWeekly) regHours = 80;
    else if (data.payFrequency === PayFrequency.Weekly) regHours = 40;
    else regHours = 2080 / freqPerYear;

    // Holiday usually included in salary, but if added explicitly as extra:
    holAmount = (data.annualSalary / 2080) * holHours;
  }

  const currentGross = regAmount + otAmount + holAmount;
  const currentTotalHours = regHours + otHours + holHours;

  // 3. Calculate Deductions (Current)
  const preTaxDeds = data.deductions.filter(d => d.isPreTax);
  const postTaxDeds = data.deductions.filter(d => !d.isPreTax);

  const currentPreTaxTotal = preTaxDeds.reduce((acc, d) => acc + d.amount, 0);
  const currentPostTaxTotal = postTaxDeds.reduce((acc, d) => acc + d.amount, 0);

  // 4. Calculate Taxable Wages
  const federalTaxable = Math.max(0, currentGross - currentPreTaxTotal);
  const ficaTaxable = currentGross; 

  // 5. Calculate Taxes (Current)
  const fedTax = federalTaxable * (data.federalTaxRate / 100);
  const socSec = ficaTaxable * SOCIAL_SECURITY_RATE;
  const medicare = ficaTaxable * MEDICARE_RATE;
  const stateTax = federalTaxable * (data.stateTaxRate / 100);

  // 6. Calculate Net Pay
  const totalTaxes = fedTax + socSec + medicare + stateTax;
  const netPay = currentGross - currentPreTaxTotal - totalTaxes - currentPostTaxTotal;

  // 7. Calculate YTD
  const yearStart = startOfYear(currentCheckDate);
  const hireDate = parseISO(data.hireDate);
  const effectiveStartDate = isBefore(hireDate, yearStart) ? yearStart : hireDate;
  
  const daysSinceStart = differenceInCalendarDays(currentCheckDate, effectiveStartDate);
  const periodsElapsed = Math.max(1, Math.floor(daysSinceStart / periodDays));
  
  const ytdMult = periodsElapsed;

  const ytdGross = currentGross * ytdMult;
  const ytdFedTaxable = federalTaxable * ytdMult;
  const ytdFicaTaxable = ficaTaxable * ytdMult;
  const ytdPreTax = currentPreTaxTotal * ytdMult;
  const ytdPostTax = currentPostTaxTotal * ytdMult;
  const ytdFed = fedTax * ytdMult;
  const ytdSocSec = socSec * ytdMult;
  const ytdMedicare = medicare * ytdMult;
  const ytdState = stateTax * ytdMult;
  const ytdNet = netPay * ytdMult;
  const ytdHours = currentTotalHours * ytdMult;

  // 8. Format Line Items
  const earnings = [];
  
  // Regular/Salary Line
  earnings.push({
      name: data.payType === PayType.Hourly ? "Regular Pay" : "Salary",
      rate: regRate,
      hours: regHours,
      current: regAmount,
      ytd: regAmount * ytdMult
  });

  // Overtime Line
  if (otHours > 0 || (data.payType === PayType.Hourly && data.hoursPerWeek > 40)) {
       earnings.push({
           name: "Overtime Pay",
           rate: otRate,
           hours: otHours,
           current: otAmount,
           ytd: otAmount * ytdMult
       });
  }

  // Holiday Line
  if (holHours > 0) {
      earnings.push({
          name: "Holiday Pay",
          rate: holRate || regRate,
          hours: holHours,
          current: holAmount,
          ytd: holAmount * ytdMult
      });
  }

  const taxLines = [
    { name: "Federal Withholding", current: fedTax, ytd: ytdFed },
    { name: "Social Security", current: socSec, ytd: ytdSocSec },
    { name: "Medicare", current: medicare, ytd: ytdMedicare },
    ...(stateTax > 0 ? [{ name: "State Withholding", current: stateTax, ytd: ytdState }] : [])
  ];

  const dedLines = data.deductions.map(d => ({
    name: d.name,
    isPreTax: d.isPreTax,
    current: d.amount,
    ytd: d.amount * ytdMult
  }));

  // Employer Paid Benefits (Deterministic Random)
  // Seed with employee name + id to keep consistent for user
  const seed = (data.employeeName || "") + (data.employeeId || "");
  const medER = getPseudoRandom(seed + "MED", 400, 600);
  const denER = getPseudoRandom(seed + "DEN", 20, 50);
  const visER = getPseudoRandom(seed + "VIS", 5, 15);
  const lifeER = getPseudoRandom(seed + "LIFE", 5, 12);
  const k401ER = getPseudoRandom(seed + "401K", 50, 150);

  const employerBenefits = [
      { name: "Medical (ER)", current: medER, ytd: medER * ytdMult },
      { name: "Dental (ER)", current: denER, ytd: denER * ytdMult },
      { name: "Vision (ER)", current: visER, ytd: visER * ytdMult },
      { name: "Life Ins (ER)", current: lifeER, ytd: lifeER * ytdMult },
      { name: "401k Match", current: k401ER, ytd: k401ER * ytdMult },
  ];

  const checkNumber = 1000 + periodsElapsed;

  return {
    periodStart: format(periodStart, 'MM/dd/yyyy'),
    periodEnd: format(periodEnd, 'MM/dd/yyyy'),
    checkDate: format(currentCheckDate, 'MM/dd/yyyy'),
    checkNumber,
    current: {
      grossPay: currentGross,
      federalTaxable,
      ficaTaxable,
      federalTax: fedTax,
      socialSecurity: socSec,
      medicare: medicare,
      stateTax: stateTax,
      preTaxDeductions: currentPreTaxTotal,
      postTaxDeductions: currentPostTaxTotal,
      netPay,
      hours: currentTotalHours
    },
    ytd: {
      grossPay: ytdGross,
      federalTaxable: ytdFedTaxable,
      ficaTaxable: ytdFicaTaxable,
      federalTax: ytdFed,
      socialSecurity: ytdSocSec,
      medicare: ytdMedicare,
      stateTax: ytdState,
      preTaxDeductions: ytdPreTax,
      postTaxDeductions: ytdPostTax,
      netPay: ytdNet,
      hours: ytdHours
    },
    lineItems: {
      earnings,
      taxes: taxLines,
      deductions: dedLines,
      employerBenefits
    }
  };
};