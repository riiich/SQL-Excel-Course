export interface Mechanic {
  part: string
  title: string
  explanation: string
  why: string
  example: string
}

export interface UseCase {
  title: string
  description: string
}

export interface ReferenceItem {
  category: string
  name: string
  purpose: string
  example: string
}

export interface LessonDeepDive {
  overview: string
  mechanics: Mechanic[]
  useCases: UseCase[]
  pitfalls: string[]
  referenceTitle?: string
  referenceIntro?: string
  reference?: ReferenceItem[]
}

const deepDives: Record<string, LessonDeepDive> = {
  'select-expressions': {
    overview: 'A SELECT statement builds a result table. It does not change the source data: it chooses source rows, evaluates expressions for each row, and gives the resulting columns names.',
    mechanics: [
      { part: 'SELECT', title: 'Define the result columns', explanation: 'Everything after SELECT is a result expression. A simple column copies a stored value; a calculation or function derives a new value for each row.', why: 'Explicit projection keeps results understandable, stable, and smaller than SELECT *.', example: `SELECT product, quantity, quantity * unit_price` },
      { part: 'FROM', title: 'Choose the row source', explanation: 'FROM identifies the table, view, CTE, or joined set that supplies rows. SELECT expressions are evaluated against those rows.', why: 'A query can only refer to columns available from its row source.', example: `FROM order_items` },
      { part: 'expression', title: 'Calculate without changing storage', explanation: 'Arithmetic follows normal precedence: multiplication and division occur before addition and subtraction. Parentheses make business formulas explicit.', why: 'Derived values such as tax, margin, and line totals often should be computed from authoritative inputs.', example: `quantity * unit_price * (1 - discount_rate)` },
      { part: 'AS alias', title: 'Name the output', explanation: 'An alias labels a result expression. It affects the query output, not the underlying table definition.', why: 'Clear names make results usable by people, dashboards, and application code.', example: `quantity * unit_price AS line_total` },
    ],
    useCases: [
      { title: 'Application responses', description: 'Return only the fields a screen or API endpoint needs.' },
      { title: 'Calculated business values', description: 'Derive totals, tax, margin, duration, or formatted names from stored facts.' },
      { title: 'Exports and reports', description: 'Rename technical database columns into audience-friendly report headings.' },
      { title: 'Data inspection', description: 'Expose raw values beside a derived value to verify a formula.' },
    ],
    pitfalls: ['SELECT * creates fragile consumers when table columns change.', 'An alias usually cannot be referenced by another expression in the same SELECT list.', 'Integer division may discard decimals in some engines; introduce a decimal value when precision matters.'],
  },
  'where-null': {
    overview: 'WHERE evaluates a condition for each candidate row. Only rows for which that condition is TRUE continue; FALSE and UNKNOWN rows are removed.',
    mechanics: [
      { part: 'comparison', title: 'Create a true-or-false test', explanation: 'Operators such as =, <>, <, <=, >, and >= compare two expressions. Text and date comparisons depend on the stored type and collation.', why: 'Comparisons translate a business rule into a condition the engine can evaluate.', example: `status = 'active'` },
      { part: 'AND / OR', title: 'Combine conditions', explanation: 'AND requires both sides to be true. OR requires at least one. AND has higher precedence, so parentheses should group mixed logic.', why: 'Most real filters describe several requirements or several acceptable alternatives.', example: `status = 'active' AND (country = 'US' OR country = 'CA')` },
      { part: 'IN / BETWEEN / LIKE', title: 'Express common filter shapes', explanation: 'IN tests membership, BETWEEN includes both boundaries, and LIKE matches a text pattern where % means any sequence of characters.', why: 'These forms state intent more clearly than long repeated comparisons.', example: `country IN ('US', 'CA') AND name LIKE 'A%'` },
      { part: 'IS NULL', title: 'Handle missing values', explanation: 'NULL means unknown or absent. Comparisons such as value = NULL evaluate to UNKNOWN; IS NULL and IS NOT NULL are the correct tests.', why: 'Missing information behaves differently from zero, false, or an empty string.', example: `delivered_at IS NULL` },
    ],
    useCases: [
      { title: 'Operational queues', description: 'Find overdue, unresolved, or unassigned work.' },
      { title: 'Audience segmentation', description: 'Select customers by status, location, plan, or activity.' },
      { title: 'Data-quality checks', description: 'Locate missing identifiers, dates, or required relationships.' },
      { title: 'Time-range analysis', description: 'Restrict events to a reporting period or rolling date window.' },
    ],
    pitfalls: ['Writing = NULL never matches; use IS NULL.', 'Mixing AND and OR without parentheses can admit unintended rows.', 'NOT IN can behave unexpectedly if its list or subquery contains NULL.'],
  },
  'sort-distinct-limit': {
    overview: 'Result shaping happens after row selection. ORDER BY defines presentation order, DISTINCT removes duplicate result combinations, and LIMIT takes a slice of the shaped result.',
    mechanics: [
      { part: 'ORDER BY', title: 'Define a deterministic sequence', explanation: 'Sort keys are evaluated left to right. Later keys break ties from earlier keys. ASC is the default; DESC reverses a key.', why: 'Tables are unordered sets, so “first,” “latest,” and pagination have no stable meaning without sorting.', example: `ORDER BY price DESC, name ASC` },
      { part: 'DISTINCT', title: 'Collapse duplicate result rows', explanation: 'DISTINCT considers the entire selected column combination. It does not choose which source duplicate is preferred.', why: 'It is useful when the question asks for unique values or combinations.', example: `SELECT DISTINCT country, region` },
      { part: 'LIMIT', title: 'Keep a bounded number of rows', explanation: 'LIMIT is applied after sorting. Without ORDER BY, the chosen rows may change as storage or query plans change.', why: 'Bounded results support top-N reports, previews, and responsive interfaces.', example: `ORDER BY revenue DESC LIMIT 10` },
      { part: 'OFFSET', title: 'Skip earlier rows', explanation: 'OFFSET discards a number of rows before LIMIT returns its page. Large offsets still require the database to find and skip preceding rows.', why: 'It provides simple pagination for smaller, stable result sets.', example: `LIMIT 25 OFFSET 50` },
    ],
    useCases: [
      { title: 'Top-N lists', description: 'Show highest-value customers, products, or opportunities.' },
      { title: 'Filter options', description: 'Populate a menu with unique countries, categories, or statuses.' },
      { title: 'Pagination', description: 'Return a predictable page after applying deterministic ordering.' },
      { title: 'Recent activity', description: 'Order timestamps descending and keep the newest events.' },
    ],
    pitfalls: ['LIMIT without ORDER BY does not define which rows are returned.', 'DISTINCT can hide an incorrect join instead of fixing its cardinality.', 'A non-unique ORDER BY can make rows jump between pages; add a stable tie-breaker.'],
  },
  'group-by-having': {
    overview: 'Aggregation changes the result grain. Instead of one result row per source row, GROUP BY produces one row per unique grouping key and aggregate functions summarize the rows inside each group.',
    mechanics: [
      { part: 'aggregate()', title: 'Reduce many values to one', explanation: 'COUNT counts, SUM totals, AVG calculates a mean, and MIN/MAX find extremes. Most aggregates ignore NULL input values; COUNT(*) counts rows.', why: 'Aggregates answer questions about a population rather than individual events.', example: `COUNT(*) AS orders, SUM(amount) AS revenue` },
      { part: 'GROUP BY', title: 'Declare the result grain', explanation: 'Every unique combination of grouping expressions becomes one group and therefore one output row.', why: 'The grouping key defines what each result row represents.', example: `GROUP BY region, month` },
      { part: 'WHERE', title: 'Filter rows before summarizing', explanation: 'WHERE runs before grouping, so excluded rows do not contribute to counts, sums, or averages.', why: 'It defines the population being measured, such as paid orders only.', example: `WHERE status = 'paid'` },
      { part: 'HAVING', title: 'Filter the completed groups', explanation: 'HAVING runs after aggregation and can test aggregate values. It is the group-level counterpart to WHERE.', why: 'It keeps groups meeting a summary threshold, such as customers with at least five orders.', example: `HAVING SUM(amount) >= 1000` },
    ],
    useCases: [
      { title: 'KPI reporting', description: 'Calculate revenue, volume, averages, and rates by period or business unit.' },
      { title: 'Threshold alerts', description: 'Find products, accounts, or teams whose totals cross a limit.' },
      { title: 'Data profiling', description: 'Measure row counts, missing values, ranges, and distinct populations.' },
      { title: 'Cohort summaries', description: 'Compare customer or user groups at a consistent grain.' },
    ],
    pitfalls: ['Selecting an ungrouped, non-aggregated column creates invalid or misleading results.', 'COUNT(column) ignores NULL while COUNT(*) counts the row.', 'Filtering an aggregate in WHERE is too early; use HAVING.'],
    referenceTitle: 'Core aggregate functions',
    referenceIntro: 'These functions summarize the rows in each group. With an OVER clause, the same aggregates can also operate as window functions without collapsing rows.',
    reference: [
      { category: 'Counting', name: 'COUNT(*)', purpose: 'Count every row in the group.', example: `COUNT(*) AS order_count` },
      { category: 'Counting', name: 'COUNT(expression)', purpose: 'Count rows where the expression is not NULL.', example: `COUNT(shipped_at) AS shipped_count` },
      { category: 'Totals', name: 'SUM(expression)', purpose: 'Add non-NULL numeric values.', example: `SUM(amount) AS revenue` },
      { category: 'Statistics', name: 'AVG(expression)', purpose: 'Calculate the arithmetic mean of non-NULL values.', example: `AVG(response_minutes)` },
      { category: 'Extremes', name: 'MIN(expression)', purpose: 'Return the smallest non-NULL value.', example: `MIN(created_at) AS first_seen` },
      { category: 'Extremes', name: 'MAX(expression)', purpose: 'Return the largest non-NULL value.', example: `MAX(score) AS highest_score` },
      { category: 'Text', name: 'GROUP_CONCAT(expression)', purpose: 'Combine group values into one string in SQLite.', example: `GROUP_CONCAT(tag, ', ')` },
    ],
  },
  'join-basics': {
    overview: 'A join constructs a wider row set by pairing rows from different sources. Correctness depends on the relationship, its keys, and whether unmatched rows should survive.',
    mechanics: [
      { part: 'table aliases', title: 'Name each row source', explanation: 'Aliases such as o and c shorten references and distinguish columns with the same name.', why: 'Qualified names make multi-table queries readable and unambiguous.', example: `FROM orders AS o` },
      { part: 'ON', title: 'Define the matching relationship', explanation: 'The ON condition is evaluated for candidate row pairs. A foreign key commonly matches the referenced primary key.', why: 'The condition determines which facts belong together.', example: `ON c.id = o.customer_id` },
      { part: 'INNER JOIN', title: 'Keep matching pairs only', explanation: 'If a row has no match on the other side, it does not appear. One-to-many relationships repeat the parent for each child.', why: 'Use it when the result only makes sense for entities that have related records.', example: `orders o JOIN customers c ON c.id = o.customer_id` },
      { part: 'LEFT JOIN', title: 'Preserve every left-side row', explanation: 'Unmatched right-side columns become NULL. Matches still repeat the left row when the relationship is one-to-many.', why: 'Use it for complete populations, including zero-activity entities.', example: `customers c LEFT JOIN orders o ON o.customer_id = c.id` },
    ],
    useCases: [
      { title: 'Enrich transactions', description: 'Attach customer, product, or location details to fact rows.' },
      { title: 'Zero-activity reporting', description: 'Include customers with no orders or products with no sales.' },
      { title: 'Relationship audits', description: 'Find missing references or unexpected one-to-many multiplication.' },
      { title: 'Multi-stage reports', description: 'Combine several normalized entities into a reporting dataset.' },
    ],
    pitfalls: ['A missing or incomplete ON condition can produce a Cartesian product.', 'Filtering right-table columns in WHERE can unintentionally turn a LEFT JOIN into an INNER JOIN.', 'Joining two one-to-many relationships at once may multiply measures before aggregation.'],
  },
  'data-mutations': {
    overview: 'Data-modification statements change persistent state. Their column lists, conditions, constraints, and transaction boundary determine exactly what is allowed to change.',
    mechanics: [
      { part: 'INSERT', title: 'Create new rows', explanation: 'A column list maps each supplied value to its destination. Omitted columns receive defaults or NULL when allowed.', why: 'Explicit columns protect the statement when table column order changes.', example: `INSERT INTO inventory (sku, stock) VALUES ('A', 5)` },
      { part: 'UPDATE SET', title: 'Assign new values', explanation: 'SET expressions are evaluated for every targeted row and may reference the row’s current values.', why: 'It supports both replacement and relative changes such as stock = stock + 5.', example: `UPDATE inventory SET stock = stock + 5` },
      { part: 'WHERE', title: 'Control mutation scope', explanation: 'UPDATE and DELETE apply to every row satisfying WHERE. Without WHERE, every row is targeted.', why: 'Precise scope prevents accidental bulk changes.', example: `WHERE sku = 'A-1'` },
      { part: 'DELETE', title: 'Remove rows, not the table', explanation: 'DELETE removes matching records while preserving the table definition. Constraints may block deletion of referenced rows.', why: 'It supports lifecycle and retention rules without destroying the schema.', example: `DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP` },
    ],
    useCases: [
      { title: 'Operational workflows', description: 'Create orders, update statuses, and remove expired temporary data.' },
      { title: 'Inventory management', description: 'Receive products and adjust quantities with scoped updates.' },
      { title: 'Data correction', description: 'Repair known bad values after previewing the exact affected set.' },
      { title: 'Retention enforcement', description: 'Delete records that meet approved age and status requirements.' },
    ],
    pitfalls: ['Running UPDATE or DELETE without WHERE affects the entire table.', 'Building SQL by string concatenation can create injection vulnerabilities; applications should bind values.', 'Several related mutations should usually share a transaction.'],
  },
  'anti-joins': {
    overview: 'An anti-join answers “which left-side rows have no qualifying match?” SQL expresses that idea with either NOT EXISTS or a LEFT JOIN followed by a missing-match test.',
    mechanics: [
      { part: 'left population', title: 'Start with everything that may qualify', explanation: 'The outer query or left table defines the complete population you want to inspect.', why: 'Anti-join correctness starts by preserving every candidate before checking absence.', example: `FROM customers AS c` },
      { part: 'match condition', title: 'Define what counts as a match', explanation: 'The relationship and any qualifying status belong together. In a LEFT JOIN form, keep those predicates in ON.', why: '“No order” and “no completed order” are different business questions.', example: `ON o.customer_id = c.id AND o.status = 'completed'` },
      { part: 'missing test', title: 'Keep unmatched candidates', explanation: 'A LEFT JOIN fills right-side columns with NULL when no match exists, so a non-nullable right key can be tested with IS NULL.', why: 'It converts match absence into a filterable condition.', example: `WHERE o.id IS NULL` },
      { part: 'NOT EXISTS', title: 'State non-existence directly', explanation: 'The correlated subquery looks for at least one qualifying row. NOT EXISTS keeps the outer row only when none is found.', why: 'It avoids row multiplication and usually reads closest to the business rule.', example: `WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)` },
    ],
    useCases: [
      { title: 'Activation gaps', description: 'Users who registered but never completed activation.' },
      { title: 'Missing follow-ups', description: 'Cases, patients, or tickets without a required next action.' },
      { title: 'Catalog gaps', description: 'Products with no sales, reviews, or active supplier.' },
      { title: 'Reconciliation', description: 'Source records that never arrived in a target or settlement table.' },
      { title: 'Permission audits', description: 'Accounts lacking a required role or policy assignment.' },
    ],
    pitfalls: ['Putting a right-side qualifier in WHERE removes NULL-extended rows too early.', 'NOT IN can return no rows when its subquery contains NULL.', 'Testing a nullable right-side business column can confuse a real NULL with no match; test a non-nullable key.'],
  },
  'conditional-aggregation': {
    overview: 'Conditional aggregation calculates several metrics from the same grouped population by turning conditions into values that an aggregate can count or sum.',
    mechanics: [
      { part: 'CASE WHEN', title: 'Evaluate a condition per row', explanation: 'CASE returns a value for the first true WHEN branch. Each row is classified independently before aggregation.', why: 'It converts business categories into numeric or nullable inputs for an aggregate.', example: `CASE WHEN status = 'resolved' THEN 1 ELSE 0 END` },
      { part: 'SUM(CASE)', title: 'Count or total matching rows', explanation: 'Summing 1 for a match and 0 otherwise produces a count. Returning amount instead of 1 creates a conditional total.', why: 'Several segmented measures can share one scan and one grouping definition.', example: `SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END)` },
      { part: 'ELSE', title: 'Control the non-match value', explanation: 'ELSE 0 keeps arithmetic numeric. Omitting ELSE returns NULL, which aggregates usually ignore.', why: 'The choice affects whether an empty segment becomes zero or NULL.', example: `SUM(CASE WHEN refunded = 1 THEN amount ELSE 0 END)` },
      { part: 'denominator', title: 'Build rates from consistent populations', explanation: 'A conditional numerator can be divided by COUNT(*) or another conditional aggregate. Decimal arithmetic prevents integer truncation.', why: 'Rates are only meaningful when numerator and denominator use compatible populations.', example: `100.0 * SUM(CASE WHEN resolved = 1 THEN 1 ELSE 0 END) / COUNT(*)` },
    ],
    useCases: [
      { title: 'Operational scorecards', description: 'Show open, urgent, breached, and resolved counts side by side.' },
      { title: 'Conversion funnels', description: 'Count users reaching each milestone from the same cohort.' },
      { title: 'Financial reporting', description: 'Separate gross, refunded, discounted, and net amounts.' },
      { title: 'Quality monitoring', description: 'Calculate defect or failure rates by product line.' },
      { title: 'Pivot-style reports', description: 'Turn known category values into separate output columns.' },
    ],
    pitfalls: ['A missing ELSE can make a completely empty segment NULL instead of zero.', 'Integer division can turn a valid rate into zero.', 'Different CASE conditions may accidentally measure different populations.'],
  },
  'correlated-subqueries': {
    overview: 'A correlated subquery refers to the current row of an outer query. That outer value changes the inner query’s answer for each candidate row.',
    mechanics: [
      { part: 'outer query', title: 'Define the candidate row', explanation: 'The outer query supplies rows one at a time conceptually and gives its source a distinct alias.', why: 'The current outer row provides the context for each comparison.', example: `FROM products AS p` },
      { part: 'inner query', title: 'Calculate a context-specific value', explanation: 'The subquery computes an aggregate, existence test, or lookup using its own alias.', why: 'It produces a benchmark or answer tailored to the outer row.', example: `SELECT AVG(peer.price) FROM products AS peer` },
      { part: 'correlation', title: 'Connect inner context to outer context', explanation: 'A reference such as p.category inside the subquery is what makes it correlated.', why: 'Without the correlation, every outer row would be compared with the same global result.', example: `WHERE peer.category = p.category` },
      { part: 'subquery shape', title: 'Match the operator’s expectation', explanation: 'A scalar comparison needs at most one value. EXISTS only asks whether any row is returned and ignores selected values.', why: 'The expected shape determines whether the query is valid and efficient.', example: `p.price > (SELECT AVG(...))` },
    ],
    useCases: [
      { title: 'Peer comparisons', description: 'Compare a salary, price, or score with its own department or category.' },
      { title: 'Latest related record', description: 'Keep rows whose timestamp equals the maximum for their entity.' },
      { title: 'Existence rules', description: 'Require or exclude a related event without multiplying outer rows.' },
      { title: 'Thresholds by configuration', description: 'Compare each entity with a limit stored for its group.' },
      { title: 'Data validation', description: 'Find child rows that violate a parent-specific rule.' },
    ],
    pitfalls: ['Missing the correlation silently produces a global comparison.', 'A scalar subquery returning multiple rows causes an error or engine-specific behavior.', 'Repeated correlated work may be slower than a joined aggregate or window-function rewrite.'],
  },
  'recursive-ctes': {
    overview: 'A recursive CTE repeatedly feeds its own previous output into another query. It is designed for trees, graphs, and sequences whose depth is not known in advance.',
    mechanics: [
      { part: 'WITH RECURSIVE', title: 'Declare a self-referencing result', explanation: 'The CTE name becomes available inside its own definition after the anchor member.', why: 'It allows SQL to perform iterative traversal while still returning one relational result.', example: `WITH RECURSIVE reports AS (...)` },
      { part: 'anchor member', title: 'Seed the first generation', explanation: 'The non-recursive SELECT returns the starting rows: a root, direct reports, or an initial numeric value.', why: 'Every traversal needs an explicit, bounded starting point.', example: `SELECT id, manager_id, 1 AS depth FROM employees WHERE manager_id = 1` },
      { part: 'UNION ALL', title: 'Accumulate each generation', explanation: 'UNION ALL appends recursive results without deduplicating them. UNION can deduplicate but adds work and changes cycle behavior.', why: 'The operator combines the seed and every later iteration into the final CTE result.', example: `anchor_query UNION ALL recursive_query` },
      { part: 'recursive member', title: 'Find the next generation', explanation: 'The recursive SELECT joins source rows to rows already found and usually carries depth, path, or accumulated quantity forward.', why: 'This is the rule that moves traversal one edge at a time.', example: `JOIN reports r ON e.manager_id = r.id` },
      { part: 'termination', title: 'Guarantee that recursion stops', explanation: 'Traversal ends when an iteration returns no new rows. Graphs may need depth limits or visited-path checks to prevent cycles.', why: 'A cycle or non-progressing rule can run until the engine’s recursion limit.', example: `WHERE depth < 20 AND path NOT LIKE '%/' || e.id || '/%'` },
    ],
    useCases: [
      { title: 'Organization charts', description: 'Expand every direct and indirect report beneath a manager.' },
      { title: 'Bills of materials', description: 'Calculate nested components and multiplied quantities.' },
      { title: 'Category trees', description: 'Build breadcrumbs and find every descendant category.' },
      { title: 'Graph reachability', description: 'Discover connected nodes or possible routes.' },
      { title: 'Generated sequences', description: 'Create dates or numbers when a physical sequence table is unavailable.' },
    ],
    pitfalls: ['An incorrect join direction can return nothing or walk upward instead of downward.', 'Cycles require an explicit detection strategy.', 'UNION deduplication may hide a graph issue and can be significantly more expensive than UNION ALL.'],
  },
  'ranking-windows': {
    overview: 'A window function calculates across related rows while preserving one output row per input row. The function says what to calculate; OVER defines which rows are related and in what order.',
    mechanics: [
      { part: 'function()', title: 'Choose the analytical operation', explanation: 'ROW_NUMBER labels individual rows, RANK and DENSE_RANK handle peer groups, LAG/LEAD look sideways, and aggregate functions calculate over a window.', why: 'Different analytical questions require different treatment of ties, neighbors, and frames.', example: `DENSE_RANK()` },
      { part: 'OVER', title: 'Turn a function into a window calculation', explanation: 'OVER distinguishes a window invocation from an ordinary aggregate or scalar function. Empty OVER() uses the entire result population.', why: 'It preserves row-level detail instead of collapsing rows as GROUP BY would.', example: `SUM(revenue) OVER ()` },
      { part: 'PARTITION BY', title: 'Restart the calculation by group', explanation: 'Each distinct partition is processed independently. Omitting it creates one partition containing all rows.', why: 'It answers questions such as rank within quarter or running balance within account.', example: `PARTITION BY quarter` },
      { part: 'window ORDER BY', title: 'Define analytical sequence and peers', explanation: 'ORDER BY inside OVER controls ranking, previous/next rows, and frame progression. It does not necessarily sort the final displayed result.', why: 'Sequence is required for concepts such as first, previous, rank, and running total.', example: `ORDER BY revenue DESC` },
      { part: 'frame', title: 'Choose rows around the current row', explanation: 'ROWS counts physical rows, GROUPS counts peer groups, and RANGE uses ordered values. Boundaries such as UNBOUNDED PRECEDING and CURRENT ROW define the extent.', why: 'Frames distinguish a running total from a full-partition total or moving average.', example: `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` },
      { part: 'outer query', title: 'Filter after the window result exists', explanation: 'Window functions are calculated after WHERE. Put the window calculation in a CTE or subquery, then filter its alias outside.', why: 'A same-level WHERE cannot normally reference a newly calculated window result.', example: `WITH ranked AS (...) SELECT * FROM ranked WHERE revenue_rank <= 3` },
    ],
    useCases: [
      { title: 'Top-N per group', description: 'Rank products by category, reps by quarter, or accounts by month.' },
      { title: 'Running calculations', description: 'Compute balances, cumulative revenue, and year-to-date totals.' },
      { title: 'Period-over-period change', description: 'Use LAG to compare each month with the previous month.' },
      { title: 'Moving statistics', description: 'Calculate rolling averages, sums, minima, and maxima over a frame.' },
      { title: 'Percentiles and buckets', description: 'Locate relative standing or divide a population into quantiles.' },
      { title: 'Deduplication', description: 'Assign ROW_NUMBER per business key and keep the preferred record.' },
      { title: 'Session and gap analysis', description: 'Compare neighboring timestamps to detect breaks and islands.' },
      { title: 'Share of total', description: 'Divide a row’s value by a partition-wide SUM without losing detail.' },
    ],
    pitfalls: ['RANK leaves gaps after ties; DENSE_RANK does not; ROW_NUMBER breaks ties into separate numbers.', 'The ORDER BY inside OVER controls calculation order, while the final ORDER BY controls display order.', 'LAST_VALUE often surprises because the default frame may end at the current row; specify the full intended frame.', 'Filtering rows in WHERE before the window runs changes the population being analyzed.'],
    referenceTitle: 'Complete window-function reference',
    referenceIntro: 'SQLite provides 11 built-in window functions. In addition, every built-in aggregate can be used as a window function by adding OVER. The reference below covers the built-ins and the aggregate windows used most often in analytical SQL.',
    reference: [
      { category: 'Ranking', name: 'ROW_NUMBER()', purpose: 'Assign a unique consecutive number to every row. Use it for deterministic top-N selection or deduplication when ties must still become separate rows.', example: `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC, id DESC)` },
      { category: 'Ranking', name: 'RANK()', purpose: 'Give peers the same rank and leave gaps afterward. Use it for competition-style positions: 1, 2, 2, 4.', example: `RANK() OVER (ORDER BY score DESC)` },
      { category: 'Ranking', name: 'DENSE_RANK()', purpose: 'Give peers the same rank without gaps. Use it when the next distinct value should receive the next number: 1, 2, 2, 3.', example: `DENSE_RANK() OVER (PARTITION BY quarter ORDER BY revenue DESC)` },
      { category: 'Bucketing', name: 'NTILE(N)', purpose: 'Divide ordered rows into N groups as evenly as possible. Use it for quartiles, deciles, or workload bands.', example: `NTILE(4) OVER (ORDER BY lifetime_value DESC)` },
      { category: 'Distribution', name: 'PERCENT_RANK()', purpose: 'Return relative rank from 0.0 through 1.0 using (rank - 1) / (rows - 1). Use it to compare relative standing.', example: `PERCENT_RANK() OVER (ORDER BY response_time)` },
      { category: 'Distribution', name: 'CUME_DIST()', purpose: 'Return the fraction of partition rows less than or equal to the current peer group. Use it for cumulative distribution thresholds.', example: `CUME_DIST() OVER (ORDER BY score)` },
      { category: 'Offset', name: 'LAG(expr, offset, default)', purpose: 'Read a value from an earlier row in the partition. Use it for previous-period comparisons and gap detection.', example: `LAG(revenue, 1, 0) OVER (PARTITION BY account_id ORDER BY month)` },
      { category: 'Offset', name: 'LEAD(expr, offset, default)', purpose: 'Read a value from a later row in the partition. Use it to calculate time until the next event or build effective-date ranges.', example: `LEAD(event_at) OVER (PARTITION BY user_id ORDER BY event_at)` },
      { category: 'Frame value', name: 'FIRST_VALUE(expr)', purpose: 'Return the expression from the first row in the current frame. Use it to compare every row with a baseline.', example: `FIRST_VALUE(price) OVER (PARTITION BY sku ORDER BY observed_at)` },
      { category: 'Frame value', name: 'LAST_VALUE(expr)', purpose: 'Return the expression from the last row in the current frame. Specify a full frame when you mean the final partition value.', example: `LAST_VALUE(status) OVER (PARTITION BY order_id ORDER BY changed_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)` },
      { category: 'Frame value', name: 'NTH_VALUE(expr, N)', purpose: 'Return the expression from row N of the current frame, or NULL when it does not exist. Use it for a specific ordered benchmark.', example: `NTH_VALUE(score, 3) OVER (ORDER BY score DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)` },
      { category: 'Aggregate window', name: 'SUM(expr) OVER', purpose: 'Calculate partition totals, running totals, and rolling totals while retaining each row.', example: `SUM(amount) OVER (PARTITION BY account_id ORDER BY posted_at ROWS UNBOUNDED PRECEDING)` },
      { category: 'Aggregate window', name: 'AVG(expr) OVER', purpose: 'Calculate group or moving averages without collapsing the underlying observations.', example: `AVG(value) OVER (ORDER BY observed_at ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)` },
      { category: 'Aggregate window', name: 'COUNT(expr) OVER', purpose: 'Count rows or non-NULL values across a partition or moving frame.', example: `COUNT(*) OVER (PARTITION BY customer_id)` },
      { category: 'Aggregate window', name: 'MIN(expr) / MAX(expr) OVER', purpose: 'Compare each row with a partition or rolling minimum and maximum.', example: `MAX(revenue) OVER (PARTITION BY quarter) - revenue AS gap_to_leader` },
      { category: 'Aggregate window', name: 'GROUP_CONCAT(expr) OVER', purpose: 'Build a running or framed text list in SQLite.', example: `GROUP_CONCAT(event, ' > ') OVER (PARTITION BY session_id ORDER BY occurred_at)` },
    ],
  },
  'upserts': {
    overview: 'An upsert tries to insert a row and defines what to do when a uniqueness rule says that entity already exists. The constraint, not an arbitrary comparison, identifies the conflict.',
    mechanics: [
      { part: 'INSERT', title: 'Describe the incoming state', explanation: 'The VALUES row is the proposed new record. Several rows may be supplied in one statement.', why: 'The insert path handles entities that do not exist yet.', example: `INSERT INTO inventory (sku, stock) VALUES ('A', 4)` },
      { part: 'conflict target', title: 'Identify entity sameness', explanation: 'A primary key or unique index defines the column set that can conflict.', why: 'The database needs an enforced rule that determines whether the incoming row is new or existing.', example: `ON CONFLICT (sku)` },
      { part: 'DO UPDATE / DO NOTHING', title: 'Choose conflict behavior', explanation: 'DO NOTHING ignores the incoming conflict. DO UPDATE changes the existing row using a SET clause.', why: 'Different feeds require ignore, replace, accumulate, or merge semantics.', example: `DO UPDATE SET stock = inventory.stock + excluded.stock` },
      { part: 'excluded', title: 'Reference incoming values', explanation: 'In SQLite, excluded.column refers to the value that was proposed by the failed insert.', why: 'Merge logic often needs both current stored state and incoming state.', example: `updated_at = excluded.updated_at` },
    ],
    useCases: [
      { title: 'Inventory feeds', description: 'Insert new SKUs and update existing quantities.' },
      { title: 'Current-state snapshots', description: 'Keep one latest row per device, account, or external identifier.' },
      { title: 'Idempotent imports', description: 'Safely retry a batch without creating duplicate entities.' },
      { title: 'Counters and accumulators', description: 'Atomically add incoming totals to an existing row.' },
    ],
    pitfalls: ['The wrong unique key defines the wrong notion of identity.', 'Additive updates are not idempotent when a delivery is retried.', 'Replacing every column may overwrite newer local state with stale incoming values.'],
  },
  'atomic-transactions': {
    overview: 'A transaction creates a boundary around related statements. It controls whether partial work becomes visible and how concurrent operations interact with that work.',
    mechanics: [
      { part: 'BEGIN', title: 'Open the unit of work', explanation: 'BEGIN starts an explicit transaction so later statements share one commit or rollback decision.', why: 'Related changes must be treated as one operation rather than independent statements.', example: `BEGIN;` },
      { part: 'statements', title: 'Maintain an invariant', explanation: 'Each statement changes state inside the transaction. Constraints are checked according to engine rules, but changes are not finalized yet.', why: 'The sequence should move the database from one valid state to another.', example: `UPDATE accounts SET balance = balance - 25 WHERE id = 1;` },
      { part: 'COMMIT', title: 'Make successful work durable', explanation: 'COMMIT finalizes the transaction and makes its outcome visible according to the isolation model.', why: 'It marks the point after which the operation is considered successful.', example: `COMMIT;` },
      { part: 'ROLLBACK', title: 'Discard incomplete work', explanation: 'ROLLBACK undoes changes made since BEGIN. Applications normally invoke it after an error.', why: 'Failure should not leave half of a multi-step operation behind.', example: `ROLLBACK;` },
      { part: 'isolation', title: 'Control concurrent observations', explanation: 'Isolation levels determine which changes one transaction may observe from another and which anomalies are possible.', why: 'Correctness can fail even without errors when operations interleave unexpectedly.', example: `BEGIN IMMEDIATE; -- SQLite write reservation` },
    ],
    useCases: [
      { title: 'Money movement', description: 'Commit both debit and credit or neither.' },
      { title: 'Order placement', description: 'Create an order and reserve inventory as one unit.' },
      { title: 'Batch imports', description: 'Reject a whole batch when a required row is invalid.' },
      { title: 'Workflow transitions', description: 'Update state and append its audit event together.' },
      { title: 'Read consistency', description: 'Run a multi-query report against a consistent snapshot.' },
    ],
    pitfalls: ['Long transactions hold resources and increase contention.', 'Catching an error without rolling back can leave the connection in a failed transaction.', 'Reading, deciding, and later writing may need stronger isolation or an atomic conditional update.'],
  },
  'data-modeling-tables': {
    overview: 'Data modeling decides what facts the database should store, where each fact belongs, and how facts relate. CREATE TABLE turns that conceptual model into a physical contract the database can enforce.',
    mechanics: [
      { part: 'business model', title: 'Identify entities and events', explanation: 'Entities are things with continuing identity, such as customers and products. Events record something that happened, such as an order or payment. Relationships connect them.', why: 'Separating these roles prevents one table from becoming an ambiguous mixture of people, objects, and activity.', example: `customers, products, orders, order_items` },
      { part: 'table grain', title: 'State what one row represents', explanation: 'Grain is the precise meaning of one row. For orders it may be one customer purchase; for order_items it may be one product within one order.', why: 'Every column should describe the row at the same grain, otherwise values repeat and aggregates become unreliable.', example: `order_items: one row per order_id + product_id` },
      { part: 'CREATE TABLE', title: 'Translate the model into columns', explanation: 'Each column definition provides a name and data type, followed by optional rules such as NOT NULL or DEFAULT. Commas separate definitions inside the table body.', why: 'The schema becomes readable documentation and the shared write contract for every application.', example: `CREATE TABLE products (product_id INTEGER, name TEXT, price REAL);` },
      { part: 'PRIMARY KEY', title: 'Give every entity stable identity', explanation: 'A primary key uniquely identifies a row and cannot be NULL. A natural key has business meaning; a surrogate key is created specifically as an identifier.', why: 'Stable identity lets rows be referenced even when descriptive values such as names or emails change.', example: `customer_id INTEGER PRIMARY KEY` },
      { part: 'type / nullability / default', title: 'Define the allowed shape of each attribute', explanation: 'The type describes the value domain, NOT NULL decides whether absence is allowed, and DEFAULT supplies a value when an insert omits the column.', why: 'A deliberate column contract reduces ambiguous values and repeated fallback logic in applications.', example: `status TEXT NOT NULL DEFAULT 'pending'` },
      { part: 'FOREIGN KEY', title: 'Represent cardinality through keys', explanation: 'For one-to-many, place the parent key on the many side. For many-to-many, create a junction table with one foreign key to each parent.', why: 'Foreign keys document relationships and can prevent child rows from pointing at entities that do not exist.', example: `customer_id INTEGER REFERENCES customers(customer_id)` },
      { part: 'normalization', title: 'Store each fact in one appropriate place', explanation: 'First normal form favors atomic values and no repeating column groups. Further normalization separates facts that depend on different keys.', why: 'Storing a customer email on every order creates update anomalies when one copy changes and others do not.', example: `orders.customer_id -> customers.email` },
    ],
    useCases: [
      { title: 'New application schema', description: 'Turn product requirements into entities, events, relationships, and enforceable tables.' },
      { title: 'Spreadsheet migration', description: 'Separate repeated customer, product, and transaction facts before loading them into a database.' },
      { title: 'Order systems', description: 'Model customers, orders, products, and line items at distinct grains.' },
      { title: 'Membership systems', description: 'Represent many users belonging to many teams through a junction table.' },
      { title: 'Data-quality repair', description: 'Add identities and relationships so duplicates and orphaned records are easier to detect.' },
    ],
    pitfalls: ['Using a changing value such as a name as the only row identity makes relationships fragile.', 'Storing comma-separated lists in one column hides a many-valued relationship from SQL.', 'Copying customer or product facts into every transaction creates update anomalies.', 'Allowing NULL by default can make required business facts silently optional.', 'A foreign key expresses a relationship but does not replace thoughtful delete and update behavior.'],
    referenceTitle: 'Table-design building blocks',
    referenceIntro: 'Use these SQL elements to translate the conceptual model into a table definition.',
    reference: [
      { category: 'Statement', name: 'CREATE TABLE', purpose: 'Create a named table and define its columns and table-level rules.', example: `CREATE TABLE customers (...);` },
      { category: 'Identity', name: 'PRIMARY KEY', purpose: 'Uniquely identify every row using one column or a column combination.', example: `PRIMARY KEY (order_id, product_id)` },
      { category: 'Relationship', name: 'FOREIGN KEY / REFERENCES', purpose: 'Require a child key to point to an existing parent key.', example: `customer_id INTEGER REFERENCES customers(customer_id)` },
      { category: 'Presence', name: 'NOT NULL', purpose: 'Reject rows that omit a required attribute.', example: `email TEXT NOT NULL` },
      { category: 'Fallback', name: 'DEFAULT', purpose: 'Supply a value when an INSERT does not provide the column.', example: `status TEXT DEFAULT 'pending'` },
      { category: 'Domain', name: 'CHECK', purpose: 'Reject a row when a Boolean rule is not true.', example: `quantity INTEGER CHECK (quantity > 0)` },
      { category: 'Identity', name: 'UNIQUE', purpose: 'Prevent duplicate values for another candidate key.', example: `email TEXT UNIQUE` },
      { category: 'Type', name: 'INTEGER / REAL / TEXT', purpose: 'Describe the intended value domain and storage behavior for a column.', example: `price REAL NOT NULL` },
    ],
  },
  'indexes-constraints': {
    overview: 'Schema design defines what each row represents and which states are valid. Constraints protect meaning; indexes organize access paths and may also enforce uniqueness.',
    mechanics: [
      { part: 'table grain', title: 'Define what one row means', explanation: 'A table should represent one entity or relationship at a clear grain, with attributes depending on its key.', why: 'Unclear grain causes duplicates, contradictory facts, and incorrect aggregates.', example: `order_items: one row per order and product` },
      { part: 'PRIMARY KEY / UNIQUE', title: 'Protect identity', explanation: 'A primary key identifies each row. Additional unique constraints protect other candidate keys.', why: 'Identity rules must hold across every writer, including concurrent ones.', example: `email TEXT UNIQUE` },
      { part: 'FOREIGN KEY', title: 'Protect relationships', explanation: 'A foreign key requires referenced values to exist and can define update or delete behavior.', why: 'It prevents orphaned child records and documents table relationships.', example: `customer_id INTEGER REFERENCES customers(id)` },
      { part: 'NOT NULL / CHECK', title: 'Protect attribute rules', explanation: 'NOT NULL requires a value; CHECK evaluates a row-level condition for inserted or updated data.', why: 'Invalid states are rejected at the shared data boundary.', example: `quantity INTEGER NOT NULL CHECK (quantity > 0)` },
      { part: 'INDEX', title: 'Create a searchable ordering', explanation: 'An index stores selected keys in an order the optimizer can use for lookup, joining, sorting, or uniqueness.', why: 'It can avoid scanning every row, at the cost of storage and write maintenance.', example: `CREATE INDEX orders_customer_date ON orders(customer_id, created_at)` },
    ],
    useCases: [
      { title: 'Entity integrity', description: 'Guarantee stable customer, order, and product identities.' },
      { title: 'Relationship integrity', description: 'Prevent orphaned payments, line items, and memberships.' },
      { title: 'Domain validation', description: 'Reject negative quantities or invalid status combinations.' },
      { title: 'Fast lookup', description: 'Accelerate selective filters and join keys.' },
      { title: 'Normalization', description: 'Store each fact once and reference it rather than copying it.' },
    ],
    pitfalls: ['An index does not replace a constraint unless it is explicitly unique.', 'Column order matters in a composite index.', 'Too many indexes consume space and slow inserts, updates, and deletes.'],
  },
  'views': {
    overview: 'A view gives a query a durable name and column interface. A regular view stores the definition, while materialization stores results that must be refreshed.',
    mechanics: [
      { part: 'CREATE VIEW', title: 'Name a reusable query', explanation: 'The database stores the SELECT definition in the schema. Querying the view expands or plans that definition.', why: 'Consumers can depend on a stable, meaningful interface instead of repeating complex SQL.', example: `CREATE VIEW customer_revenue AS SELECT ...` },
      { part: 'explicit columns', title: 'Define the interface', explanation: 'The selected names and types become the view’s public columns. SELECT * can make them change unexpectedly.', why: 'A widely used view should be treated like an API contract.', example: `SELECT customer_id, SUM(amount) AS revenue` },
      { part: 'security boundary', title: 'Expose only approved data', explanation: 'Database permissions may allow access to a view while denying direct access to underlying tables.', why: 'A view can hide sensitive columns or enforce approved row filters.', example: `CREATE VIEW support_accounts AS SELECT id, status FROM accounts` },
      { part: 'materialization', title: 'Trade freshness for read speed', explanation: 'A materialized view stores query output and requires a refresh strategy. SQLite does not provide native materialized views, but summary tables can serve the pattern.', why: 'Expensive, frequently read summaries may not need real-time freshness.', example: `REFRESH MATERIALIZED VIEW monthly_revenue;` },
    ],
    useCases: [
      { title: 'Shared metrics', description: 'Publish one approved definition of revenue or active users.' },
      { title: 'Security filtering', description: 'Hide sensitive columns and rows from limited roles.' },
      { title: 'Compatibility layers', description: 'Preserve an old interface while underlying tables evolve.' },
      { title: 'Simplified analysis', description: 'Wrap complex joins and calculations for downstream users.' },
      { title: 'Cached summaries', description: 'Materialize costly aggregations when controlled staleness is acceptable.' },
    ],
    pitfalls: ['Views can hide expensive joins behind a simple name.', 'Changing view columns can break downstream consumers.', 'Materialized results need an explicit refresh and freshness policy.'],
  },
  'exists-rewrites': {
    overview: 'Performance work starts by expressing the correct question, then using the query plan and measurements to see how the engine answers it. Indexes and rewrites reduce unnecessary row access.',
    mechanics: [
      { part: 'EXPLAIN QUERY PLAN', title: 'Inspect the access strategy', explanation: 'The plan reveals scans, index searches, join order, and temporary sorting decisions.', why: 'It replaces guesses with evidence about how the optimizer intends to execute the query.', example: `EXPLAIN QUERY PLAN SELECT ...` },
      { part: 'scan vs search', title: 'Recognize broad and selective access', explanation: 'A scan visits a table or index broadly. A search uses constraints to reach a smaller range of entries.', why: 'Large avoidable scans are common sources of latency and resource use.', example: `SEARCH orders USING INDEX orders_customer_id (customer_id=?)` },
      { part: 'composite index', title: 'Match the access pattern', explanation: 'A composite index is ordered first by its leading column, then the next. Equality prefixes can be followed by a range or ordering column.', why: 'Correct column order can support filtering, joining, and ordering with one structure.', example: `INDEX ON events(account_id, occurred_at)` },
      { part: 'EXISTS', title: 'Express a semi-join', explanation: 'EXISTS only needs proof of one match and preserves one outer row. A regular join may produce several outer copies.', why: 'It matches yes-or-no relationship questions and may stop searching after the first match.', example: `WHERE EXISTS (SELECT 1 FROM shipments s WHERE s.warehouse_id = w.id)` },
      { part: 'sargability', title: 'Keep indexed columns searchable', explanation: 'A direct comparison with an indexed column is easier to use than wrapping that column in a function or calculation.', why: 'Searchable predicates let the engine navigate an index instead of computing against every row.', example: `created_at >= '2026-01-01'` },
    ],
    useCases: [
      { title: 'Slow-query diagnosis', description: 'Identify high-cost scans, sorts, and join multiplication.' },
      { title: 'Index design', description: 'Create indexes around measured filters, joins, and ordering.' },
      { title: 'Existence checks', description: 'Replace duplicate-producing joins with EXISTS.' },
      { title: 'Pagination', description: 'Use indexed keyset boundaries instead of deep OFFSET scans.' },
      { title: 'Query rewrites', description: 'Reduce rows earlier or pre-aggregate before joining.' },
    ],
    pitfalls: ['A plan estimate is not a substitute for measuring representative data.', 'An index that helps reads still costs storage and write time.', 'Rewriting for speed before proving correctness can optimize the wrong answer.'],
  },
  'triggers-routines': {
    overview: 'Database-side programs run close to the data. Triggers react automatically to events; stored routines run when explicitly called. Both centralize behavior but make it less visible to application code.',
    mechanics: [
      { part: 'timing', title: 'Choose when the trigger runs', explanation: 'BEFORE runs prior to the change, AFTER runs after it succeeds, and some engines support INSTEAD OF for views.', why: 'Validation, transformation, and audit behavior need different timing.', example: `AFTER UPDATE OF stock ON inventory` },
      { part: 'event', title: 'Choose what activates it', explanation: 'INSERT, UPDATE, or DELETE events activate the trigger. UPDATE may be narrowed to specific columns.', why: 'A narrow event avoids unrelated writes causing side effects.', example: `AFTER UPDATE OF stock` },
      { part: 'OLD / NEW', title: 'Read before-and-after row state', explanation: 'OLD represents the previous row for update/delete; NEW represents the proposed or stored row for insert/update.', why: 'Auditing and derived changes need both versions.', example: `VALUES (NEW.sku, OLD.stock, NEW.stock)` },
      { part: 'trigger body', title: 'Execute the automatic side effect', explanation: 'The body runs SQL statements when the event occurs. SQLite triggers run for each affected row.', why: 'It enforces behavior for every writer, not just one application path.', example: `BEGIN INSERT INTO inventory_audit ...; END` },
      { part: 'stored routine', title: 'Expose an explicit database operation', explanation: 'A procedure or function accepts parameters and packages statements, control flow, and privileges. Support and syntax vary by database.', why: 'Complex privileged operations can have one controlled entry point.', example: `CALL close_accounting_period(:period_end)` },
    ],
    useCases: [
      { title: 'Audit history', description: 'Record sensitive before-and-after changes consistently.' },
      { title: 'Derived maintenance', description: 'Maintain related summary or search rows after writes.' },
      { title: 'Cross-writer validation', description: 'Apply a rule regardless of which application changes data.' },
      { title: 'Privileged operations', description: 'Grant callers access to a controlled routine instead of broad tables.' },
      { title: 'Batch processing', description: 'Package data-intensive, server-local work behind parameters.' },
    ],
    pitfalls: ['Triggers create hidden work that can surprise callers and complicate debugging.', 'Trigger chains can recurse or amplify one write into many.', 'Large business workflows in triggers become tightly coupled to one database.'],
  },
  'revenue-capstone': {
    overview: 'A reliable analytical query is built in stages. Each stage should have a named meaning, a defined grain, and checks that prove it before the next transformation uses it.',
    mechanics: [
      { part: 'business question', title: 'Define the output precisely', explanation: 'State the dimensions, measures, filters, tie behavior, and time grain before writing SQL.', why: 'Ambiguous requirements lead to technically valid but commercially wrong queries.', example: `one row per month and top-ranked account; paid invoices only; include ties` },
      { part: 'base population', title: 'Filter authoritative input rows', explanation: 'The earliest stage chooses valid source records and excludes void, test, or out-of-period events.', why: 'Every downstream metric depends on the population definition.', example: `WHERE status = 'paid'` },
      { part: 'aggregation grain', title: 'Create one row per analytical entity', explanation: 'Aggregate raw events to month and account before ranking. Inspect uniqueness at this boundary.', why: 'Ranking raw invoices would rank transactions rather than accounts.', example: `GROUP BY month, account` },
      { part: 'analytical stage', title: 'Apply windows to the prepared grain', explanation: 'Window functions compare the already aggregated rows within each month.', why: 'Separating aggregation and ranking makes both the logic and debugging clearer.', example: `DENSE_RANK() OVER (PARTITION BY month ORDER BY revenue DESC)` },
      { part: 'final contract', title: 'Filter and present the result', explanation: 'The outer query selects required columns, applies the rank filter, and defines deterministic display order.', why: 'A clear final interface is easier to validate and reuse.', example: `WHERE revenue_rank = 1 ORDER BY month, account` },
    ],
    useCases: [
      { title: 'Executive reporting', description: 'Combine approved filters, metrics, and rankings into an explainable result.' },
      { title: 'Customer health', description: 'Stage activity, revenue, support, and trend signals before scoring accounts.' },
      { title: 'Cohort analysis', description: 'Establish cohort grain, calculate periods, and compare retention.' },
      { title: 'Anomaly investigations', description: 'Build auditable stages from raw events to suspicious entities.' },
      { title: 'Reusable data models', description: 'Turn validated CTE stages into views or transformation models.' },
    ],
    pitfalls: ['Mixing grains causes duplicated measures and misleading ranks.', 'A CTE name such as temp1 explains syntax rather than business meaning.', 'Skipping intermediate validation makes errors harder to locate.'],
  },
}

export function getDeepDive(lessonId: string): LessonDeepDive {
  return deepDives[lessonId]
}
