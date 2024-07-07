import React, { useState } from 'react';
import AccountsReceivable from './AccountsReceivable';
import AccountsPayable from './AccountsPayable';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('accountsReceivable');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Accounting Tools 123</h1>
        <div className="tabs">
          <button
            className={activeTab === 'accountsReceivable' ? 'active' : ''}
            onClick={() => setActiveTab('accountsReceivable')}
          >
            Accounts Receivable
          </button>
          <button
            className={activeTab === 'accountsPayable' ? 'active' : ''}
            onClick={() => setActiveTab('accountsPayable')}
          >
            Accounts Payable
          </button>
        </div>
        {activeTab === 'accountsReceivable' && <AccountsReceivable />}
        {activeTab === 'accountsPayable' && <AccountsPayable />}
      </header>
    </div>
  );
}

export default App;
