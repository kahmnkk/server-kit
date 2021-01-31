# Nodejs Server-Kit

Nodejs server starter kit

## Includes

-   express
-   socket-io
-   mysql
-   redis
-   log service

## Installation

Yarn package manager recommended

```
npm install -g yarn
```

Install project dependencies

```
yarn install
```

## Usage

Run server you want - package.json scripts

```
yarn api
```

## Hierarchy

```
server-kit
├── .prettierrc                 # Configurations for VSCode prettier
├── config                      # Application configurations
├── definePrototype             # Javascript Prototype definition
├── jsconfig                    # Configurations for VSCode intellisense
├── node_modules/
└── src/
    ├── errors                  # Errors definition
    ├── index                   # Server start point
    ├── querys                  # Querys definition
    ├── api/                    # Session Manager && Routers
    ├── database/               # DB Manager && MySQL && Redis
    ├── service/
    │   └── apiService          # Express Server Service
    └── utils/
        ├── logger              # Log Service - using winston module
        ├── time                # Codes related with Time
        └── utils               # Codes for Convenience
```

## VS Code Prettier Setting

-   Search 'Prettier - Code formatter' in VS Code Extension
-   Go to VS Code Setting(ctrl + ,)
-   Set Default Formatter to 'prettier-vscode'
-   Check 'Format On Save'
