import React, { useState } from 'react';
import { PaystubInput } from './components/PaystubInput';
import { PaystubPreview } from './components/PaystubPreview';
import { PaystubData, PayFrequency, PayType } from './types';
import { generatePDF } from './services/pdfGenerator';
import { X } from 'lucide-react';

const INITIAL_DATA: PaystubData = {
  employeeName: "Jessika Cabrera",
  employeeId: "134824",
  address: "1500 Marilla St",
  cityStateZip: "Dallas, TX 75201",
  ssnLast4: "9988",
  accountLast4: "1950",
  companyName: "City of Dallas",
  companyAddress: "1500 Marilla St Dallas, TX 75201",
  bankName: "Capital One",
  payType: PayType.Hourly,
  payFrequency: PayFrequency.BiWeekly,
  hourlyRate: 18.00,
  hoursPerWeek: 40,
  annualSalary: 65000,
  federalTaxRate: 12,
  stateTaxRate: 0,
  hireDate: "2023-01-15",
  checkDate: new Date().toISOString().split('T')[0],
  deductions: [
    { id: '1', name: 'Medical Insurance', amount: 45.00, isPreTax: true },
    { id: '2', name: '401k', amount: 80.00, isPreTax: true },
  ]
};

export default function App() {
  const [data, setData] = useState<PaystubData>(INITIAL_DATA);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [stubCount, setStubCount] = useState(1);

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const confirmPrint = () => {
    generatePDF(data, stubCount);
    setShowPrintModal(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden text-gray-800 font-sans">
      <header className="h-14 bg-gray-900 text-white flex items-center px-6 shadow-md z-10 shrink-0">
        <h1 className="text-lg font-bold tracking-wider">ProPayStub <span className="text-green-400">Generator</span></h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side: Editor */}
        <div className="w-full md:w-1/3 min-w-[350px] max-w-[500px] h-full overflow-hidden z-20">
          <PaystubInput data={data} onChange={setData} onPrint={handlePrint} />
        </div>

        {/* Right Side: Preview */}
        <div className="flex-1 h-full relative bg-gray-200 overflow-hidden">
            <div className="absolute inset-0 overflow-y-auto pb-20">
                <div className="min-h-full py-8">
                     <div className="text-center mb-4 text-gray-500 text-sm font-medium">Real-time PDF Preview</div>
                    <PaystubPreview data={data} />
                </div>
            </div>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Generate PDF</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                How many historical paystubs do you need? 
                <br />
                <span className="text-xs text-gray-400">We will generate consecutive stubs going backwards from your check date.</span>
              </p>
              
              <div className="flex items-center space-x-4 mb-6">
                <button 
                  onClick={() => setStubCount(Math.max(1, stubCount - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                   <span className="text-3xl font-bold text-blue-600">{stubCount}</span>
                   <span className="text-xs text-gray-500 block">Paystubs</span>
                </div>
                <button 
                  onClick={() => setStubCount(stubCount + 1)}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                >
                  +
                </button>
              </div>

              <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 mb-4">
                <strong>Note:</strong> YTD values will automatically adjust for each previous paystub.
              </div>
              
              <button 
                onClick={confirmPrint}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow transition-colors"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}