# Angular Migration Project - How to Run

## Overview
This project contains two applications side-by-side:
- angularjs2/ - Reference AngularJS application (TM-CRM_ERP)
- angular20/ - New Angular 20 demo application

## Running the Applications

### 1. AngularJS Reference Application

Open Git Bash in the angularjs2 folder and run:
```
./start.sh
```

### 2. Angular 20 Demo Application

1. Open the project-angular-migration folder in VS Code DevContainer
2. Once inside the DevContainer, open a terminal
3. Navigate to the angular20 folder:
   ```
   cd angular20
   ```
4. Run the development server:
   ```
   ./start-dev-server.sh
   ```

## Notes
- The AngularJS application runs outside the DevContainer
- The Angular 20 application runs inside the DevContainer
- Both applications share the same backend (Total.js)
