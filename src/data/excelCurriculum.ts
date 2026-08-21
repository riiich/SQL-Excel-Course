import type { ExcelFormulaExercise, ExcelLesson, ExcelSheet } from '../types'

const exercise = (value: ExcelFormulaExercise) => value

const salesSheet: ExcelSheet = {
  name: 'Sales', tableName: 'Sales', description: 'One row per completed or pending order. Revenue is already calculated for the source system.',
  columns: [
    { key: 'A', label: 'Order ID', meaning: 'Unique order identifier' },
    { key: 'B', label: 'Region', meaning: 'Sales region' },
    { key: 'C', label: 'Rep', meaning: 'Sales representative' },
    { key: 'D', label: 'Units', meaning: 'Units purchased' },
    { key: 'E', label: 'Revenue', meaning: 'Order revenue in dollars' },
    { key: 'F', label: 'Status', meaning: 'Paid or Pending' },
  ],
  rows: [[1001,'West','Ava',4,480,'Paid'],[1002,'East','Ben',2,180,'Pending'],[1003,'West','Ava',7,840,'Paid'],[1004,'South','Cora',3,390,'Paid'],[1005,'East','Dax',5,625,'Paid']],
}

const productSheet: ExcelSheet = {
  name: 'Products', tableName: 'Products', description: 'Product catalogue maintained by the merchandising team.',
  columns: [{ key:'A', label:'SKU', meaning:'Stable product key' },{ key:'B', label:'Product', meaning:'Display name' },{ key:'C', label:'Unit Price', meaning:'Current price' },{ key:'D', label:'Category', meaning:'Merchandising group' }],
  rows: [['P-100','Notebook',12,'Office'],['P-200','Desk lamp',45,'Home'],['P-300','Keyboard',80,'Electronics'],['P-400','Mug',16,'Home']],
}

const supportSheet: ExcelSheet = {
  name: 'Tickets', tableName: 'Tickets', description: 'Support tickets used by the operations manager.',
  columns: [{ key:'A',label:'Ticket ID',meaning:'Unique ticket number'},{key:'B',label:'Team',meaning:'Owning support team'},{key:'C',label:'Status',meaning:'Open, Resolved, or Escalated'},{key:'D',label:'Hours Open',meaning:'Elapsed open time'}],
  rows: [[501,'Atlas','Open',18],[502,'Atlas','Resolved',4],[503,'Beacon','Open',31],[504,'Beacon','Escalated',42],[505,'Atlas','Open',6]],
}

const staffSheet: ExcelSheet = {
  name: 'Staff', tableName: 'Staff', description: 'Raw employee names arriving from a third-party scheduling export.',
  columns: [{ key:'A',label:'Raw name',meaning:'Unclean incoming display name'},{key:'B',label:'First',meaning:'First-name component'},{key:'C',label:'Middle',meaning:'Optional middle component'},{key:'D',label:'Last',meaning:'Last-name component'}],
  rows: [['  maya  chen  ','Maya','L.','Chen'],['JORDAN RUIZ','Jordan','','Ruiz'],['  samir khan','Samir','','Khan']],
}

const projectSheet: ExcelSheet = {
  name: 'Projects', tableName: 'Projects', description: 'Project schedule tracking with Excel date serials displayed as dates.',
  columns: [{key:'A',label:'Start date',meaning:'Planned project start'},{key:'B',label:'End date',meaning:'Planned project end'},{key:'C',label:'Project',meaning:'Project name'},{key:'D',label:'Owner',meaning:'Responsible lead'}],
  rows: [['2026-07-06','2026-07-24','Portal refresh','Ava'],['2026-07-15','2026-08-07','Inventory audit','Ben'],['2026-08-03','2026-08-21','Support migration','Cora']],
}

const targetsSheet: ExcelSheet = {
  name: 'Targets', tableName: 'Targets', description: 'Regional monthly revenue targets for dashboard KPIs.',
  columns: [{key:'A',label:'Region',meaning:'Reporting region'},{key:'B',label:'Monthly target',meaning:'Revenue target in dollars'}],
  rows: [['West',1200],['East',900],['South',700]],
}

export const excelLessons: ExcelLesson[] = [
  {
    id:'excel-foundations',number:'01',title:'Cells, references & workbook logic',eyebrow:'EXCEL FOUNDATIONS',duration:18,difficulty:'Foundation',
    summary:'Learn how Excel reads a formula, how cells become inputs, and why relative and absolute references behave differently when copied.',
    objectives:['Read a worksheet as a grid of inputs and outputs','Write relative, absolute, and mixed references intentionally','Use the formula bar to verify what a cell is actually doing'],
    concepts:['Cell references','Relative vs. absolute','Formula bar'],
    mechanics:[
      {part:'A1',title:'A cell address is a coordinate',explanation:'A1 means column A and row 1. A formula such as =D2*E2 asks Excel to retrieve the two values at those coordinates and multiply them.',why:'References make a workbook responsive: change an input once and every dependent result updates.',example:'=D2*E2'},
      {part:'$A$1',title:'Dollar signs lock movement',explanation:'When you copy a formula, relative references move with it. $A$1 locks both the column and row; A$1 locks the row only; $A1 locks the column only.',why:'A fixed tax rate, lookup table, or report assumption should not drift while formulas are filled down.',example:'=E2/$E$6'},
      {part:'=',title:'Every formula begins with intent',explanation:'Typing = tells Excel to evaluate the expression rather than store it as text. Click a cell while editing to insert a reference instead of typing addresses from memory.',why:'The formula bar exposes the calculation, while the grid shows the result.',example:'=SUM(E2:E6)'},
    ],
    formulaSpotlights:[
      {formula:'=D2*E2',powerful:'Turns two atomic inputs into a live business value.',whenToUse:'Whenever quantity and price, hours and rate, or units and cost must stay connected.',practicalExample:'Order 1001 has 4 units in D2 and $480 in E2.',result:'The formula returns $1,920.'},
      {formula:'=SUM(E2:E6)',powerful:'Summarizes a whole changing population in one auditable expression.',whenToUse:'Use for totals such as revenue, budget, hours, or inventory.',practicalExample:'The Sales Revenue column spans E2:E6.',result:'The formula returns $2,515.'},
      {formula:'=E2/$E$7',powerful:'Keeps one benchmark fixed while each row contributes its own value.',whenToUse:'Use for share-of-total, tax rates, exchange rates, and fixed assumptions.',practicalExample:'E2 is $480 and E7 holds the $2,515 grand total.',result:'The formula returns 19.09% when formatted as a percentage.'},
    ],
    realWorldExample:{context:'Revenue operations',title:'Calculate order value',purpose:'A sales coordinator multiplies units by a fixed unit price and fills the calculation down a new-order sheet.',formula:'=D2*$H$1'},
    proTip:'Before filling a formula down, ask which inputs should move one row and which assumptions must remain fixed.',workbook:[salesSheet],
    exercises:[
      exercise({id:'excel-foundations-1',title:'Calculate the first order',task:'In G2, calculate revenue from the units in D2 and the unit price in E2.',targetCell:'G2',starterFormula:'=',solutionFormula:'=D2*E2',expectedValue:1920,resultNote:'4 units × $480 = $1,920.',hints:['Start the formula with = so Excel evaluates it.','Use the two numeric input cells on row 2.','Multiply D2 by E2.'],explanation:['D2 and E2 are relative references, so they will become D3 and E3 if copied down one row.','The * operator performs multiplication.','Keeping inputs separate from calculations makes auditing simple.']}),
      exercise({id:'excel-foundations-2',title:'Total a column',task:'In E7, total the Revenue values from E2 through E6.',targetCell:'E7',starterFormula:'=',solutionFormula:'=SUM(E2:E6)',expectedValue:2515,resultNote:'The five revenue cells add to $2,515.',hints:['A colon represents a continuous range.','SUM accepts a range of cells.','Use E2:E6 as the range.'],explanation:['SUM(E2:E6) adds each numeric cell in the inclusive range.','Using a range is easier to audit than adding five addresses one by one.','If a new order is added, extend the range or convert the data to an Excel Table.']}),
      exercise({id:'excel-foundations-3',title:'Lock the total for a ratio',task:'In G2, calculate E2 as a share of the grand total in E7. The total must stay fixed when copied down.',targetCell:'G2',starterFormula:'=',solutionFormula:'=E2/$E$7',expectedValue:0.1909,resultNote:'Order 1001 contributes about 19.09% of total revenue.',hints:['The numerator should change with each order row.','The grand total should not move when you fill the formula down.','Lock both E and 7 in the denominator.'],explanation:['E2 remains relative so the numerator follows each order.','$E$7 is absolute, so every copied formula uses the same grand total.','This is the standard pattern for share-of-total calculations.']}),
    ],
  },
  {
    id:'excel-math',number:'02',title:'Math, totals & rounding',eyebrow:'CALCULATION BASICS',duration:19,difficulty:'Foundation',
    summary:'Build dependable numeric formulas using operators, aggregate functions, and deliberate rounding for money.',
    objectives:['Choose SUM, AVERAGE, MIN, and MAX for the right summary','Control calculation order with parentheses','Round displayed financial outputs without hiding source precision'],concepts:['SUM','AVERAGE','ROUND'],
    mechanics:[
      {part:'SUM',title:'Aggregate rather than chain additions',explanation:'SUM(E2:E6) expresses a total over a visible range. It is easier to review and expand than =E2+E3+E4+E5+E6.',why:'A single aggregate makes the intended population explicit.',example:'=SUM(E2:E6)'},
      {part:'()',title:'Parentheses define order',explanation:'Excel follows arithmetic precedence, but parentheses communicate your intended grouping and prevent accidental changes.',why:'A rate applied after a subtotal is different from a rate applied to one line item.',example:'=(E2+F2)*1.0825'},
      {part:'ROUND',title:'Round the final value',explanation:'ROUND(number, digits) changes the stored result. For currency, calculate with full precision when possible and round only the final customer-facing value.',why:'Rounding every intermediate number can introduce small reconciliation differences.',example:'=ROUND(E2*1.0825,2)'},
    ],
    formulaSpotlights:[
      {formula:'=AVERAGE(E2:E6)',powerful:'Gives a typical value without manually calculating a total and count.',whenToUse:'Use when comparing an individual sale, ticket, or cost against a baseline.',practicalExample:'The five Sales revenue cells range from $180 to $840.',result:'The formula returns $503 average revenue.'},
      {formula:'=MAX(E2:E6)',powerful:'Surfaces the largest numeric value in a live range.',whenToUse:'Use for largest deal, peak workload, highest score, or latest measurement.',practicalExample:'The Sales Revenue values include $480, $180, $840, $390, and $625.',result:'The formula returns $840.'},
      {formula:'=ROUND(E2*1.0825,2)',powerful:'Applies a rate and produces a currency-safe presentation value.',whenToUse:'Use when displaying tax, discounts, commissions, or rounded financial outputs.',practicalExample:'E2 is $480 and the tax multiplier is 1.0825.',result:'The formula returns $519.60.'},
    ],
    realWorldExample:{context:'Finance',title:'Prepare a tax-inclusive quote',purpose:'A quote sheet calculates tax on each line and rounds the customer-facing amount to cents.',formula:'=ROUND(NetAmount*(1+TaxRate),2)'},
    proTip:'Use SUM for a range, not a plus sign chain. It survives row inserts more gracefully and tells reviewers what you meant.',workbook:[salesSheet],
    exercises:[
      exercise({id:'excel-math-1',title:'Find average order revenue',task:'In G2, calculate the average Revenue from E2:E6.',targetCell:'G2',starterFormula:'=',solutionFormula:'=AVERAGE(E2:E6)',expectedValue:503,resultNote:'Average order revenue is $503.',hints:['This is a typical-value question, not a total.','AVERAGE accepts the same range syntax as SUM.','Use the Revenue range E2:E6.'],explanation:['AVERAGE adds numeric values and divides by their count.','Text and blank cells are treated differently from zero, so know your source data.','The result gives a useful baseline for spotting unusually large or small orders.']}),
      exercise({id:'excel-math-2',title:'Find the largest deal',task:'In G2, return the highest Revenue value from E2:E6.',targetCell:'G2',starterFormula:'=',solutionFormula:'=MAX(E2:E6)',expectedValue:840,resultNote:'The largest order is $840.',hints:['Use an aggregate that returns the greatest value.','The Revenue values are all in column E.','MAX works over a range.'],explanation:['MAX scans the range and returns its largest numeric entry.','Unlike sorting, the formula remains live when the source values change.','Pair MAX with XLOOKUP or INDEX/MATCH when you later need details about the winning row.']}),
      exercise({id:'excel-math-3',title:'Calculate tax-inclusive revenue',task:'In G2, apply an 8.25% rate to E2 and round to two decimal places.',targetCell:'G2',starterFormula:'=',solutionFormula:'=ROUND(E2*1.0825,2)',expectedValue:519.6,resultNote:'$480 at 8.25% becomes $519.60.',hints:['A 8.25% increase means multiply by 1.0825.','Calculate the amount before rounding it.','ROUND needs the value and the number of decimal places.'],explanation:['1.0825 represents 100% of the original amount plus 8.25% tax.','ROUND(...,2) returns a cents-level number.','The formula keeps the source revenue untouched and creates a new calculated output.']}),
    ],
  },
  {
    id:'excel-logic',number:'03',title:'Logical tests & decision formulas',eyebrow:'DECISION LOGIC',duration:22,difficulty:'Intermediate',
    summary:'Turn business rules into transparent spreadsheet decisions using IF, AND, OR, and IFERROR.',
    objectives:['Write a test with a clear true and false outcome','Combine rules with AND and OR','Handle expected errors without masking unexpected data issues'],concepts:['IF','AND','OR','IFERROR'],
    mechanics:[
      {part:'IF',title:'Test, then choose an outcome',explanation:'IF(logical_test, value_if_true, value_if_false) evaluates a rule and returns one of two results.',why:'It puts an operational decision next to its source data instead of requiring manual labels.',example:'=IF(E2>=750,"Priority","Standard")'},
      {part:'AND',title:'Require every condition',explanation:'AND returns TRUE only when each contained test is true. Use it inside IF for multi-part eligibility rules.',why:'It prevents a high-value order in the wrong region from receiving the wrong treatment.',example:'=IF(AND(B2="West",E2>=750),"Priority","Standard")'},
      {part:'IFERROR',title:'Handle known failure modes',explanation:'IFERROR(value, fallback) substitutes a value when the first expression returns an error such as #N/A or #DIV/0!.',why:'A dashboard should be readable, but errors should be handled at the specific place they are expected.',example:'=IFERROR(E2/D2,0)'},
    ],
    formulaSpotlights:[
      {formula:'=IF(E2>=500,"Hit","Needs work")',powerful:'Converts a numeric threshold into an immediately usable operational label.',whenToUse:'Use for goals, eligibility, SLA compliance, and simple pass/fail states.',practicalExample:'Order 1001 has $480 in E2 against a $500 threshold.',result:'The formula returns Needs work.'},
      {formula:'=AND(B2="West",E2>=750)',powerful:'Makes a decision depend on every required business condition.',whenToUse:'Use for multi-part approval, priority, and eligibility rules.',practicalExample:'A row must be West and at least $750.',result:'For order 1001 it returns FALSE because revenue is too low.'},
      {formula:'=OR(F2="Pending",E2>=750)',powerful:'Flags a row when any one of several risks or exceptions is present.',whenToUse:'Use for escalation, exception queues, and flexible eligibility rules.',practicalExample:'An order is pending or unusually large.',result:'Order 1002 returns TRUE because it is Pending.'},
      {formula:'=IFERROR(E2/D2,0)',powerful:'Keeps expected calculation failures from breaking a report.',whenToUse:'Use around expected missing lookups or division by zero, with a meaningful fallback.',practicalExample:'Revenue in E2 is divided by Units in D2.',result:'The formula returns $120; it would return 0 for an invalid denominator.'},
    ],
    realWorldExample:{context:'Sales operations',title:'Flag priority follow-up',purpose:'A manager flags West-region orders at or above $750 for same-day review.',formula:'=IF(AND([@Region]="West",[@Revenue]>=750),"Priority","Standard")'},
    proTip:'Write the business rule in plain language first. Then translate one condition at a time into an IF test.',workbook:[salesSheet],
    exercises:[
      exercise({id:'excel-logic-1',title:'Label a target hit',task:'In G2, return "Hit" when E2 is at least 500; otherwise return "Needs work".',targetCell:'G2',starterFormula:'=',solutionFormula:'=IF(E2>=500,"Hit","Needs work")',expectedValue:'Needs work',resultNote:'Order 1001 is below the $500 threshold.',hints:['IF needs a test, a true result, and a false result.','The threshold is inclusive: use >=.','Return text in double quotes.'],explanation:['The comparison E2>=500 evaluates to FALSE for $480.','IF therefore returns the third argument, "Needs work".','When copied down, E2 becomes E3 and the same threshold rule applies to every order.']}),
      exercise({id:'excel-logic-2',title:'Identify priority orders',task:'In G2, return "Priority" only when B2 is West and E2 is at least 750; otherwise return "Standard".',targetCell:'G2',starterFormula:'=',solutionFormula:'=IF(AND(B2="West",E2>=750),"Priority","Standard")',expectedValue:'Standard',resultNote:'Order 1001 is West but below the $750 threshold.',hints:['There are two required conditions.','AND joins conditions that must both be true.','Put AND(...) inside the first argument of IF.'],explanation:['B2="West" is TRUE, while E2>=750 is FALSE.','AND returns FALSE because every condition must pass.','IF returns "Standard" while retaining the source values that explain the decision.']}),
      exercise({id:'excel-logic-3',title:'Protect a unit calculation',task:'In G2, divide E2 by D2 and return 0 if Excel encounters an error.',targetCell:'G2',starterFormula:'=',solutionFormula:'=IFERROR(E2/D2,0)',expectedValue:120,resultNote:'$480 divided by 4 units equals $120 per unit.',hints:['The normal calculation is revenue divided by units.','Wrap a potentially failing calculation in IFERROR.','Use 0 as the fallback argument.'],explanation:['E2/D2 calculates the normal unit amount.','IFERROR returns that calculation when it succeeds.','If a future row has zero units or invalid input, the formula returns 0 instead of displaying an unhandled error.']}),
    ],
  },
  {
    id:'excel-conditional',number:'04',title:'Conditional totals & counts',eyebrow:'ANALYTICAL FORMULAS',duration:23,difficulty:'Intermediate',
    summary:'Answer focused business questions with SUMIF, COUNTIF, AVERAGEIF, and their multi-condition counterparts.',
    objectives:['Define a condition range separately from a result range','Use criteria text and comparison operators correctly','Add multiple conditions with SUMIFS and COUNTIFS'],concepts:['SUMIF','COUNTIF','SUMIFS'],
    mechanics:[
      {part:'SUMIF',title:'Sum only qualifying rows',explanation:'SUMIF(criteria_range, criterion, sum_range) tests one range and sums a parallel numeric range.',why:'It replaces fragile filters and manual subtotaling in recurring reports.',example:'=SUMIF(B2:B6,"West",E2:E6)'},
      {part:'COUNTIF',title:'Count a matching population',explanation:'COUNTIF(range, criterion) counts cells that meet one rule. It is useful for operational queues and data-quality checks.',why:'A count answers volume questions without needing a helper column.',example:'=COUNTIF(F2:F6,"Paid")'},
      {part:'SUMIFS',title:'Add conditions in pairs',explanation:'SUMIFS(sum_range, criteria_range1, criterion1, ...) starts with the values to add, then lists each condition pair.',why:'It makes the metric population explicit and repeatable.',example:'=SUMIFS(E2:E6,B2:B6,"West",F2:F6,"Paid")'},
    ],
    formulaSpotlights:[
      {formula:'=SUMIF(B2:B6,"West",E2:E6)',powerful:'Adds a measure only for records meeting one rule.',whenToUse:'Use for revenue by region, spending by category, or hours by employee.',practicalExample:'West is the criterion in Region column B.',result:'The formula returns $1,320.'},
      {formula:'=COUNTIF(F2:F6,"Paid")',powerful:'Counts an operational population without a helper column.',whenToUse:'Use for paid orders, overdue tasks, open tickets, and data checks.',practicalExample:'Four Sales Status cells say Paid.',result:'The formula returns 4.'},
      {formula:'=SUMIFS(E2:E6,B2:B6,"West",F2:F6,"Paid")',powerful:'Defines a metric with multiple conditions in one formula.',whenToUse:'Use whenever a KPI needs a precisely filtered population.',practicalExample:'Revenue is limited to West orders whose status is Paid.',result:'The formula returns $1,320.'},
    ],
    realWorldExample:{context:'Regional reporting',title:'Report paid West revenue',purpose:'A finance lead sums only paid West orders before sending a regional performance update.',formula:'=SUMIFS(Sales[Revenue],Sales[Region],"West",Sales[Status],"Paid")'},
    proTip:'Every criteria range in SUMIFS must align row-for-row with the sum range. Mismatched ranges create incorrect totals.',workbook:[salesSheet],
    exercises:[
      exercise({id:'excel-conditional-1',title:'Sum West revenue',task:'In G2, sum Revenue where Region is "West".',targetCell:'G2',starterFormula:'=',solutionFormula:'=SUMIF(B2:B6,"West",E2:E6)',expectedValue:1320,resultNote:'West has $1,320 of revenue.',hints:['The Region values are in B2:B6.','The criterion is the text "West".','Revenue in E2:E6 is the range to add.'],explanation:['SUMIF checks each Region cell against "West".','For matching rows, it adds the Revenue value from the same row.','Ava’s two West orders are included; the other regions are excluded.']}),
      exercise({id:'excel-conditional-2',title:'Count paid orders',task:'In G2, count the Status cells in F2:F6 that equal "Paid".',targetCell:'G2',starterFormula:'=',solutionFormula:'=COUNTIF(F2:F6,"Paid")',expectedValue:4,resultNote:'Four of the five orders are paid.',hints:['This asks for a count, not a revenue total.','Status is in column F.','COUNTIF takes a range and one criterion.'],explanation:['COUNTIF evaluates every status in the target range.','It increments only for the exact text "Paid".','The result is a live operational count that changes as statuses change.']}),
      exercise({id:'excel-conditional-3',title:'Sum paid West revenue',task:'In G2, sum Revenue for orders that are both West and Paid.',targetCell:'G2',starterFormula:'=',solutionFormula:'=SUMIFS(E2:E6,B2:B6,"West",F2:F6,"Paid")',expectedValue:1320,resultNote:'Both West orders are paid, totaling $1,320.',hints:['Use the multi-condition version of SUMIF.','SUMIFS begins with the range to sum.','Then add Region/West and Status/Paid as two range–criterion pairs.'],explanation:['E2:E6 is the metric range to add.','B2:B6 with "West" limits rows to the region.','F2:F6 with "Paid" applies the second rule to the same rows.','Only rows satisfying both pairs contribute revenue.']}),
    ],
  },
  {
    id:'excel-lookups',number:'05',title:'Lookups that survive real workbooks',eyebrow:'DATA CONNECTIONS',duration:27,difficulty:'Intermediate',
    summary:'Retrieve related values with XLOOKUP, understand the lookup/return relationship, and maintain a dependable INDEX/MATCH fallback.',
    objectives:['Choose a stable lookup key','Use XLOOKUP’s lookup and return arrays correctly','Understand exact matching and missing-value behavior'],concepts:['XLOOKUP','INDEX','MATCH'],
    mechanics:[
      {part:'XLOOKUP',title:'Find a key, return a peer value',explanation:'XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found]) searches one aligned array and returns from another.',why:'It separates data storage from reporting and avoids manually copying attributes between sheets.',example:'=XLOOKUP(A2,Products!A2:A5,Products!C2:C5,"Missing")'},
      {part:'Exact',title:'Exact is the safe default',explanation:'For SKUs, account IDs, and employee IDs, a near match can quietly return the wrong record. XLOOKUP defaults to exact matching.',why:'Stable keys prevent accidental matches when names or sort orders change.',example:'=XLOOKUP("P-300",Products!A2:A5,Products!C2:C5)'},
      {part:'INDEX/MATCH',title:'Separate position from return',explanation:'MATCH finds a position; INDEX returns the value at that position in a chosen range.',why:'It remains useful in older workbooks and teaches the two parts hidden inside a lookup.',example:'=INDEX(Products!C2:C5,MATCH(A2,Products!A2:A5,0))'},
    ],
    formulaSpotlights:[
      {formula:'=XLOOKUP(A2,Products!A2:A5,Products!C2:C5,"Missing")',powerful:'Connects a user-entered key to trusted reference data without manual copy/paste.',whenToUse:'Use for prices, employee attributes, account owners, and product details.',practicalExample:'Order Form cell A2 contains SKU P-300.',result:'The formula returns $80 from the Products price column.'},
      {formula:'=MATCH(A2,Products!A2:A5,0)',powerful:'Finds the exact relative position of a key in a lookup range.',whenToUse:'Use when pairing with INDEX or when the position itself is valuable.',practicalExample:'P-300 is the third SKU in Products!A2:A5.',result:'The formula returns 3.'},
      {formula:'=INDEX(Products!C2:C5,MATCH(A2,Products!A2:A5,0))',powerful:'Separates key matching from returning a value, making lookup logic portable.',whenToUse:'Use in older workbooks or when the return range must be chosen dynamically.',practicalExample:'MATCH finds P-300’s position and INDEX reads that position from prices.',result:'The formula returns $80.'},
    ],
    realWorldExample:{context:'Order entry',title:'Retrieve a unit price from SKU',purpose:'A form uses the entered SKU to return the catalogue price and prevents a manual pricing error.',formula:'=XLOOKUP([@SKU],Products[SKU],Products[Unit Price],"Unknown SKU")'},
    proTip:'Keep lookup keys clean and unique. A perfectly written XLOOKUP cannot fix duplicate or inconsistent source keys.',workbook:[{name:'Order Form',description:'A lightweight order entry form. SKU is the user-entered key.',columns:[{key:'A',label:'SKU',meaning:'Entered product key'},{key:'B',label:'Quantity',meaning:'Units requested'}],rows:[['P-300',2]]},productSheet],
    exercises:[
      exercise({id:'excel-lookups-1',title:'Retrieve a price',task:'In C2, use the SKU in A2 to return the Unit Price from Products. Return "Missing" if the SKU is not found.',targetCell:'C2',starterFormula:'=',solutionFormula:'=XLOOKUP(A2,Products!A2:A5,Products!C2:C5,"Missing")',expectedValue:80,resultNote:'SKU P-300 maps to the $80 Keyboard price.',hints:['The lookup value is the SKU in A2.','Products column A contains keys and column C contains prices.','Use "Missing" as XLOOKUP’s fourth argument.'],explanation:['XLOOKUP searches Products!A2:A5 for P-300.','The matching row is used to return the peer value from Products!C2:C5.','The final argument provides a readable outcome rather than #N/A for absent SKUs.']}),
      exercise({id:'excel-lookups-2',title:'Return a category',task:'In C2, use the SKU in A2 to return its Category from Products, with "Missing" if not found.',targetCell:'C2',starterFormula:'=',solutionFormula:'=XLOOKUP(A2,Products!A2:A5,Products!D2:D5,"Missing")',expectedValue:'Electronics',resultNote:'SKU P-300 is in Electronics.',hints:['The lookup array remains Products column A.','Category is in Products column D.','The return array can be different from the price return array.'],explanation:['The lookup key and lookup array stay unchanged.','Only the return array changes from Unit Price to Category.','This illustrates why XLOOKUP is clearer than manually keeping related fields in the order sheet.']}),
      exercise({id:'excel-lookups-3',title:'Use the INDEX/MATCH fallback',task:'In C2, return the Unit Price for the SKU in A2 using INDEX and MATCH with an exact match.',targetCell:'C2',starterFormula:'=',solutionFormula:'=INDEX(Products!C2:C5,MATCH(A2,Products!A2:A5,0))',expectedValue:80,resultNote:'MATCH finds P-300’s third position; INDEX returns the third price.',hints:['MATCH should search the SKU column for A2.','Use 0 in MATCH for an exact match.','INDEX returns from the Unit Price range at MATCH’s position.'],explanation:['MATCH(A2,Products!A2:A5,0) returns the relative position of P-300.','INDEX uses that position inside the price range.','The two functions together recreate an exact lookup while making each stage visible.']}),
    ],
  },
  {
    id:'excel-text',number:'06',title:'Text cleanup & human-readable fields',eyebrow:'DATA CLEANUP',duration:21,difficulty:'Intermediate',
    summary:'Normalize inconsistent imported text and compose usable labels without rewriting source data by hand.',
    objectives:['Remove accidental spaces with TRIM','Standardize casing with UPPER, LOWER, and PROPER','Join text while safely ignoring optional pieces'],concepts:['TRIM','PROPER','TEXTJOIN'],
    mechanics:[
      {part:'TRIM',title:'Remove surplus spaces',explanation:'TRIM removes leading and trailing spaces and reduces repeated interior spaces to one.',why:'Invisible spacing causes lookup failures, duplicate-looking values, and messy display labels.',example:'=TRIM(A2)'},
      {part:'PROPER',title:'Standardize display casing',explanation:'PROPER capitalizes the first letter of each word. It is useful for names and labels, but not for codes, acronyms, or email addresses.',why:'A presentation layer can be consistent while the raw import stays available for audit.',example:'=PROPER(TRIM(A2))'},
      {part:'TEXTJOIN',title:'Compose optional text safely',explanation:'TEXTJOIN(delimiter, ignore_empty, text1, ...) joins values and can skip blank components.',why:'It avoids extra spaces in names when a middle-name field is empty.',example:'=TEXTJOIN(" ",TRUE,B2:D2)'},
    ],
    formulaSpotlights:[
      {formula:'=TRIM(A2)',powerful:'Removes invisible spacing that breaks comparisons and makes reports look inconsistent.',whenToUse:'Use immediately after importing names, codes, or values from external systems.',practicalExample:'A2 contains two leading spaces and repeated spacing in maya chen.',result:'The formula returns maya chen with one internal space.'},
      {formula:'=PROPER(TRIM(A2))',powerful:'Creates a readable presentation value without overwriting raw source data.',whenToUse:'Use for display names and labels, but avoid it for acronyms, emails, and codes.',practicalExample:'The cleaned raw name is converted to title case.',result:'The formula returns Maya Chen.'},
      {formula:'=TEXTJOIN(" ",TRUE,B2:D2)',powerful:'Combines variable-length text fields without stray separators.',whenToUse:'Use for full names, addresses, tags, and narrative labels with optional fields.',practicalExample:'First, middle, and last name occupy B2:D2.',result:'The formula returns Maya L. Chen.'},
    ],
    realWorldExample:{context:'People operations',title:'Create a clean display name',purpose:'A scheduler turns raw imports into reliable names for a weekly staffing roster.',formula:'=PROPER(TRIM([@[Raw name]]))'},
    proTip:'Keep the raw import column. Create a clean helper column beside it so you can compare and diagnose source-quality problems.',workbook:[staffSheet],
    exercises:[
      exercise({id:'excel-text-1',title:'Remove extra spaces',task:'In E2, clean the raw name in A2 by removing surplus spaces.',targetCell:'E2',starterFormula:'=',solutionFormula:'=TRIM(A2)',expectedValue:'maya chen',resultNote:'The leading, trailing, and repeated spaces are removed.',hints:['The source is the Raw name cell A2.','Use the Excel function made for extra spaces.','Wrap A2 in TRIM(...).'],explanation:['TRIM removes whitespace at both ends of the incoming string.','It also reduces the double space between Maya and Chen to one.','The underlying raw import remains unchanged for audit.']}),
      exercise({id:'excel-text-2',title:'Create a display-ready name',task:'In E2, trim A2 and convert it to proper case.',targetCell:'E2',starterFormula:'=',solutionFormula:'=PROPER(TRIM(A2))',expectedValue:'Maya Chen',resultNote:'The name is now clean and display-ready.',hints:['Clean spacing before applying display formatting.','TRIM(A2) is the inner expression.','Wrap that expression with PROPER(...).'],explanation:['TRIM first creates a normalized text value.','PROPER then capitalizes each word in that cleaned value.','Nesting mirrors the sequence of operations: clean, then format.']}),
      exercise({id:'excel-text-3',title:'Join name components',task:'In E2, join B2:D2 with spaces while ignoring any blank component.',targetCell:'E2',starterFormula:'=',solutionFormula:'=TEXTJOIN(" ",TRUE,B2:D2)',expectedValue:'Maya L. Chen',resultNote:'TEXTJOIN creates one name and skips blanks in later rows.',hints:['The delimiter between pieces is a single space.','Use TRUE to ignore blanks.','The components occupy the continuous range B2:D2.'],explanation:['TEXTJOIN uses " " as the separator between text values.','TRUE prevents a blank middle field from creating a doubled space.','The range keeps all name components in their natural order.']}),
    ],
  },
  {
    id:'excel-dates',number:'07',title:'Dates, schedules & workdays',eyebrow:'TIME INTELLIGENCE',duration:23,difficulty:'Intermediate',
    summary:'Treat dates as values you can calculate with, not strings you manually type into status reports.',
    objectives:['Extract date parts with YEAR, MONTH, and DAY','Find month boundaries with EOMONTH','Measure business days with NETWORKDAYS'],concepts:['YEAR','EOMONTH','NETWORKDAYS'],
    mechanics:[
      {part:'YEAR',title:'Extract a date component',explanation:'YEAR(date), MONTH(date), and DAY(date) return numeric pieces of a valid Excel date.',why:'Date components support reporting groups and simple labels without editing the original date.',example:'=YEAR(A2)'},
      {part:'EOMONTH',title:'Find a stable month end',explanation:'EOMONTH(start_date, months) returns the last day of a month offset from the start date.',why:'Month-end calculations avoid hard-coding 28, 30, or 31 and naturally handle leap years.',example:'=EOMONTH(A2,0)'},
      {part:'NETWORKDAYS',title:'Count working time',explanation:'NETWORKDAYS(start_date, end_date, [holidays]) counts weekdays inclusively and can exclude a holiday range.',why:'Project plans need working days, not calendar days, for realistic capacity estimates.',example:'=NETWORKDAYS(A2,B2)'},
    ],
    formulaSpotlights:[
      {formula:'=YEAR(A2)',powerful:'Extracts a reporting dimension from a date without changing the original value.',whenToUse:'Use for annual grouping, fiscal comparisons, and date-based labels.',practicalExample:'A2 is July 6, 2026.',result:'The formula returns 2026.'},
      {formula:'=EOMONTH(A2,0)',powerful:'Finds month-end reliably for any month and year.',whenToUse:'Use for accounting periods, renewal dates, and monthly reporting cutoffs.',practicalExample:'A2 is any date in July 2026.',result:'The formula returns July 31, 2026.'},
      {formula:'=NETWORKDAYS(A2,B2)',powerful:'Measures working time instead of misleading calendar time.',whenToUse:'Use for project duration, service targets, and staffing capacity.',practicalExample:'A2 is July 6 and B2 is July 24, 2026.',result:'The formula returns 15 weekdays.'},
    ],
    realWorldExample:{context:'Project management',title:'Estimate schedule effort',purpose:'A delivery lead counts the weekday duration of each project and groups starts by calendar month.',formula:'=NETWORKDAYS([@[Start date]],[@[End date]])'},
    proTip:'Make sure imported dates are real date values. If they are left-aligned text, date functions may return errors or misleading results.',workbook:[projectSheet],
    exercises:[
      exercise({id:'excel-dates-1',title:'Extract the start year',task:'In E2, return the year from the Start date in A2.',targetCell:'E2',starterFormula:'=',solutionFormula:'=YEAR(A2)',expectedValue:2026,resultNote:'The Portal refresh begins in 2026.',hints:['The date to inspect is A2.','Use the date-part function that returns four digits.','Wrap A2 in YEAR(...).'],explanation:['YEAR reads the underlying date value, not its displayed text.','It returns a number suitable for grouping or comparison.','The original date remains available for full timeline reporting.']}),
      exercise({id:'excel-dates-2',title:'Find month end',task:'In E2, return the last day of the month containing A2.',targetCell:'E2',starterFormula:'=',solutionFormula:'=EOMONTH(A2,0)',expectedValue:'2026-07-31',resultNote:'The end of July 2026 is July 31.',hints:['Use the month-end function.','The first argument is A2.','Use 0 months of offset to stay in A2’s month.'],explanation:['EOMONTH starts from the date in A2.','An offset of zero selects the same month.','Excel returns that month’s final date, regardless of how many days it has.']}),
      exercise({id:'excel-dates-3',title:'Count project workdays',task:'In E2, count the weekday workdays from A2 through B2.',targetCell:'E2',starterFormula:'=',solutionFormula:'=NETWORKDAYS(A2,B2)',expectedValue:15,resultNote:'The project spans 15 weekdays inclusive.',hints:['This is a weekday count, not simple end minus start.','NETWORKDAYS uses a start date then an end date.','Use A2 and B2 in that order.'],explanation:['NETWORKDAYS excludes Saturdays and Sundays by default.','Both the start and end dates are included when they are weekdays.','You can later add a third holiday-range argument for organization-specific calendars.']}),
    ],
  },
  {
    id:'excel-arrays',number:'08',title:'Dynamic arrays & spill formulas',eyebrow:'MODERN EXCEL',duration:26,difficulty:'Advanced',
    summary:'Use one formula to return a live list, unique values, or sorted analysis that spills into neighboring cells.',
    objectives:['Recognize spill behavior','Filter records with FILTER','Return distinct values with UNIQUE and order them with SORT'],concepts:['FILTER','UNIQUE','SORT'],
    mechanics:[
      {part:'Spill',title:'One formula, many cells',explanation:'Dynamic-array formulas return multiple values and spill into adjacent cells automatically. The spill area must be empty.',why:'You can replace copied helper formulas with one transparent source-of-truth formula.',example:'=UNIQUE(B2:B6)'},
      {part:'FILTER',title:'Return matching records',explanation:'FILTER(array, include, [if_empty]) returns all rows where the include expression is TRUE.',why:'It creates live operational lists without manually applying and reapplying filters.',example:'=FILTER(A2:D6,C2:C6="Open","No open tickets")'},
      {part:'SORT',title:'Order without mutating source',explanation:'SORT(array, [sort_index], [sort_order]) returns a sorted view and leaves the original table untouched.',why:'Dashboards can show ranked information while source data preserves entry order.',example:'=SORT(A2:D6,4,-1)'},
    ],
    formulaSpotlights:[
      {formula:'=FILTER(A2:D6,C2:C6="Open","No open tickets")',powerful:'Creates a live filtered report with one formula instead of copied helper rows.',whenToUse:'Use for live queues, exception lists, and dashboard detail panels.',practicalExample:'The Tickets sheet has three rows with Open status.',result:'The formula spills three complete ticket rows.'},
      {formula:'=UNIQUE(B2:B6)',powerful:'Produces a live de-duplicated list that expands as source values change.',whenToUse:'Use for dropdown source lists, category lists, and quick data exploration.',practicalExample:'Tickets contain Atlas and Beacon repeatedly.',result:'The formula spills Atlas and Beacon once each.'},
      {formula:'=SORT(A2:D6,4,-1)',powerful:'Shows a ranked view while leaving source-entry order untouched.',whenToUse:'Use for leaderboards, aged queues, and priority views.',practicalExample:'Hours Open is the fourth column of the Tickets array.',result:'The formula spills tickets from 42 hours down to 4 hours.'},
    ],
    realWorldExample:{context:'Support operations',title:'Create a live open-ticket queue',purpose:'A team lead uses a single FILTER formula to show only open tickets on a dashboard tab.',formula:'=FILTER(Tickets,Tickets[Status]="Open","Queue clear")'},
    proTip:'Never type into cells directly below or beside a spill formula. Excel will show #SPILL! until the output area is clear.',workbook:[supportSheet],
    exercises:[
      exercise({id:'excel-arrays-1',title:'Create an open-ticket queue',task:'In F2, return the rows from A2:D6 whose Status in C2:C6 equals "Open". Use "No open tickets" if none match.',targetCell:'F2',starterFormula:'=',solutionFormula:'=FILTER(A2:D6,C2:C6="Open","No open tickets")',expectedValue:'3 rows spill',resultNote:'Tickets 501, 503, and 505 spill into a three-row queue.',hints:['The array to return is the full A2:D6 table.','The include test compares the Status range to "Open".','Provide the fallback as FILTER’s third argument.'],explanation:['FILTER evaluates the Status test for every row in the source array.','The TRUE rows spill together with all four selected columns.','The fallback text is used only if no row matches, avoiding a bare calculation error.']}),
      exercise({id:'excel-arrays-2',title:'List unique teams',task:'In F2, return the distinct Team names from B2:B6.',targetCell:'F2',starterFormula:'=',solutionFormula:'=UNIQUE(B2:B6)',expectedValue:'Atlas, Beacon',resultNote:'The formula spills two unique team names.',hints:['Repeated team names should appear once.','Use the dynamic-array function that removes repeats.','Team values are in B2:B6.'],explanation:['UNIQUE returns each distinct value once in first-seen order.','The result spills vertically because the source is a vertical range.','A new team added to the source will appear automatically when the range or table expands.']}),
      exercise({id:'excel-arrays-3',title:'Sort tickets by urgency proxy',task:'In F2, return A2:D6 sorted by Hours Open (the fourth column) descending.',targetCell:'F2',starterFormula:'=',solutionFormula:'=SORT(A2:D6,4,-1)',expectedValue:'5 rows sorted',resultNote:'The result spills all tickets with longest-open first.',hints:['SORT receives the full array first.','Hours Open is the fourth column of that array.','Use -1 for descending order.'],explanation:['SORT creates a new ordered view rather than moving source rows.','The sort index is relative to A2:D6, so Hours Open is column 4.','Descending order puts 42 hours before 31, 18, 6, and 4.']}),
    ],
  },
  {
    id:'excel-tables',number:'09',title:'Excel Tables, structured references & pivots',eyebrow:'RELIABLE REPORTING',duration:28,difficulty:'Advanced',
    summary:'Turn ranges into resilient Excel Tables, write formulas that name columns, and understand when a PivotTable is the fastest summary tool.',
    objectives:['Use Table names and column names in formulas','Choose a PivotTable for interactive grouping','Keep source data tidy before building a report'],concepts:['Excel Tables','Structured references','PivotTables'],
    mechanics:[
      {part:'Table',title:'A table grows with data',explanation:'Ctrl/Cmd+T converts a range into an Excel Table. Formulas, formatting, and references expand when new rows are added.',why:'It removes fragile fixed-range maintenance from recurring workbooks.',example:'=SUM(Sales[Revenue])'},
      {part:'[@]',title:'This-row references are readable',explanation:'Inside a Table, [@Region] means the Region value on the current row. Sales[Region] means the entire column.',why:'Structured references communicate business meaning more clearly than B2:B6.',example:'=SUMIFS(Sales[Revenue],Sales[Region],[@Region])'},
      {part:'Pivot',title:'Pivots summarize by drag and drop',explanation:'A PivotTable groups clean tabular data into totals, counts, and cross-tabs. Put dimensions in Rows/Columns and metrics in Values.',why:'It is often the quickest way to explore a new dataset before formalizing a dashboard formula.',example:'Rows: Region · Values: Sum of Revenue'},
    ],
    formulaSpotlights:[
      {formula:'=SUM(Sales[Revenue])',powerful:'Uses a named Table column that grows with new records.',whenToUse:'Use for durable totals in recurring reports.',practicalExample:'Sales is the source Table and Revenue is its metric column.',result:'The formula returns $2,515 today and expands with tomorrow’s rows.'},
      {formula:'=SUMIFS(Sales[Revenue],Sales[Region],[@Region])',powerful:'Reads like a business rule and fills down a summary Table automatically.',whenToUse:'Use for row-by-row summaries where each summary row supplies a criterion.',practicalExample:'A West summary row has [@Region] equal to West.',result:'The formula returns $1,320.'},
      {formula:'PivotTable: Rows Region; Values Sum of Revenue',powerful:'Summarizes a dataset interactively without writing a formula per group.',whenToUse:'Use to explore a new clean dataset or give users flexible grouping controls.',practicalExample:'Drag Region to Rows and Revenue to Values.',result:'Excel produces a revenue total for East, South, and West.'},
    ],
    realWorldExample:{context:'Executive reporting',title:'Build regional revenue KPIs',purpose:'An analyst uses a Sales Table for formulas and a PivotTable for an interactive regional breakdown.',formula:'=SUMIFS(Sales[Revenue],Sales[Region],[@Region],Sales[Status],"Paid")'},
    proTip:'A PivotTable is only as trustworthy as its source: one header row, no merged cells, consistent data types, and no subtotal rows inside the data.',workbook:[salesSheet],
    exercises:[
      exercise({id:'excel-tables-1',title:'Total a Table column',task:'In a KPI cell, sum the Revenue column of the Sales Table using a structured reference.',targetCell:'KPI!B2',starterFormula:'=',solutionFormula:'=SUM(Sales[Revenue])',expectedValue:2515,resultNote:'The Sales Table currently totals $2,515.',hints:['Use the table name Sales.','A full table column uses brackets around its header.','Wrap Sales[Revenue] in SUM.'],explanation:['Sales[Revenue] expands as the Table gains rows.','SUM then aggregates that named column.','The formula reads like the business question and avoids a brittle fixed cell range.']}),
      exercise({id:'excel-tables-2',title:'Build a regional Table metric',task:'In a regional summary Table, sum paid Sales revenue where the current row’s Region is [@Region].',targetCell:'Summary!B2',starterFormula:'=',solutionFormula:'=SUMIFS(Sales[Revenue],Sales[Region],[@Region],Sales[Status],"Paid")',expectedValue:1320,resultNote:'For a West summary row, paid revenue is $1,320.',hints:['SUMIFS begins with the Sales Revenue column.','Use Sales[Region] as the first criteria range.','[@Region] points to the summary table’s current Region cell.'],explanation:['Sales[Revenue] is the metric to add.','Sales[Region] and [@Region] connect the source and current summary row.','The Status pair keeps only paid orders.','The formula fills down a summary table without editing cell coordinates.']}),
      exercise({id:'excel-tables-3',title:'Count paid Table rows',task:'In a KPI cell, count Sales rows whose Status is "Paid" using COUNTIFS.',targetCell:'KPI!B3',starterFormula:'=',solutionFormula:'=COUNTIFS(Sales[Status],"Paid")',expectedValue:4,resultNote:'Four Sales rows have a Paid status.',hints:['COUNTIFS counts rows matching one or more criteria.','The Status column is Sales[Status].','Use "Paid" as the criterion.'],explanation:['COUNTIFS evaluates the named Status column row by row.','It counts the rows that exactly match Paid.','Using the Table column allows the KPI to grow with the source data.']}),
    ],
  },
  {
    id:'excel-dashboards',number:'10',title:'Dashboard formulas, errors & quality checks',eyebrow:'DECISION-READY EXCEL',duration:30,difficulty:'Advanced',
    summary:'Combine lookups, conditional formulas, and intentional error handling into KPIs people can trust.',
    objectives:['Design a KPI from a clear metric definition','Use IFERROR around expected missing lookup data','Add simple data-quality checks before presenting a dashboard'],concepts:['Dashboard KPIs','IFERROR','Quality checks'],
    mechanics:[
      {part:'KPI',title:'Define before you calculate',explanation:'A KPI needs a population, measure, and time window. For example: paid revenue by region for the current month.',why:'A polished chart with an ambiguous definition is not decision-ready.',example:'=SUMIFS(Sales[Revenue],Sales[Region],A2,Sales[Status],"Paid")'},
      {part:'IFERROR',title:'Make missing inputs legible',explanation:'Wrap a lookup when missing keys are an expected state, and return a specific label such as "Not set".',why:'Users can distinguish missing configuration from an accidental broken formula.',example:'=IFERROR(XLOOKUP(A2,Targets!A2:A4,Targets!B2:B4),"Not set")'},
      {part:'Check',title:'Build an early warning',explanation:'A simple COUNTIF or conditional format can flag blanks, duplicates, or values outside an expected range before they reach a chart.',why:'Quality checks turn a dashboard from a display into a reliable operating tool.',example:'=COUNTIF(Sales[Status],"Pending")'},
    ],
    formulaSpotlights:[
      {formula:'=IFERROR(XLOOKUP(A2,Targets!A2:A4,Targets!B2:B4),"Not set")',powerful:'Turns a missing configuration value into a clear dashboard message.',whenToUse:'Use where missing reference data is expected and should be visible to users.',practicalExample:'A2 contains West and Targets maps West to 1200.',result:'The formula returns 1200; unknown regions show Not set.'},
      {formula:'=SUMIFS(Sales[Revenue],Sales[Region],"West",Sales[Status],"Paid")',powerful:'Creates a KPI with an explicit measure and population.',whenToUse:'Use for dashboard cards where ambiguous totals would mislead decisions.',practicalExample:'The KPI counts only West Sales rows marked Paid.',result:'The formula returns $1,320.'},
      {formula:'=COUNTIF(Sales[Status],"Pending")',powerful:'Adds a simple health check next to headline metrics.',whenToUse:'Use to flag incomplete records, exceptions, and processing backlog.',practicalExample:'One Sales row remains Pending.',result:'The formula returns 1.'},
    ],
    realWorldExample:{context:'Sales leadership',title:'Compare performance with target',purpose:'A dashboard retrieves the target for the selected region and pairs it with paid revenue and a visible data-quality check.',formula:'=IFERROR(XLOOKUP(A2,Targets[Region],Targets[Monthly target]),"Not set")'},
    proTip:'Separate source data, calculation logic, and presentation. A dashboard should consume well-named outputs rather than hide long formulas inside chart cells.',workbook:[salesSheet,targetsSheet],
    exercises:[
      exercise({id:'excel-dashboards-1',title:'Retrieve a regional target',task:'In C2, use A2 as the Region key to return its target from Targets. Return "Not set" if it is missing.',targetCell:'C2',starterFormula:'=',solutionFormula:'=IFERROR(XLOOKUP(A2,Targets!A2:A4,Targets!B2:B4),"Not set")',expectedValue:1200,resultNote:'West has a monthly target of $1,200.',hints:['The selected Region is A2.','Targets column A contains keys and B contains target values.','Wrap XLOOKUP in IFERROR with "Not set" as the fallback.'],explanation:['XLOOKUP retrieves the target for the selected region.','IFERROR makes a missing region understandable to dashboard users.','The formula separates configuration data from the presentation sheet.']}),
      exercise({id:'excel-dashboards-2',title:'Calculate paid revenue for West',task:'In C2, sum Sales revenue for West orders whose Status is Paid.',targetCell:'C2',starterFormula:'=',solutionFormula:'=SUMIFS(Sales[Revenue],Sales[Region],"West",Sales[Status],"Paid")',expectedValue:1320,resultNote:'West paid revenue is $1,320, above its $1,200 target.',hints:['This is a sum with two criteria.','Use Sales[Revenue] as the sum range.','Add Region/West and Status/Paid as criteria pairs.'],explanation:['The KPI’s measure is Sales[Revenue].','Region and Status define its precise population.','The result can be compared directly with the retrieved target because both are revenue values.']}),
      exercise({id:'excel-dashboards-3',title:'Count pending orders',task:'In C2, count Sales rows with Status "Pending" for a data-quality watchlist.',targetCell:'C2',starterFormula:'=',solutionFormula:'=COUNTIF(Sales[Status],"Pending")',expectedValue:1,resultNote:'One pending order should be reviewed before final reporting.',hints:['This is a single-condition row count.','Use the Table’s Status column.','COUNTIF accepts the named column and "Pending".'],explanation:['COUNTIF counts operational exceptions without needing a helper column.','The result makes incomplete orders visible beside headline KPIs.','A dashboard should surface this context rather than silently treating pending revenue as final.']}),
    ],
  },
]

export const excelExerciseKey = (lessonId: string, index: number) => `excel:${lessonId}:${index}`
export const getExcelLesson = (id?: string) => excelLessons.find((lesson) => lesson.id === id) ?? excelLessons[0]
export const getNextExcelLesson = (id: string) => {
  const index = excelLessons.findIndex((lesson) => lesson.id === id)
  return index >= 0 ? excelLessons[index + 1] : undefined
}
