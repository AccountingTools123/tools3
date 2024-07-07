import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './App.css';

function AccountsPayable() {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ vendor: '', type: 'Meals', description: '', beforeTax: 0, tax: 0 });
  const [taxRate, setTaxRate] = useState(13); // Default tax rate percentage
  const [customTypes, setCustomTypes] = useState([]); // New state for custom expense types
  const [newCustomType, setNewCustomType] = useState(''); // New state for the input field
  const [expenseTypes, setExpenseTypes] = useState(['Meals 7525', 'Training 7090','Travel-Office 8000','Tech Vehicle 5420', 'Building R&M 8150', 'Vehicle R&M 8310', 'Misc Service 5060', 'Shop Supplies 5410', 'Office Supplies 7600', 'Dues 7210', 'Safety 7900']); // State for all expense types

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prevExpense => ({ ...prevExpense, [name]: value }));
  };

  const handleSaveData = () => {
    if (!expenses.length) return;
  
    const expensesForExport = expenses.map(expense => ({
      vendor: expense.vendor,
      description: expense.description,
      beforeTax: parseFloat(expense.beforeTax).toFixed(2),
      tax: typeof expense.tax === 'number' ? expense.tax.toFixed(2) : expense.tax,
      total: typeof expense.total === 'number' ? expense.total.toFixed(2) : expense.total,
      ...expenseTypes.reduce((acc, type) => ({
        ...acc,
        [type]: expense.type === type ? expense.beforeTax.toFixed(2) : ''
      }), {})
    }));
  
    const grandTotal = expensesForExport.reduce((acc, expense) => acc + parseFloat(expense.total), 0);
  
    const grandTotalRow = { 
      vendor: '', 
      description: 'Grand Total', 
      beforeTax: '', 
      tax: '', 
      total: grandTotal.toFixed(2), 
      ...expenseTypes.reduce((acc, type) => ({
        ...acc,
        [type]: calculateTypeTotal(type)
      }), {})
    };
    expensesForExport.push(grandTotalRow);
  
    const worksheet = XLSX.utils.json_to_sheet(expensesForExport, { header: ["vendor", "description", "beforeTax", "tax", "total", ...expenseTypes] });
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
    XLSX.writeFile(workbook, 'expense_report.xlsx');
  };
  
  const handleAddExpense = () => {
    const taxMultiplier = newExpense.type === 'Meals' ? 0.5 : 1;
    const taxAmount = parseFloat(((newExpense.beforeTax * taxRate / 100) * taxMultiplier).toFixed(2));
    const totalAmount = parseFloat(newExpense.beforeTax) + taxAmount;

    const expenseWithTotals = {
      ...newExpense,
      beforeTax: parseFloat(newExpense.beforeTax),
      tax: taxAmount,
      total: parseFloat(totalAmount.toFixed(2)),
    };
    setExpenses([...expenses, expenseWithTotals]);
    setNewExpense({ vendor: '', type: 'Meals', description: '', beforeTax: 0, tax: 0 });
  };

  // New function to add custom expense type
  const handleAddCustomType = () => {
    if (newCustomType && !customTypes.includes(newCustomType)) {
      setCustomTypes([...customTypes, newCustomType]);
      setExpenseTypes([...expenseTypes, newCustomType]);
      setNewCustomType('');
    }
  };

  const calculateTypeTotal = (type) => {
    return expenses
      .filter(expense => expense.type === type)
      .reduce((acc, expense) => acc + expense.beforeTax, 0)
      .toFixed(2);
  };

  const totalExpense = expenses.reduce((acc, expense) => acc + expense.total, 0).toFixed(2);
  const taxExpense = expenses.reduce((acc, expense) => acc + expense.tax, 0).toFixed(2);
  const beforeTaxExpense = expenses.reduce((acc, expense) => acc + expense.beforeTax, 0).toFixed(2);

  return (
    <div className="AccountsPayable">
      <h1>Expense Report Maker</h1>
      <div className="expense-form">
        <input
          type="text"
          name="vendor"
          placeholder="Vendor"
          value={newExpense.vendor}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newExpense.description}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="beforeTax"
          placeholder="Before Tax"
          value={newExpense.beforeTax}
          onChange={handleInputChange}
        />
        <select
          name="type"
          value={newExpense.type}
          onChange={handleInputChange}
        >
          {expenseTypes.map((type, index) => (
            <option key={index} value={type}>{type}</option>
          ))}
        </select>
        <button onClick={handleAddExpense}>Add Expense</button>
        <button onClick={handleSaveData}>Save Data</button>
      </div>
      {/* New section for adding custom expense types */}
      <div className="custom-type-form">
        <input
          type="text"
          value={newCustomType}
          onChange={(e) => setNewCustomType(e.target.value)}
          placeholder="New Expense Type"
        />
        <button className="add-custom-type" onClick={handleAddCustomType}>Add Custom Type</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Description</th>
              <th>Total</th>
              <th>Tax 21410</th>
              <th>Net Exp.</th>
              {expenseTypes.map((type, index) => (
                <th key={index}>{type}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => (
              <tr key={index}>
                <td>{expense.vendor}</td>
                <td>{expense.description}</td>
                <td>{expense.total.toFixed(2)}</td>
                <td>{expense.tax.toFixed(2)}</td>
                <td>{expense.beforeTax.toFixed(2)}</td>
                {expenseTypes.map((type, typeIndex) => (
                  <td key={typeIndex}>{expense.type === type ? expense.beforeTax.toFixed(2) : ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2">Grand Total:</td>
              <td>{totalExpense}</td>
              <td>{taxExpense}</td>
              <td>{beforeTaxExpense}</td>
              {expenseTypes.map((type, index) => (
                <td key={index}>{calculateTypeTotal(type)}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
      <div>
        <label>Preferred Tax Rate (%):</label>
        <input
          type="number"
          value={taxRate}
          onChange={(e) => setTaxRate(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}

export default AccountsPayable;
