import React from 'react';
import { PayFrequency, PayType, PaystubData, Deduction } from '../types';
import { Trash2, Plus, Info } from 'lucide-react';

interface Props {
  data: PaystubData;
  onChange: (data: PaystubData) => void;
  onPrint: () => void;
}

export const PaystubInput: React.FC<Props> = ({ data, onChange, onPrint }) => {
  const handleChange = (field: keyof PaystubData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addDeduction = (name: string = 'New Deduction', amount: number = 0, isPreTax: boolean = false) => {
    const newDed: Deduction = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      amount,
      isPreTax
    };
    onChange({ ...data, deductions: [...data.deductions, newDed] });
  };

  const updateDeduction = (id: string, field: keyof Deduction, value: any) => {
    const newDeds = data.deductions.map(d => d.id === id ? { ...d, [field]: value } : d);
    onChange({ ...data, deductions: newDeds });
  };

  const removeDeduction = (id: string) => {
    onChange({ ...data, deductions: data.deductions.filter(d => d.id !== id) });
  };

  return (
    <div className="bg-white p-6 shadow-xl rounded-lg h-full overflow-y-auto border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">1. Enter Details</h2>
      </div>

      <div className="space-y-6">
        {/* Employee Info */}
        <section>
          <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-3">Employee Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="p-2 border rounded w-full text-sm"
              placeholder="Full Name"
              value={data.employeeName}
              onChange={e => handleChange('employeeName', e.target.value)}
            />
            <input
              className="p-2 border rounded w-full text-sm"
              placeholder="Employee ID"
              value={data.employeeId}
              onChange={e => handleChange('employeeId', e.target.value)}
            />
            <input
              className="p-2 border rounded w-full text-sm"
              placeholder="Address"
              value={data.address}
              onChange={e => handleChange('address', e.target.value)}
            />
            <input
              className="p-2 border rounded w-full text-sm"
              placeholder="City, State Zip"
              value={data.cityStateZip}
              onChange={e => handleChange('cityStateZip', e.target.value)}
            />
             <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">SSN (Last 4):</span>
                <input
                className="p-2 border rounded w-full text-sm"
                placeholder="0000"
                maxLength={4}
                value={data.ssnLast4}
                onChange={e => handleChange('ssnLast4', e.target.value)}
                />
             </div>
             <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Acct (Last 4):</span>
                <input
                className="p-2 border rounded w-full text-sm"
                placeholder="1234"
                maxLength={4}
                value={data.accountLast4}
                onChange={e => handleChange('accountLast4', e.target.value)}
                />
             </div>
          </div>
        </section>

        {/* Company Info */}
        <section>
          <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-3">Company Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <input
              className="p-2 border rounded w-full text-sm"
              placeholder="Company Name"
              value={data.companyName}
              onChange={e => handleChange('companyName', e.target.value)}
            />
            <input
              className="p-2 border rounded w-full text-sm"
              placeholder="Company Address"
              value={data.companyAddress}
              onChange={e => handleChange('companyAddress', e.target.value)}
            />
             <input
              className="p-2 border rounded w-full text-sm"
              placeholder="Bank Name"
              value={data.bankName}
              onChange={e => handleChange('bankName', e.target.value)}
            />
          </div>
        </section>

        {/* Pay Details */}
        <section>
          <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-3">Pay Calculation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="col-span-1 md:col-span-2 flex space-x-4 p-2 bg-gray-50 rounded">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="payType" 
                        checked={data.payType === PayType.Hourly} 
                        onChange={() => handleChange('payType', PayType.Hourly)}
                    />
                    <span className="text-sm">Hourly</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="payType" 
                        checked={data.payType === PayType.Salary} 
                        onChange={() => handleChange('payType', PayType.Salary)}
                    />
                    <span className="text-sm">Salary</span>
                </label>
             </div>

             {data.payType === PayType.Hourly ? (
                <>
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500">Hourly Rate</label>
                        <input
                            type="number"
                            className="p-2 border rounded w-full text-sm"
                            value={data.hourlyRate}
                            onChange={e => handleChange('hourlyRate', parseFloat(e.target.value) || 0)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500">Hours / Week</label>
                        <input
                            type="number"
                            className="p-2 border rounded w-full text-sm"
                            value={data.hoursPerWeek}
                            onChange={e => handleChange('hoursPerWeek', parseFloat(e.target.value) || 0)}
                        />
                    </div>
                    <div className="flex flex-col col-span-2">
                         <label className="text-xs text-gray-500">Holiday Hours (Optional)</label>
                         <input
                             type="number"
                             className="p-2 border rounded w-full text-sm"
                             placeholder="e.g. 8"
                             value={data.holidayHours || ''}
                             onChange={e => handleChange('holidayHours', parseFloat(e.target.value) || 0)}
                         />
                    </div>
                </>
             ) : (
                <div className="flex flex-col col-span-1 md:col-span-2">
                    <label className="text-xs text-gray-500">Annual Salary</label>
                    <input
                        type="number"
                        className="p-2 border rounded w-full text-sm"
                        value={data.annualSalary}
                        onChange={e => handleChange('annualSalary', parseFloat(e.target.value) || 0)}
                    />
                </div>
             )}

             <div className="flex flex-col">
                <label className="text-xs text-gray-500">Pay Frequency</label>
                <select
                    className="p-2 border rounded w-full text-sm"
                    value={data.payFrequency}
                    onChange={e => handleChange('payFrequency', e.target.value)}
                >
                    {Object.values(PayFrequency).map(f => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
             </div>

             <div className="flex flex-col">
                <label className="text-xs text-gray-500">Federal Tax Rate (%)</label>
                <input
                    type="number"
                    className="p-2 border rounded w-full text-sm"
                    value={data.federalTaxRate}
                    onChange={e => handleChange('federalTaxRate', parseFloat(e.target.value) || 0)}
                />
             </div>
          </div>
        </section>

        {/* Dates */}
        <section>
          <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-3">Dates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
                <label className="text-xs text-gray-500">Hire Date</label>
                <input
                    type="date"
                    className="p-2 border rounded w-full text-sm"
                    value={data.hireDate}
                    onChange={e => handleChange('hireDate', e.target.value)}
                />
            </div>
            <div className="flex flex-col">
                <label className="text-xs text-gray-500">Most Recent Pay Date</label>
                <input
                    type="date"
                    className="p-2 border rounded w-full text-sm"
                    value={data.checkDate}
                    onChange={e => handleChange('checkDate', e.target.value)}
                />
            </div>
          </div>
        </section>

        {/* Deductions */}
        <section>
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold">Deductions</h3>
             <button onClick={() => addDeduction()} className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                <Plus size={16} className="mr-1" /> Add Custom
             </button>
          </div>
          
          {/* Quick Add Buttons */}
          <div className="mb-4">
              <span className="text-[10px] uppercase text-gray-400 font-bold">Quick Add:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                  <button onClick={() => addDeduction('Medical', 50, true)} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200 hover:bg-green-100">+ Medical (Pre)</button>
                  <button onClick={() => addDeduction('Dental', 15, true)} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200 hover:bg-green-100">+ Dental (Pre)</button>
                  <button onClick={() => addDeduction('Vision', 8, true)} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200 hover:bg-green-100">+ Vision (Pre)</button>
                  <button onClick={() => addDeduction('401k', 100, true)} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200 hover:bg-green-100">+ 401k (Pre)</button>
                  <button onClick={() => addDeduction('Critical Illness', 12, false)} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded border border-orange-200 hover:bg-orange-100">+ Critical Illness</button>
                  <button onClick={() => addDeduction('Support', 150, false)} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded border border-orange-200 hover:bg-orange-100">+ Support</button>
              </div>
          </div>

          <div className="space-y-2">
            {data.deductions.map(ded => (
                <div key={ded.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded">
                    <input 
                        className="col-span-5 p-1 border rounded text-xs" 
                        value={ded.name} 
                        onChange={e => updateDeduction(ded.id, 'name', e.target.value)} 
                        placeholder="Name (e.g. 401k)"
                    />
                    <div className="col-span-3 relative">
                        <span className="absolute left-1 top-1 text-gray-400 text-xs">$</span>
                        <input 
                            className="w-full pl-3 p-1 border rounded text-xs" 
                            type="number"
                            value={ded.amount} 
                            onChange={e => updateDeduction(ded.id, 'amount', parseFloat(e.target.value)||0)} 
                        />
                    </div>
                    <div className="col-span-3 flex items-center">
                        <input 
                            type="checkbox" 
                            checked={ded.isPreTax}
                            onChange={e => updateDeduction(ded.id, 'isPreTax', e.target.checked)}
                            className="mr-1 h-3 w-3"
                        />
                        <span className="text-[10px] text-gray-600">Pre-Tax</span>
                    </div>
                    <button onClick={() => removeDeduction(ded.id)} className="col-span-1 text-red-500 hover:text-red-700">
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
            {data.deductions.length === 0 && <p className="text-xs text-gray-400 italic">No deductions added.</p>}
          </div>
        </section>

        <div className="pt-6 mt-6 border-t border-gray-100">
            <button 
                onClick={onPrint}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-lg flex justify-center items-center transition-all"
            >
                Print / Save PDF
            </button>
        </div>
      </div>
    </div>
  );
};