import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculatedPaystub, PaystubData } from '../types';
import { calculatePaystub } from './calculations';

const fmt = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const generatePDF = (data: PaystubData, count: number) => {
  const doc = new jsPDF();
  
  const metaStub = calculatePaystub(data, 0);
  doc.setProperties({
    title: `Paystub - ${data.employeeName}`,
    subject: `Employee: ${data.employeeName} | Employer: ${data.companyName} | Date: ${metaStub.checkDate}`,
    author: 'ProPayStub Generator',
    creator: 'ProPayStub App'
  });

  for (let i = 0; i < count; i++) {
    if (i > 0) doc.addPage();
    const stub = calculatePaystub(data, i);
    renderPage(doc, data, stub);
  }
  
  const filename = `Earnings_Statement_${data.employeeName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
  doc.save(filename);
};

const drawSecurityBox = (doc: jsPDF, x: number, y: number, w: number, h: number) => {
  doc.saveGraphicsState();
  doc.setFillColor(248, 248, 248);
  doc.rect(x, y, w, h, 'F');
  
  doc.setFillColor(200, 200, 200);
  const spacing = 1.5;
  const dotSize = 0.2;
  
  for (let cy = y; cy < y + h; cy += spacing) {
    for (let cx = x; cx < x + w; cx += spacing) {
      const offsetX = (Math.floor((cy - y) / spacing) % 2 === 0) ? 0 : spacing / 2;
      if (cx + offsetX < x + w) {
         doc.circle(cx + offsetX, cy, dotSize, 'F');
      }
    }
  }
  doc.restoreGraphicsState();
};

const drawIMb = (doc: jsPDF, x: number, y: number) => {
  doc.saveGraphicsState();
  doc.setLineWidth(0.5); 
  doc.setDrawColor(0, 0, 0);
  const barWidth = 0.5;
  const gap = 0.5;
  const ascenderHeight = 3.0;
  const trackerHeight = 1.5;
  const fullHeight = 4.5;
  
  for (let i = 0; i < 65; i++) {
    const type = Math.floor(Math.random() * 4); 
    const xPos = x + (i * (barWidth + gap));
    const baseLineY = y + ascenderHeight; 

    switch (type) {
      case 0: doc.line(xPos, baseLineY - trackerHeight, xPos, baseLineY); break;
      case 1: doc.line(xPos, y, xPos, baseLineY); break;
      case 2: doc.line(xPos, baseLineY - trackerHeight, xPos, baseLineY + (fullHeight - ascenderHeight)); break;
      case 3: doc.line(xPos, y, xPos, baseLineY + (fullHeight - ascenderHeight)); break;
    }
  }
  doc.restoreGraphicsState();
};

const renderPage = (doc: jsPDF, data: PaystubData, stub: CalculatedPaystub) => {
  const margin = 15; 
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // -- WATERMARK (Background Layer) --
  doc.saveGraphicsState();
  doc.setTextColor(245, 245, 245); // Very light grey
  doc.setFont("helvetica", "bold");
  doc.setFontSize(60);
  // Centered in the middle of the page
  doc.text("PAY STATEMENT", pageWidth / 2, pageHeight / 2, { align: "center", angle: 45 });
  doc.restoreGraphicsState();

  // -- HEADER BLOCK --
  // Security Box (Top Left)
  const boxWidth = 90;
  const boxHeight = 12;
  drawSecurityBox(doc, margin, margin, boxWidth, boxHeight);
  
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  const codeY = margin + 4;
  
  doc.text("00457", margin + 2, codeY);
  doc.setFontSize(6);
  doc.text("CO.", margin + 2, codeY + 3);
  
  doc.setFontSize(8);
  doc.text("529659", margin + 20, codeY);
  doc.setFontSize(6);
  doc.text("FILE", margin + 20, codeY + 3);
  
  doc.setFontSize(8);
  doc.text("035300", margin + 35, codeY);
  doc.setFontSize(6);
  doc.text("DEPT.", margin + 35, codeY + 3);
  
  doc.setFontSize(6);
  doc.text("CLOCK", margin + 50, codeY + 3);

  doc.setFontSize(8);
  doc.text("000030112", margin + 65, codeY);
  doc.setFontSize(6);
  doc.text("VCHR. NO.", margin + 65, codeY + 3);

  // Check Info (Top Right)
  const infoX = pageWidth - margin;
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  
  const labels = ["Check Number", "Batch Number", "Pay Period", "Check Date"];
  const values = [
    stub.checkNumber.toString(), 
    "S00" + (Math.floor(Math.random()*900000)+100000), 
    stub.periodEnd, 
    stub.checkDate
  ];

  let infoY = margin + 2;
  labels.forEach((label, i) => {
    doc.text(label, infoX - 40, infoY);
    doc.text(values[i], infoX, infoY, { align: "right" });
    infoY += 4;
  });

  // Title
  const titleY = margin + 25;
  doc.setFont("times", "roman");
  doc.setFontSize(20);
  doc.text("Statement of Earnings and Deductions", margin, titleY);

  // ADP Logo Removed
  
  // Line under title
  doc.setLineWidth(0.5);
  doc.line(margin, titleY + 2, pageWidth - margin, titleY + 2);

  // -- EMPLOYEE INFO --
  const empY = titleY + 12;
  
  // Left: ID
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.text(`Employee Id: ${data.employeeId}`, margin, empY);

  // Marital Status Table
  autoTable(doc, {
    startY: empY + 5,
    margin: { left: margin },
    tableWidth: 100, 
    head: [['Marital Status/Exemptions', '', 'Amounts']],
    body: [
      ['Federal', 'S   03', '0'],
      ['Work State TX', 'N/A N/A', '0'],
      ['Res State TX', 'N/A N/A', '0']
    ],
    theme: 'plain',
    styles: { font: 'times', fontSize: 8, cellPadding: 1 },
    headStyles: { fontStyle: 'bold', halign: 'left' },
    columnStyles: { 2: { halign: 'center' } }
  });

  // Right: Name/Address
  const addrX = pageWidth / 2 + 10;
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text(data.employeeName.toUpperCase(), addrX, empY);
  doc.setFont("times", "normal");
  doc.text(data.address.toUpperCase(), addrX, empY + 5);
  doc.text(data.cityStateZip.toUpperCase(), addrX, empY + 10);
  
  // Barcode below address
  drawIMb(doc, addrX, empY + 16);

  // -- SUMMARY SECTION (Upper Middle) --
  const summaryY = empY + 40;
  
  // Background Bar
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, summaryY, pageWidth - (margin * 2), 8, 'F');
  
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  
  // Headers
  doc.text("This Period", margin + 2, summaryY + 5);
  if (data.payType === 'Hourly') {
      doc.setFont("times", "normal");
      doc.text(`Reg. Rate ${data.hourlyRate.toFixed(2)}`, pageWidth / 2 - 40, summaryY + 5);
  }
  
  doc.setFont("times", "bold");
  doc.text("Tax Information", pageWidth / 2 + 10, summaryY + 5);
  doc.text("Taxable", pageWidth - margin - 30, summaryY + 5, { align: "right" });
  doc.text("Y-T-D", pageWidth - margin - 2, summaryY + 5, { align: "right" });

  // Content
  let rowY = summaryY + 12;
  doc.setFont("times", "normal");
  
  // Left Side: Earnings Summary
  doc.text(data.payType === 'Hourly' ? "Regular Pay" : "Salary", margin + 2, rowY);
  doc.text(fmt(stub.current.grossPay - (stub.lineItems.earnings.find(e => e.name.includes("Overtime") || e.name.includes("Holiday"))?.current || 0)), pageWidth / 2 - 10, rowY, { align: "right" });
  
  if (data.holidayHours) {
      rowY += 4;
      doc.text("Holiday", margin + 2, rowY);
      doc.text(fmt(stub.lineItems.earnings.find(e => e.name === "Holiday Pay")?.current || 0), pageWidth / 2 - 10, rowY, { align: "right" });
  }

  rowY += 6;
  doc.text("Total Taxes Withheld", margin + 2, rowY);
  const totalTax = stub.current.federalTax + stub.current.socialSecurity + stub.current.medicare + stub.current.stateTax;
  doc.text(fmt(totalTax), pageWidth / 2 - 10, rowY, { align: "right" });

  rowY += 6;
  doc.setFont("times", "bold");
  doc.text("Net Amount", margin + 2, rowY);
  doc.text(fmt(stub.current.netPay), pageWidth / 2 - 10, rowY, { align: "right" });

  // Right Side: Taxable Wages Stats
  let rightRowY = summaryY + 12;
  doc.setFont("times", "normal");
  
  const taxStats = [
      { l: "Federal Wages", c: stub.current.federalTaxable, y: stub.ytd.federalTaxable },
      { l: "FICA Wages", c: stub.current.ficaTaxable, y: stub.ytd.ficaTaxable },
      { l: "Medicare Wages", c: stub.current.ficaTaxable, y: stub.ytd.ficaTaxable }
  ];

  taxStats.forEach(stat => {
      doc.text(stat.l, pageWidth / 2 + 10, rightRowY);
      doc.text(fmt(stat.c), pageWidth - margin - 30, rightRowY, { align: "right" });
      doc.text(fmt(stat.y), pageWidth - margin - 2, rightRowY, { align: "right" });
      rightRowY += 4;
  });

  // -- MIDDLE TOTALS BAR --
  const totalsY = Math.max(rowY, rightRowY) + 5;
  doc.setFillColor(230, 230, 230);
  doc.rect(margin, totalsY, pageWidth - (margin * 2), 10, 'F');
  
  // Vertical Separator Line
  doc.setDrawColor(200, 200, 200);
  doc.line(pageWidth / 2, totalsY, pageWidth / 2, totalsY + 10);

  doc.setTextColor(0,0,0);
  doc.setFont("times", "bold");
  const midY = totalsY + 7;
  
  // Left Total
  doc.text("CURRENT TOTAL WAGES / TAXES", margin + 2, midY);
  doc.text(fmt(stub.current.grossPay), pageWidth / 2 - 35, midY, { align: "right" });
  doc.text(fmt(totalTax), pageWidth / 2 - 5, midY, { align: "right" });

  // Right Total
  doc.text("NET PAY THIS PERIOD / Y-T-D", pageWidth / 2 + 5, midY);
  doc.text(fmt(stub.current.netPay), pageWidth - margin - 30, midY, { align: "right" });
  doc.text(fmt(stub.ytd.netPay), pageWidth - margin - 2, midY, { align: "right" });


  // -- DETAILED COLUMNS --
  const detailsY = totalsY + 15;
  const colWidth = (pageWidth - (margin * 2) - 10) / 2;
  
  // LEFT COLUMN: Earnings & Employer Benefits
  autoTable(doc, {
    startY: detailsY,
    margin: { left: margin },
    tableWidth: colWidth,
    head: [['Payments', 'Amount', 'Hours']],
    body: stub.lineItems.earnings.map(e => [e.name, fmt(e.current), fmt(e.hours)]),
    theme: 'plain',
    styles: { font: 'times', fontSize: 8, cellPadding: 1 },
    headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
  });

  let leftY = (doc as any).lastAutoTable.finalY + 5;
  
  autoTable(doc, {
    startY: leftY,
    margin: { left: margin },
    tableWidth: colWidth,
    head: [['Employer Paid Benefits (Info Only)', 'Current', 'YTD']],
    body: stub.lineItems.employerBenefits.map(b => [b.name, fmt(b.current), fmt(b.ytd)]),
    theme: 'plain',
    styles: { font: 'times', fontSize: 8, cellPadding: 1 },
    headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
  });


  // RIGHT COLUMN: Deductions (Grouped)
  const dedBody = [];
  
  // Taxes
  dedBody.push([{ content: 'TAXES', colSpan: 3, styles: { fontStyle: 'bold', textColor: [100, 100, 100] } }]);
  stub.lineItems.taxes.forEach(t => {
      dedBody.push([t.name, fmt(t.current), fmt(t.ytd)]);
  });

  // Pre-Tax
  const preTax = stub.lineItems.deductions.filter(d => d.isPreTax);
  if (preTax.length > 0) {
      dedBody.push([{ content: 'PRE-TAX', colSpan: 3, styles: { fontStyle: 'bold', textColor: [100, 100, 100] } }]);
      preTax.forEach(d => dedBody.push([d.name, fmt(d.current), fmt(d.ytd)]));
  }

  // Post-Tax
  const postTax = stub.lineItems.deductions.filter(d => !d.isPreTax);
  if (postTax.length > 0) {
      dedBody.push([{ content: 'POST-TAX', colSpan: 3, styles: { fontStyle: 'bold', textColor: [100, 100, 100] } }]);
      postTax.forEach(d => dedBody.push([d.name, fmt(d.current), fmt(d.ytd)]));
  }

  autoTable(doc, {
    startY: detailsY,
    margin: { left: margin + colWidth + 10 },
    tableWidth: colWidth,
    head: [['Deductions / Benefits', 'Amount', 'YTD']],
    body: dedBody,
    theme: 'plain',
    styles: { font: 'times', fontSize: 8, cellPadding: 1 },
    headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
  });

  // -- FOOTER CALCULATION --
  // We want the footer anchored to the very bottom.
  // Disclaimer is at pageHeight - 12
  const disclaimerY = pageHeight - 12;
  const dottedLineY = pageHeight - 18; // Just above disclaimer
  const footerContentY = dottedLineY - 2; // Text sits on this line

  // Time Off Table (Above footer)
  const contentEndY = Math.max((doc as any).lastAutoTable.finalY, leftY) + 5;
  const availableSpace = (dottedLineY - 20) - contentEndY;
  
  if (availableSpace > 20) {
      autoTable(doc, {
        startY: contentEndY,
        margin: { left: margin },
        tableWidth: pageWidth - (margin * 2),
        head: [['Time Off', 'Used YTD', 'Balance']],
        body: [
            ['Vacation', '16.00', '45.50'],
            ['Sick / PTO', '8.00', '24.00']
        ],
        theme: 'plain',
        styles: { font: 'times', fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
      });
  }

  // Employer Info (Left, bottom aligned above dotted line)
  doc.setFont("times", "bolditalic");
  doc.setFontSize(9);
  doc.setTextColor(0,0,0);
  doc.text(data.companyName, margin, footerContentY - 4);
  
  doc.setFont("times", "italic");
  doc.setFontSize(8);
  doc.text(data.companyAddress, margin, footerContentY);

  // Codes Legend (Right, bottom aligned above dotted line)
  // Rows of 4.
  const legendItems = [
    "A= Prior Period Adj", "N=Ded Susp/No Mk-up", "D= Ded Suspend/Mk-up", "R= Refund",
    "M=Make-up Included", "O= Add'l Current Pmts", "X= Add'l Nontaxable Pmts"
  ];

  doc.setFont("times", "italic");
  doc.setFontSize(7);
  
  // Calculate width required roughly. Each item ~32mm wide.
  const itemWidth = 32;
  const legendStartX = pageWidth - margin - (4 * itemWidth); 
  
  // Header above the grid
  doc.text("Codes Legend", legendStartX, footerContentY - 7);
  
  doc.setFont("times", "normal");
  
  // Row 1 (Top)
  let ly = footerContentY - 3.5;
  let lx = legendStartX;
  legendItems.slice(0, 4).forEach((item) => {
      doc.text(item, lx, ly);
      lx += itemWidth;
  });

  // Row 2 (Bottom)
  ly = footerContentY;
  lx = legendStartX;
  legendItems.slice(4).forEach((item) => {
      doc.text(item, lx, ly);
      lx += itemWidth;
  });

  // Dotted Line
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(margin, dottedLineY, pageWidth - margin, dottedLineY);
  doc.setLineDashPattern([], 0); // Reset

  // Disclaimer (Bottom)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  doc.text("Generated for internal payroll records. Misuse or misrepresentation is prohibited.", pageWidth / 2, disclaimerY, { align: "center" });
};