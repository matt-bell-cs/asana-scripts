# Asana Task Updater

This GitHub Action automatically updates Asana tasks based on branch and commit data

## Features

- Updates Asana task status to "In Progress" when a branch is pushed
- Moves Asana task to "Code Review" when a pull request is opened
- Moves Asana task to "Code Review" when a pull request is closed
- Extracts Asana task IDs from branch names and commit messages

## Usage

To use this action in your GitHub workflow, follow these steps:

1. Create a new workflow file (e.g., `.github/workflows/asana-task-updater.yml`) in your repository.

2. Add the following code to your workflow file:

```yaml
name: Asana Task Update

on:
  push:
    branches:
      - '*'
  pull_request:
    types: [opened, closed]

jobs:
  update_asana_task:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Update Asana task
        uses: matt-bell-cs/asana-scripts@v0.0.2
        with:
          asana-access-token: ${{ secrets.ASANA_ACCESS_TOKEN }}
          asana-workspace-id: ${{ secrets.CULTURE_SUITE_ASANA_WORKSPACE_ID }}
          branch: ${{ github.ref }}
          commit: ${{ github.event.head_commit.message }}
          ticket-section: ${{ github.event.action == 'opened' && 'code review' || github.event.action == 'closed' && 'complete' || 'in progress' }}
```

<!-- @todo running the app, bundling a new release -->
