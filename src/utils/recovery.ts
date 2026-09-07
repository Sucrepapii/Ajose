/**
 * Default Recovery & Credit Direct Limited (CDL) Loan Conversion Engine
 * Implements the approved late fee policy: Flat 5% late fee + 2.5% monthly penal interest.
 * Restructures delinquent contributions into formal consumer loans with Credit Direct Limited.
 */

export interface RecoveryCalculation {
  originalDefaultAmount: number;
  daysOverdue: number;
  flatLateFeeRatePct: number; // 5%
  flatLateFeeAmount: number;
  monthlyPenalInterestRatePct: number; // 2.5%
  accruedPenalInterest: number;
  totalRecoveryOwed: number;
}

/**
 * Computes exact default penalties based on approved policy:
 * Flat 5% Late Fee + 2.5% Monthly Penal Interest.
 */
export function calculateDefaultRecovery({
  amount,
  daysOverdue = 1
}: {
  amount: number;
  daysOverdue?: number;
}): RecoveryCalculation {
  const flatLateFeeRatePct = 5.0; // 5% flat
  const monthlyPenalInterestRatePct = 2.5; // 2.5% monthly

  const flatLateFeeAmount = Math.round(amount * (flatLateFeeRatePct / 100));
  
  // Accrue 2.5% interest proportionally for the overdue duration (30 days/month)
  const elapsedMonths = Math.max(1, daysOverdue) / 30;
  const accruedPenalInterest = Math.round(amount * (monthlyPenalInterestRatePct / 100) * elapsedMonths);

  const totalRecoveryOwed = amount + flatLateFeeAmount + accruedPenalInterest;

  return {
    originalDefaultAmount: amount,
    daysOverdue,
    flatLateFeeRatePct,
    flatLateFeeAmount,
    monthlyPenalInterestRatePct,
    accruedPenalInterest,
    totalRecoveryOwed
  };
}

export interface CdlLoanConversionResult {
  cdlLoanId: string;
  underwriterName: "Credit Direct Limited (CDL)";
  debtorName: string;
  debtorBvn: string;
  originalContributionDue: number;
  recalculatedDebtAmount: number;
  cdlAnnualPercentageRatePct: number;
  repaymentTermMonths: number;
  monthlyInstallment: number;
  status: "CONVERTED_TO_LOAN";
  secondarySweepTargetAccounts: string[];
  conversionTimestamp: string;
  summary: string;
}

/**
 * Restructures an unpaid Àjọṣe contribution into a formal Credit Direct Limited (CDL) personal loan.
 * Keeps the circle whole by advancing the contribution to the receiving member, while CDL assumes
 * legal claim over the delinquent member.
 */
export async function convertDefaultToCdlLoan({
  memberId,
  memberName,
  bvn,
  groupId,
  defaultedTurn,
  defaultAmount,
  daysOverdue = 3,
  linkedAccounts = []
}: {
  memberId: string;
  memberName: string;
  bvn: string;
  groupId: string;
  defaultedTurn: number;
  defaultAmount: number;
  daysOverdue?: number;
  linkedAccounts?: Array<{ bankName: string; accountNumberMasked: string }>;
}): Promise<CdlLoanConversionResult> {
  const recovery = calculateDefaultRecovery({ amount: defaultAmount, daysOverdue });
  const cdlLoanId = `CDL-LN-${groupId.slice(0, 4).toUpperCase()}-T${defaultedTurn}-${Math.floor(100000 + Math.random() * 900000)}`;

  const termMonths = 3; // 3-month restructuring period
  const monthlyInstallment = Math.round(recovery.totalRecoveryOwed / termMonths);

  const targetAccounts = linkedAccounts.length > 0 
    ? linkedAccounts.map(a => `${a.bankName} (${a.accountNumberMasked})`)
    : ["Access Bank (******4821)", "Zenith Bank (******7712)"];

  return {
    cdlLoanId,
    underwriterName: "Credit Direct Limited (CDL)",
    debtorName: memberName,
    debtorBvn: bvn,
    originalContributionDue: defaultAmount,
    recalculatedDebtAmount: recovery.totalRecoveryOwed,
    cdlAnnualPercentageRatePct: 30.0, // 2.5% * 12
    repaymentTermMonths: termMonths,
    monthlyInstallment,
    status: "CONVERTED_TO_LOAN",
    secondarySweepTargetAccounts: targetAccounts,
    conversionTimestamp: new Date().toISOString(),
    summary: `Default of ₦${defaultAmount.toLocaleString()} advanced to group pool by Credit Direct Limited. Restructured as 3-month personal loan (${cdlLoanId}) with 5% flat late fee + 2.5%/mo penal interest.`
  };
}
