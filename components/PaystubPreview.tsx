import React from 'react';
import { PaystubData } from '../types';
import { calculatePaystub } from '../services/calculations';

interface Props {
  data: PaystubData;
}

const fmt = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const IMbBarcode = () => {
  const bars = Array.from({ length: 65 }).map((_, i) => {
    const type = Math.floor(Math.random() * 4);
    let heightClass = '';
    let posClass = '';
    switch(type) {
        case 0: heightClass = 'h-[35%]'; posClass = 'self-center'; break;
        case 1: heightClass = 'h-[65%]'; posClass = 'self-start'; break;
        case 2: heightClass = 'h-[65%]'; posClass = 'self-end'; break;
        case 3: heightClass = 'h-full'; posClass = ''; break;
    }
    return <div key={i} className={`w-[2px] bg-black ${heightClass} ${posClass}`}></div>
  });
  return (
    <div className="flex justify-between items-center w-[180px] h-[16px] mb-2 gap-[1px]">
        {bars}
    </div>
  );
};

export const PaystubPreview: React.FC<Props> = ({ data }) => {
  const stub = calculatePaystub(data);
  const totalTax = stub.current.federalTax + stub.current.socialSecurity + stub.current.medicare + stub.current.stateTax;

  return (
    <div className="bg-gray-100 p-8 h-full overflow-y-auto flex justify-center">
      <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[15mm] text-[10px] font-serif text-gray-900 border border-gray-300 relative leading-tight overflow-hidden flex flex-col">
        
        {/* WATERMARK (Background Layer) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="transform -rotate-45 text-gray-100 font-sans font-bold text-8xl text-center select-none">
                PAY STATEMENT
            </div>
        </div>

        {/* HEADER */}
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                {/* Codes Box */}
                <div className="bg-gray-50 border border-gray-100 p-2 w-[250px] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '2px 2px' }}></div>
                    <div className="font-mono text-[9px] grid grid-cols-5 gap-2 relative z-10">
                        <div><div className="font-bold">00457</div><div className="text-[7px]">CO.</div></div>
                        <div><div className="font-bold">529659</div><div className="text-[7px]">FILE</div></div>
                        <div><div className="font-bold">035300</div><div className="text-[7px]">DEPT.</div></div>
                        <div><div className="font-bold"></div><div className="text-[7px]">CLOCK</div></div>
                        <div><div className="font-bold">000030112</div><div className="text-[7px] whitespace-nowrap">VCHR. NO.</div></div>
                    </div>
                </div>

                {/* Check Info */}
                <div className="text-right text-[11px]">
                    <div className="grid grid-cols-[120px_1fr] gap-x-2">
                        <span className="text-gray-600">Check Number</span><span className="font-bold">{stub.checkNumber}</span>
                        <span className="text-gray-600">Batch Number</span><span className="font-bold">S00661484</span>
                        <span className="text-gray-600">Pay Period</span><span className="font-bold">{stub.periodEnd}</span>
                        <span className="text-gray-600">Check Date</span><span className="font-bold">{stub.checkDate}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-end border-b border-gray-300 pb-2 mb-4">
                <h1 className="text-2xl font-serif">Statement of Earnings and Deductions</h1>
                {/* ADP Logo Removed */}
            </div>

            {/* EMPLOYEE INFO */}
            <div className="flex mb-8">
                {/* Left: ID & Marital */}
                <div className="w-[40%]">
                    <div className="font-bold mb-4">Employee Id: {data.employeeId}</div>
                    
                    <div className="grid grid-cols-[130px_40px_60px] gap-1 text-[9px] border-b border-gray-300 pb-1 mb-1 font-bold">
                        <div>Marital Status/Exemptions</div>
                        <div></div>
                        <div className="text-center">Amounts</div>
                    </div>
                    <div className="grid grid-cols-[130px_40px_60px] gap-1 text-[9px]">
                        <div>Federal</div><div>S 03</div><div className="text-center">0</div>
                        <div>Work State TX</div><div>N/A N/A</div><div className="text-center">0</div>
                        <div>Res State TX</div><div>N/A N/A</div><div className="text-center">0</div>
                    </div>
                </div>

                {/* Right: Address */}
                <div className="w-[60%] pl-10">
                    <div className="font-bold uppercase mb-1">{data.employeeName}</div>
                    <div className="uppercase">{data.address}</div>
                    <div className="uppercase mb-2">{data.cityStateZip}</div>
                    <IMbBarcode />
                </div>
            </div>

            {/* SUMMARY BLOCK */}
            <div className="mb-6">
                {/* Headers */}
                <div className="bg-gray-100 py-1 px-2 flex font-bold text-[10px] border-t border-b border-gray-300">
                    <div className="w-[50%] flex">
                        <span className="w-1/3">This Period</span>
                        {data.payType === 'Hourly' && <span className="w-1/3 text-center font-normal">Reg. Rate {data.hourlyRate.toFixed(2)}</span>}
                        <span className="w-1/3"></span> {/* Ovt Rate Removed */}
                    </div>
                    <div className="w-[50%] flex pl-4">
                        <span className="w-1/3">Tax Information</span>
                        <span className="w-1/3 text-right">Taxable</span>
                        <span className="w-1/3 text-right">Y-T-D</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex pt-2">
                    {/* Left Summary */}
                    <div className="w-[50%] pr-4 space-y-1">
                        <div className="flex justify-between">
                            <span>{data.payType === 'Hourly' ? 'Regular Pay' : 'Salary'}</span>
                            <span>{fmt(stub.current.grossPay - (stub.lineItems.earnings.find(e => e.name.includes("Overtime") || e.name.includes("Holiday"))?.current || 0))}</span>
                        </div>
                        {data.holidayHours ? (
                             <div className="flex justify-between">
                                <span>Holiday</span>
                                <span>{fmt(stub.lineItems.earnings.find(e => e.name === "Holiday Pay")?.current || 0)}</span>
                            </div>
                        ) : null}
                        
                        <div className="flex justify-between pt-2">
                            <span>Total Taxes Withheld</span>
                            <span>{fmt(totalTax)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2">
                            <span>Net Amount</span>
                            <span>{fmt(stub.current.netPay)}</span>
                        </div>
                    </div>

                    {/* Right Summary */}
                    <div className="w-[50%] pl-4 space-y-1 border-l border-gray-200">
                         <div className="flex justify-between">
                            <span>Federal Wages</span>
                            <div className="flex gap-6">
                                <span className="w-16 text-right">{fmt(stub.current.federalTaxable)}</span>
                                <span className="w-16 text-right">{fmt(stub.ytd.federalTaxable)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span>FICA Wages</span>
                            <div className="flex gap-6">
                                <span className="w-16 text-right">{fmt(stub.current.ficaTaxable)}</span>
                                <span className="w-16 text-right">{fmt(stub.ytd.ficaTaxable)}</span>
                            </div>
                        </div>
                         <div className="flex justify-between">
                            <span>Medicare Wages</span>
                            <div className="flex gap-6">
                                <span className="w-16 text-right">{fmt(stub.current.ficaTaxable)}</span>
                                <span className="w-16 text-right">{fmt(stub.ytd.ficaTaxable)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TOTALS BAR */}
            <div className="bg-gray-200 p-2 mb-8 flex border-t border-b border-gray-300 font-bold">
                <div className="w-[50%] flex justify-between pr-4 border-r border-gray-400">
                    <span>CURRENT TOTAL WAGES / TAXES</span>
                    <div className="flex gap-6">
                        <span>{fmt(stub.current.grossPay)}</span>
                        <span>{fmt(totalTax)}</span>
                    </div>
                </div>
                <div className="w-[50%] flex justify-between pl-4">
                    <span>NET PAY THIS PERIOD / Y-T-D</span>
                    <div className="flex gap-6">
                        <span>{fmt(stub.current.netPay)}</span>
                        <span>{fmt(stub.ytd.netPay)}</span>
                    </div>
                </div>
            </div>

            {/* DETAILS COLUMNS */}
            <div className="flex gap-8 mb-8">
                {/* Left Col */}
                <div className="w-[50%] space-y-6">
                    {/* Payments */}
                    <div>
                        <div className="bg-gray-100 font-bold p-1 flex justify-between border-b border-gray-300">
                            <span>Payments</span>
                            <div className="flex gap-4">
                                <span className="w-16 text-right">Amount</span>
                                <span className="w-16 text-right">Hours</span>
                            </div>
                        </div>
                        {stub.lineItems.earnings.map((e, i) => (
                            <div key={i} className="flex justify-between py-1 border-b border-gray-100">
                                <span>{e.name}</span>
                                <div className="flex gap-4">
                                    <span className="w-16 text-right">{fmt(e.current)}</span>
                                    <span className="w-16 text-right">{fmt(e.hours)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Employer Benefits */}
                    <div>
                        <div className="bg-gray-100 font-bold p-1 flex justify-between border-b border-gray-300">
                            <span>Employer Paid Benefits (Info Only)</span>
                            <div className="flex gap-4">
                                <span className="w-16 text-right">Current</span>
                                <span className="w-16 text-right">YTD</span>
                            </div>
                        </div>
                        {stub.lineItems.employerBenefits.map((b, i) => (
                            <div key={i} className="flex justify-between py-1 border-b border-gray-100">
                                <span>{b.name}</span>
                                <div className="flex gap-4">
                                    <span className="w-16 text-right">{fmt(b.current)}</span>
                                    <span className="w-16 text-right">{fmt(b.ytd)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Col */}
                <div className="w-[50%]">
                    <div className="bg-gray-100 font-bold p-1 flex justify-between border-b border-gray-300">
                        <span>Deductions / Benefits</span>
                        <div className="flex gap-4">
                            <span className="w-16 text-right">Amount</span>
                            <span className="w-16 text-right">YTD</span>
                        </div>
                    </div>
                    
                    {/* Taxes Group */}
                    <div className="text-[9px] font-bold text-gray-500 mt-1 uppercase">Taxes</div>
                    {stub.lineItems.taxes.map((t, i) => (
                        <div key={`tax-${i}`} className="flex justify-between py-1 border-b border-gray-100">
                            <span>{t.name}</span>
                            <div className="flex gap-4">
                                <span className="w-16 text-right">{fmt(t.current)}</span>
                                <span className="w-16 text-right">{fmt(t.ytd)}</span>
                            </div>
                        </div>
                    ))}

                    {/* Pre-Tax Group */}
                    <div className="text-[9px] font-bold text-gray-500 mt-2 uppercase">Pre-Tax</div>
                    {stub.lineItems.deductions.filter(d => d.isPreTax).map((d, i) => (
                        <div key={`pre-${i}`} className="flex justify-between py-1 border-b border-gray-100">
                            <span>{d.name}</span>
                            <div className="flex gap-4">
                                <span className="w-16 text-right">{fmt(d.current)}</span>
                                <span className="w-16 text-right">{fmt(d.ytd)}</span>
                            </div>
                        </div>
                    ))}
                    {stub.lineItems.deductions.filter(d => d.isPreTax).length === 0 && <div className="italic text-gray-400 text-[9px] py-1">None</div>}

                    {/* Post-Tax Group */}
                    <div className="text-[9px] font-bold text-gray-500 mt-2 uppercase">Post-Tax</div>
                    {stub.lineItems.deductions.filter(d => !d.isPreTax).map((d, i) => (
                        <div key={`post-${i}`} className="flex justify-between py-1 border-b border-gray-100">
                            <span>{d.name}</span>
                            <div className="flex gap-4">
                                <span className="w-16 text-right">{fmt(d.current)}</span>
                                <span className="w-16 text-right">{fmt(d.ytd)}</span>
                            </div>
                        </div>
                    ))}
                    {stub.lineItems.deductions.filter(d => !d.isPreTax).length === 0 && <div className="italic text-gray-400 text-[9px] py-1">None</div>}
                </div>
            </div>

            {/* FOOTER */}
            <div className="mt-auto pt-4">
                {/* Time Off Mock */}
                <div className="mb-4">
                    <div className="bg-gray-100 font-bold p-1 flex justify-between border-b border-gray-300">
                        <span>Time Off</span>
                        <div className="flex gap-4">
                            <span className="w-16 text-right">Used YTD</span>
                            <span className="w-16 text-right">Balance</span>
                        </div>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                        <span>Vacation</span>
                        <div className="flex gap-4">
                            <span className="w-16 text-right">16.00</span>
                            <span className="w-16 text-right">45.50</span>
                        </div>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                        <span>Sick / PTO</span>
                        <div className="flex gap-4">
                            <span className="w-16 text-right">8.00</span>
                            <span className="w-16 text-right">24.00</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-end pb-1 border-b-[1px] border-dotted border-gray-400 mb-1">
                    <div className="font-serif w-1/3">
                        <div className="font-bold italic">{data.companyName}</div>
                        <div className="italic text-[9px]">{data.companyAddress}</div>
                    </div>

                    <div className="text-[7px] w-2/3 text-right">
                        <div className="font-italic text-gray-600 mb-1 text-left inline-block w-full">Codes Legend</div>
                        <div className="grid grid-cols-4 gap-x-2 text-left">
                            <div>A= Prior Period Adj</div>
                            <div>N=Ded Susp/No Mk-up</div>
                            <div>D= Ded Suspend/Mk-up</div>
                            <div>R= Refund</div>
                            <div>M=Make-up Included</div>
                            <div>O= Add'l Current Pmts</div>
                            <div>X= Add'l Nontaxable Pmts</div>
                        </div>
                    </div>
                </div>
                
                {/* Spacer for Disclaimer */}
                <div className="h-4"></div>
            </div>
            
        </div>
        
        {/* DISCLAIMER */}
        <div className="absolute bottom-2 left-0 right-0 text-center text-[8px] text-gray-400 font-sans z-20">
             Generated for internal payroll records. Misuse or misrepresentation is prohibited.
        </div>

      </div>
    </div>
  );
};