# Test Report

Date: 2025-12-13
Environment: Node.js 18.x, SQLite (sql.js, file-backed), Windows 11

Commands executed:
```powershell
cd "c:\Users\hp\Desktop\Suhana Project\backend"
npm install
npm run db:migrate
npm run db:seed
npm test -- --coverage
```

Captured output:
```
 PASS  tests/auth.test.ts
 PASS  tests/sweets.test.ts

Test Suites: 2 passed, 2 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        4.12 s, estimated 5 s
Ran all test suites.
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |   96.15 |    90.47 |   94.44 |   96.05 |                   
----------|---------|----------|---------|---------|-------------------
```

Re-run instructions:
1. Ensure `backend/.env` points to a writable SQLite database path (defaults to `./data/sweetshop.db`).
2. Execute the commands above; the coverage summary will be regenerated under `backend/coverage/`.
