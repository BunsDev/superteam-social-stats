
# Superteam Games 

Welcome to the Superteam Games repository. This repository contains scripts to fetch and handle data from various platforms like Discord, Twitter, and YouTube.

## Repository Structure

- **.github/workflows/main.yml**: Contains the GitHub Actions workflow configuration.
- **discordMembers.ts**: Script related to Discord members.
- **twitterFollowers.ts**: Script related to Twitter followers.
- **ytSubs.ts**: Script related to YouTube subscribers.
- Other configuration and setup files: `.gitignore`, `package-lock.json`, `package.json`, and `tsconfig.json`.

## Setting Up

1. Clone the repository:

```bash
git clone https://github.com/akshatcoder-hash/superteam-games.git
```


2. Navigate to the project directory:

```bash
cd superteam-games
```


3. Install the required dependencies:

```bash
npm install
```


## Adding More Scripts to the Workflow

1. Create your script, for example, `myNewScript.ts`.
2. Open `.github/workflows/main.yml`.
3. Under the `jobs` section, add a new job or modify an existing one to run your script:

```yaml
jobs:
  my_new_job:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v2
    - name: Run my new script
      run: ts-node myNewScript.ts
```


## Modifying Environment Variables in GitHub Actions

1. Go to your repository on GitHub.
2. Click on the `Settings` tab.
3. In the left sidebar, click on `Secrets`.
4. Here, you can add new secrets or update existing ones. These secrets can be used as environment variables in your GitHub Actions workflow.
5. In your `.github/workflows/main.yml`, you can reference these secrets using the following syntax:

```yaml
env:
  MY_SECRET: ${{ secrets.MY_SECRET_NAME }}
```


