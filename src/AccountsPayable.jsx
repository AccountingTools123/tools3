import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './App.css';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Input, Select, MenuItem, Button, TextField } from '@mui/material';

function AccountsPayable() {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ vendor: '', type: 'Meals', description: '', beforeTax: 0, tax: 0 });
  const [taxRate, setTaxRate] = useState(13); // Default tax rate percentage
  const [customTypes, setCustomTypes] = useState([]); // New state for custom expense types
  const [newCustomType, setNewCustomType] = useState(''); // New state for the input field
  const [expenseTypes, setExpenseTypes] = useState(['Meals 7525', 'Training 7090', 'Travel-Office 8000', 'Tech Vehicle 5420', 'Building R&M 8150', 'Vehicle R&M 8310', 'Misc Service 5060', 'Shop Supplies 5410', 'Office Supplies 7600', 'Dues 7210', 'Safety 7900']); // State for all expense types

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
    const baseTaxAmount = newExpense.beforeTax * taxRate / 100;
    const taxMultiplier = newExpense.type === 'Meals' ? 0.5 : 1; // Halve the tax if type is 'Meals'
    const taxAmount = parseFloat((baseTaxAmount * taxMultiplier).toFixed(2));
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
        <TextField
          label="Vendor"
          name="vendor"
          value={newExpense.vendor}
          onChange={handleInputChange}
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="Description"
          name="description"
          value={newExpense.description}
          onChange={handleInputChange}
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="Before Tax"
          name="beforeTax"
          type="number"
          value={newExpense.beforeTax}
          onChange={handleInputChange}
          variant="outlined"
          margin="normal"
        />
        <Select
          name="type"
          value={newExpense.type}
          onChange={handleInputChange}
          variant="outlined"
          margin="normal"
        >
          {expenseTypes.map((type, index) => (
            <MenuItem key={index} value={type}>{type}</MenuItem>
          ))}
        </Select>
        <Button variant="contained" color="primary" onClick={handleAddExpense}>Add Expense</Button>
        <Button variant="contained" color="secondary" onClick={handleSaveData}>Save Data</Button>
      </div>
      <div className="custom-type-form">
        <TextField
          label="New Expense Type"
          value={newCustomType}
          onChange={(e) => setNewCustomType(e.target.value)}
          variant="outlined"
          margin="normal"
        />
        <Button className="add-custom-type" variant="contained" onClick={handleAddCustomType}>Add Custom Type</Button>
      </div>
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vendor</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Tax 21410</TableCell>
              <TableCell>Net Exp.</TableCell>
              {expenseTypes.map((type, index) => (
                <TableCell key={index}>{type}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense, index) => (
              <TableRow key={index}>
                <TableCell>{expense.vendor}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{expense.total.toFixed(2)}</TableCell>
                <TableCell>{expense.tax.toFixed(2)}</TableCell>
                <TableCell>{expense.beforeTax.toFixed(2)}</TableCell>
                {expenseTypes.map((type, typeIndex) => (
                  <TableCell key={typeIndex}>{expense.type === type ? expense.beforeTax.toFixed(2) : ''}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableRow>
            <TableCell colSpan="2">Grand Total:</TableCell>
            <TableCell>{totalExpense}</TableCell>
            <TableCell>{taxExpense}</TableCell>
            <TableCell>{beforeTaxExpense}</TableCell>
            {expenseTypes.map((type, index) => (
              <TableCell key={index}>{calculateTypeTotal(type)}</TableCell>
            ))}
          </TableRow>
        </Table>
      </TableContainer>
      <div>
        <label>Preferred Tax Rate (%):</label>
        <Input
          type="number"
          value={taxRate}
          onChange={(e) => setTaxRate(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );

}

export default AccountsPayable;
