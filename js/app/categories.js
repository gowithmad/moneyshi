/* MoneyShi · app/categories.js — built-in categories and the guess-a-category helper */
const B_OUT={'Food & dining':'Living','Groceries & provisions':'Living','Payments to individuals (small)':'Living','Travel (train, bus, stay)':'Living','Local transport & fuel':'Living','Bills & subscriptions':'Living','Shopping':'Living','Health':'Living','Personal care':'Living','Home & repairs':'Living','Entertainment':'Living','Cash withdrawal':'Living','Other':'Living','Credit card bills & EMI':'Commitments','SIP & investments':'Commitments','Taxes':'Commitments','Transfers to people':'People'};
const B_IN={'Salary':'Income','Interest':'Income','Other income':'Income','Refunds & reversals':'Refunds','Reimbursements':'Refunds','Received from people':'People'};
const GROUPS={out:['Living','Commitments','People'],in:['Income','Refunds','People']};
const GLABEL={Living:'Living costs',Commitments:'Commitments',People:'Family and friends',Income:'Income',Refunds:'Refunds'};
const INTERNAL='Between your accounts';
const DEFAULT_ACCS=()=>((CFG.defaults&&CFG.defaults.accounts)||[{k:'Cash',l:'Cash'},{k:'Bank',l:'Bank account'}]).map(a=>({k:a.k,l:a.l}));
/* ---------- guessing a category for a new entry ---------- */
function guessCat(name,dir,amt){
  const k=name.toUpperCase();const A=(...w)=>w.some(x=>k.includes(x));const R=re=>re.test(k);
  if(dir==='in'){
    if(A('AIRPORTS AUTHORITY')&&catMap('in')['Salary (AAI)'])return amt>=50000?'Salary (AAI)':'Other AAI credit';
    if(A('SALARY','PAYROLL','AIRPORTS AUTHORITY'))return 'Salary';
    if(A('INTEREST'))return 'Interest';
    if(A('REFUND','REVERSAL','CASHBACK'))return 'Refunds & reversals';
    return 'Received from people';
  }
  if(A('ATM CASH','CASH WITHDRAWAL')||R(/^ATM\b/))return 'Cash withdrawal';
  if(R(/\bCRED\b|CREDIT CARD|CARD BILL|\bEMI\b/))return 'Credit card bills & EMI';
  if(A('INDIAN CLEARING'))return 'Auto-debits (ICCL)';
  if(R(/\bSIP\b|MUTUAL FUND|UPSTOX|ZERODHA|GROWW/))return 'SIP & investments';
  if(A('CBDT','INCOME TAX'))return 'Taxes';
  if(A('APEPDCL','JIO','AIRTEL','NETFLIX','ADOBE','SUNDIRECT','RECHARGE','ELECTRICITY','BROADBAND'))return 'Bills & subscriptions';
  if(A('HOSPITAL','PHARMACY','HEALT','GENERIC','CLINIC','MEDICAL'))return 'Health';
  if(A('ECATERING'))return 'Food & dining';
  if(A('INDIAN RAILWAYS','STATE TRANSPORT','APSRTC','IRCTC','METRO','CLOAK ROOM'))return 'Travel (train, bus, stay)';
  if(R(/HOTEL|LODGE|\bINN\b|RESORT/)&&amt>=1000)return 'Travel (train, bus, stay)';
  if(A('UBER','RAPIDO','OLA ','PETROL','FUEL'))return 'Local transport & fuel';
  if(R(/SALON|BEAUTY/))return 'Personal care';
  if(A('LIVPURE','TECHNICIAN','PLUMBER','ELECTRICIAN'))return 'Home & repairs';
  if(A('PS4','BIRDS PARK','MOVIE','CINEMA'))return 'Entertainment';
  if(A('FLIPKART','AMAZON','MYNTRA','SILKS','FOOTWEAR','LULU','COSMETICS'))return 'Shopping';
  if(R(/SUPER ?MARKET|SUPERMARTS|HYPERBUDGET|VEGETABLE|MALIGAI|\bMILK\b|CHICKEN|BROILER|TRADERS|AGENC|GROCER|PROVISION/))return 'Groceries & provisions';
  if(R(/BIRYANI|BIRIYANI|HOTEL|RESTAURANT|\bMESS\b|CATERING|\bTEA\b|COFFEE|BAKERY|BAKKERY|SWEET|DINER|CANTEEN|CAFE|FOOD/))return 'Food & dining';
  return amt>=1000?'Transfers to people':'Payments to individuals (small)';
}
function suggest(name,dir,amt){
  const key=dir+'|'+name;const cm=catMap(dir);
  if(RULES[key]&&cm[RULES[key]])return RULES[key];
  const same=TX.filter(t=>!t.i&&t.dir===dir&&t.n.toLowerCase()===name.toLowerCase()).sort((a,b)=>b.d.localeCompare(a.d))[0];
  if(same&&cm[same.c])return same.c;
  const g=guessCat(name,dir,amt);return cm[g]?g:(dir==='out'?'Other':'Other income');
}
