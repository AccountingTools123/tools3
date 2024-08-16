import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Container, Box, Typography, Button, Input, Table, TableHead, TableBody, TableRow, TableCell, TextField } from '@mui/material';
import './App.css';

function AccountsReceivable() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [filterConfig, setFilterConfig] = useState({});
  const [sortConfig, setSortConfig] = useState([]);
  const [comments, setComments] = useState({});

  const processFile = (file, isCommentFile = false) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const [newHeaders, ...newRows] = excelData;

        const commentsHeaderIndex = newHeaders.indexOf('Comments');
        if (commentsHeaderIndex === -1) {
          newHeaders.push('Comments');
        }

        if (isCommentFile) {
          const newComments = {};
          newRows.forEach(row => {
            const accountNumber = row[newHeaders.indexOf('Account Number')];
            const comment = row[newHeaders.indexOf('Comments')];
            if (accountNumber && comment) {
              newComments[accountNumber] = comment;
            }
          });
          resolve(newComments);
        } else {
          setHeaders(newHeaders);
          const newData = newRows.map(row => {
            const rowData = {};
            newHeaders.forEach((header, index) => {
              rowData[header] = row[index] || '';
            });
            rowData['Comments'] = rowData['Comments'] || '';
            return rowData;
          });
          resolve(newData);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (event, isCommentFile = false) => {
    const file = event.target.files[0];
    if (!file) return;

    if (isCommentFile) {
      const newComments = await processFile(file, true);
      console.log('New Comments:', newComments); // Debug statement
      setComments(newComments);
    } else {
      const newData = await processFile(file);
      console.log('New Data:', newData); // Debug statement
      setData(newData);
    }
  };

  const updateComments = () => {
    if (Object.keys(comments).length > 0 && data.length > 0) {
      const updatedData = data.map(row => {
        const accountNumber = row['Account Number'];
        if (comments[accountNumber]) {
          return { ...row, Comments: comments[accountNumber] };
        }
        return row;
      });
      console.log('Updated Data with Comments:', updatedData); // Debug statement
      setData(updatedData);
    }
  };

  const handleCommentChange = (rowIndex, newComment) => {
    const updatedData = [...data];
    updatedData[rowIndex].Comments = newComment;
    setData(updatedData);
  };

  const handleFilterChange = (header, value) => {
    setFilterConfig(prevConfig => ({
      ...prevConfig,
      [header]: value
    }));
  };

  const handleSort = (header) => {
    let newSortConfig = [...sortConfig];
    const existingIndex = newSortConfig.findIndex(config => config.key === header);
    if (existingIndex !== -1) {
      newSortConfig[existingIndex].direction = newSortConfig[existingIndex].direction === 'asc' ? 'desc' : 'asc';
    } else {
      newSortConfig.push({ key: header, direction: 'asc' });
    }

    setSortConfig(newSortConfig);
  };

  const applySort = (data, sortConfig) => {
    if (sortConfig.length === 0) return data;
    return [...data].sort((a, b) => {
      for (const { key, direction } of sortConfig) {
        const dirMultiplier = direction === 'asc' ? 1 : -1;
        const aValue = a[key];
        const bValue = b[key];

        if (aValue < bValue) return -1 * dirMultiplier;
        if (aValue > bValue) return 1 * dirMultiplier;
      }
      return 0;
    });
  };

  const applySortAndFilter = (data, sortConfig, filterConfig) => {
    const filteredData = data.filter(row => {
      return Object.entries(filterConfig).every(([key, value]) => {
        if (!value) return true;
        return row[key].toString().toLowerCase().includes(value.toLowerCase());
      });
    });

    return applySort(filteredData, sortConfig);
  };

  const handleSaveData = () => {
    if (!data.length) return;
    const workbook = XLSX.utils.book_new(); 
    const worksheet = XLSX.utils.json_to_sheet(applySortAndFilter(data, sortConfig, filterConfig)); 
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1'); 
    XLSX.writeFile(workbook, 'updated_data.xlsx'); 
  };

  useEffect(() => {
    if (data.length > 0) {
      updateComments();
    }
  }, [comments]);

  return (
    <Container className="App">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Merging Tool: Accounts Receivable Aging Report
        </Typography>
        <Box className="button-container" display="flex" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h6">Upload today's updated aging report here↓</Typography>
            <Input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => handleFileUpload(e)}
            />
          </Box>
          <Box>
            <Typography variant="h6">Upload yesterday's aging report with comments here↓</Typography>
            <Input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => handleFileUpload(e, true)}
            />
          </Box>
        </Box>
        <Button variant="contained" color="primary" onClick={handleSaveData}>
          Save Data
        </Button>
        <Box className="table-container" mt={4}>
          <Table>
            <TableHead>
              <TableRow>
                {headers.map((header, index) => (
                  <TableCell key={index} onClick={() => handleSort(header)}>
                    {header}
                    {sortConfig.find(config => config.key === header) ? (sortConfig.find(config => config.key === header).direction === 'asc' ? ' ↑' : ' ↓') : ''}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                {headers.map((header, index) => (
                  <TableCell key={index}>
                    <TextField
                      placeholder={`Filter ${header}`}
                      onChange={(e) => handleFilterChange(header, e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {applySortAndFilter(data, sortConfig, filterConfig).map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <TableCell key={colIndex}>
                      {header === 'Comments' ? (
                        <TextField
                          value={row[header]}
                          onChange={(e) => handleCommentChange(rowIndex, e.target.value)}
                          fullWidth
                        />
                      ) : (
                        row[header]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Container>
  );
}

export default AccountsReceivable;
