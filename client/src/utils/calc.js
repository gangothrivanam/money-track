// Reusable calculation engine. Pure functions, no UI, no network.
export const CATEGORIES=['Food','Travel','Shopping','Bills','Entertainment','Health','Education','Personal Care','Other'];
export const inr=n=>'₹'+Math.round(+n||0).toLocaleString('en-IN');
export const ymd=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const parse=s=>{const[y,m,d]=String(s).slice(0,10).split('-').map(Number);return new Date(y,m-1,d)};
export const startOfDay=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
const dim=(y,m)=>new Date(y,m+1,0).getDate();
const at=(y,m,day)=>new Date(y,m,Math.min(day,dim(y,m)));
export const daysBetween=(a,b)=>Math.round((startOfDay(b)-startOfDay(a))/864e5);

// Budget period = last salary date (inclusive) .. next salary date (exclusive)
export function budgetPeriod(salaryDay,now=new Date()){
  const t=startOfDay(now),y=t.getFullYear(),m=t.getMonth();
  const thisMonth=at(y,m,salaryDay);
  const start=thisMonth<=t?thisMonth:at(y,m-1,salaryDay);
  const end=thisMonth>t?thisMonth:at(y,m+1,salaryDay);
  return{start,end};
}
const inRange=(d,s,e)=>d>=s&&d<e;

// All due dates of a commitment inside [start,end)
export function occurrences(c,start,end){
  const due=parse(c.due_date),out=[];
  if(c.recurrence==='one-time'){if(inRange(due,start,end))out.push(due);return out}
  if(c.recurrence==='weekly'){let d=new Date(due);if(d<start)d.setDate(d.getDate()+Math.ceil(daysBetween(d,start)/7)*7);
    for(;d<end;d.setDate(d.getDate()+7))out.push(new Date(d));return out}
  for(let y=start.getFullYear(),m=start.getMonth();new Date(y,m,1)<end;m++){
    if(c.recurrence==='yearly'&&((m%12+12)%12)!==due.getMonth())continue;
    const d=at(y,m,due.getDate());if(d>=due&&inRange(d,start,end))out.push(d)}
  return out;
}
export function upcoming(commitments,now=new Date(),horizonEnd){
  const t=startOfDay(now),end=horizonEnd||new Date(t.getFullYear(),t.getMonth()+2,1),rows=[];
  commitments.forEach(c=>occurrences(c,new Date(t.getFullYear(),t.getMonth(),t.getDate()-30),end).forEach(d=>{
    const paid=c.payment_status==='paid'&&c.paid_date&&parse(c.paid_date)>=new Date(d.getFullYear(),d.getMonth(),d.getDate()-15);
    const left=daysBetween(t,d);if(left>=-30)rows.push({...c,date:d,daysLeft:left,paid:!!paid&&c.recurrence==='one-time'?true:!!paid,overdue:left<0&&!paid})}));
  return rows.sort((a,b)=>a.date-b.date);
}

export function compute(data,now=new Date()){
  const s=data.settings||{},salaryDay=s.salary_day||1,today=startOfDay(now),{start,end}=budgetPeriod(salaryDay,now);
  const sum=a=>a.reduce((x,y)=>x+(+y.amount||0),0);
  const otherIncome=sum(data.incomes.filter(i=>i.income_type==='other'&&inRange(parse(i.income_date),start,end)));
  const income=(+s.monthly_salary||0)+otherIncome;
  // Commitments are projected for the whole period and deducted ONCE; marking paid never adds an expense.
  const commitmentRows=data.commitments.flatMap(c=>occurrences(c,start,end).map(d=>({c,d})));
  const commitments=commitmentRows.reduce((x,r)=>x+(+r.c.amount||0),0);
  const reserve=+s.emergency_reserve||0;
  const usable=income-commitments-reserve;
  const exp=data.expenses.filter(e=>inRange(parse(e.expense_date),start,end));
  const spent=sum(exp),t=ymd(today);
  const todaySpent=sum(data.expenses.filter(e=>e.expense_date===t));
  const monthKey=t.slice(0,7),monthSpent=sum(data.expenses.filter(e=>e.expense_date.startsWith(monthKey)));
  const available=usable-spent;
  const daysUntilSalary=Math.max(0,daysBetween(today,end));
  const daysLeft=Math.max(1,daysUntilSalary);
  const safeDaily=Math.max(0,available)/daysLeft;
  const dailyLimit=(+s.daily_spending_limit>0)?+s.daily_spending_limit:safeDaily;
  const byCategory={};exp.forEach(e=>byCategory[e.category]=(byCategory[e.category]||0)+(+e.amount));
  return{start,end,income,otherIncome,commitments,reserve,usable,spent,todaySpent,monthSpent,available,
    daysUntilSalary,safeDaily,dailyLimit,overBy:Math.max(0,todaySpent-dailyLimit),
    remainingDaily:Math.max(0,dailyLimit-todaySpent),byCategory,periodExpenses:exp,
    totalPaidCommitments:commitmentRows.filter(r=>r.c.payment_status==='paid').reduce((x,r)=>x+(+r.c.amount),0),
    status:available<0||todaySpent>dailyLimit?'over':usable>0&&available<usable*0.15?'low':dailyLimit>0&&todaySpent>=dailyLimit*0.8?'near':'ok'};
}
export const STATUS={ok:['On track','ok'],near:['Approaching daily limit','warn'],over:['Over budget','bad'],low:['Low available balance','warn']};

// Alert rules. Each returns a stable key so the same condition is not shown twice.
export function evaluateAlerts(calc,upc,prefs,amountJustAdded,now=new Date()){
  const d=ymd(now),a=[],T=prefs.largeThreshold||2000;
  if(amountJustAdded!=null){
    a.push({key:`saved-${Date.now()}`,type:'saved',level:'ok',title:'Expense saved',message:`💰 Expense saved successfully! Today's total spending is ${inr(calc.todaySpent)}. Your daily budget remaining is ${inr(calc.remainingDaily)}.`});
    if(amountJustAdded>=T)a.push({key:`large-${Date.now()}`,type:'large',level:'warn',title:'Large expense',message:`⚠️ Large Expense! You recorded a payment of ${inr(amountJustAdded)}.`});
  }
  if(calc.dailyLimit>0&&calc.todaySpent>calc.dailyLimit)
    a.push({key:`over-${d}-${Math.round(calc.todaySpent)}`,type:'over',level:'bad',title:'Daily limit exceeded',message:`🚨 Spending Alert! You spent ${inr(calc.todaySpent)} today, exceeding your ${inr(calc.dailyLimit)} daily limit by ${inr(calc.overBy)}.`});
  else if(calc.dailyLimit>0&&calc.todaySpent>=calc.dailyLimit*0.8)
    a.push({key:`near-${d}`,type:'near',level:'warn',title:'Approaching daily limit',message:'⚠️ Budget Alert! You have used 80% of your daily spending limit.'});
  if(calc.usable>0&&calc.available<calc.usable*0.15)a.push({key:`low-${d}`,type:'low',level:'warn',title:'Low balance',message:'💡 Your available balance is getting low. Review your upcoming payments and daily spending.'});
  upc.filter(u=>!u.paid&&u.daysLeft<=3).forEach(u=>a.push({key:`due-${u.id}-${ymd(u.date)}`,type:'due',level:u.overdue?'bad':'warn',title:u.overdue?'Payment overdue':'Payment due soon',message:`📅 Reminder: Your ${u.name} payment of ${inr(u.amount)} is ${u.overdue?'overdue':u.daysLeft===0?'due today':'due in '+u.daysLeft+' day(s)'}.`}));
  return a.filter(x=>prefs.enabled[x.type]!==false);
}
