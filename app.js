// --- DHANFLOW CORE LOGIC ---
const { useState, useEffect, useMemo } = React;
const { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, Tooltip } = Recharts;

function DhanFlowApp() {
    const [screen, setScreen] = useState('splash');
    const [activeTab, setActiveTab] = useState('Home');
    const [showAdd, setShowAdd] = useState(false);
    const [userName, setUserName] = useState(localStorage.getItem('df_name') || '');

    const [transactions, setTransactions] = useState(JSON.parse(localStorage.getItem('df_tx')) || []);
    const [accounts, setAccounts] = useState(JSON.parse(localStorage.getItem('df_acc')) || [
        { id: 1, name: 'Cash', balance: 0 },
        { id: 2, name: 'Bank', balance: 5000 }
    ]);

    useEffect(() => {
        if (screen === 'splash') setTimeout(() => setScreen(userName ? 'main' : 'login'), 2000);
        localStorage.setItem('df_tx', JSON.stringify(transactions));
        localStorage.setItem('df_acc', JSON.stringify(accounts));
    }, [transactions, accounts, userName, screen]);

    const totals = useMemo(() => {
        const income = transactions.filter(t => t.type === 'Income').reduce((a, b) => a + b.amount, 0);
        const expense = transactions.filter(t => t.type === 'Expense').reduce((a, b) => a + b.amount, 0);
        return { income, expense, balance: accounts.reduce((a, b) => a + b.balance, 0) };
    }, [transactions, accounts]);

    const addTx = (tx) => {
        setTransactions([tx, ...transactions]);
        setAccounts(accounts.map(acc => acc.name === tx.account ? 
            { ...acc, balance: tx.type === 'Income' ? acc.balance + tx.amount : acc.balance - tx.amount } : acc
        ));
    };

    if (screen === 'splash') return (
        <div className="h-screen bg-blue-600 flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl font-black">DhanFlow</h1>
            <div className="mt-4 animate-bounce">Loading...</div>
        </div>
    );

    if (screen === 'login') return (
        <div className="h-screen p-8 flex flex-col justify-center bg-white">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Enter Your Name</h2>
            <input id="nameInput" type="text" className="w-full p-4 bg-gray-100 rounded-2xl mb-4 border-2 border-transparent focus:border-blue-500 outline-none" placeholder="e.g. Rahul" />
            <button onClick={() => {
                const name = document.getElementById('nameInput').value;
                if(name) { setUserName(name); localStorage.setItem('df_name', name); setScreen('main'); }
            }} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg">Enter App</button>
        </div>
    );

    return (
        <div className="max-w-md mx-auto min-h-screen relative pb-20">
            {/* Header / Home Section */}
            {activeTab === 'Home' && (
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-4">Hello, {userName}!</h2>
                    <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl mb-6">
                        <p className="opacity-70 text-sm">Total Balance</p>
                        <h1 className="text-4xl font-bold">₹{totals.balance}</h1>
                        <div className="flex gap-4 mt-4">
                            <div className="bg-white/10 p-2 rounded-xl flex-1 text-center">
                                <p className="text-[10px] uppercase">Income</p>
                                <p className="font-bold">₹{totals.income}</p>
                            </div>
                            <div className="bg-white/10 p-2 rounded-xl flex-1 text-center">
                                <p className="text-[10px] uppercase">Expense</p>
                                <p className="font-bold text-red-200">₹{totals.expense}</p>
                            </div>
                        </div>
                    </div>
                    <h3 className="font-bold mb-4 text-gray-500">Recent Spending</h3>
                    <div className="space-y-3">
                        {transactions.slice(0, 5).map(t => (
                            <div key={t.id} className="bg-white p-4 rounded-2xl flex justify-between shadow-sm">
                                <div><p className="font-bold">{t.title}</p><p className="text-xs text-gray-400">{t.category}</p></div>
                                <p className={t.type === 'Income' ? 'text-blue-600 font-bold' : 'text-red-500 font-bold'}>₹{t.amount}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around items-center max-w-md mx-auto">
                {['Home', 'History', 'Settings'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={activeTab === t ? 'text-blue-600 font-bold' : 'text-gray-400'}>{t}</button>
                ))}
            </nav>

            {/* Quick Add Button */}
            <button onClick={() => setShowAdd(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full text-3xl shadow-xl">+</button>

            {showAdd && <AddForm accounts={accounts} onSave={addTx} onClose={() => setShowAdd(false)} />}
        </div>
    );
}

function AddForm({ accounts, onSave, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
            <div className="bg-white w-full rounded-t-[2rem] p-8 animate-slide-up">
                <h3 className="text-xl font-bold mb-4">Add Transaction</h3>
                <input id="t_title" type="text" className="w-full p-4 bg-gray-100 rounded-xl mb-3" placeholder="Title" />
                <input id="t_amt" type="number" className="w-full p-4 bg-gray-100 rounded-xl mb-3" placeholder="Amount" />
                <select id="t_type" className="w-full p-4 bg-gray-100 rounded-xl mb-3">
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                </select>
                <button onClick={() => {
                    const title = document.getElementById('t_title').value;
                    const amount = parseFloat(document.getElementById('t_amt').value);
                    const type = document.getElementById('t_type').value;
                    if(title && amount) {
                        onSave({ id: Date.now(), title, amount, type, category: 'Food', account: 'Cash' });
                        onClose();
                    }
                }} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">Save</button>
                <button onClick={onClose} className="w-full mt-2 text-gray-400">Cancel</button>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<DhanFlowApp />);
