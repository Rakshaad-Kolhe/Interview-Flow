# Git Workflow & Contribution Guide

This document outlines the standard Git workflow for contributing to the InterviewFlow repository.

## 1. Branch Naming Strategy
- **`main`**: The primary, stable branch reflecting production code.
- **`feat/`**: New feature development (e.g., `feat/advanced-js-file-upload`).
- **`fix/`**: Bug fixes (e.g., `fix/auth-cookie-issue`).
- **`docs/`**: Documentation updates.
- **`chore/`**: Maintenance tasks, dependencies.

## 2. Development Workflow
1. **Branch Creation**: Always create a new branch from the latest `main`.
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/your-feature-name
   ```
2. **Feature Development**: Commit your changes frequently. Use atomic, meaningful commits.
3. **Commits**: Follow conventional commits (e.g., `feat: add file upload feature`, `fix: handle LLM timeout`).
4. **Pull Requests**:
   - Push your branch to the remote repository.
   - Open a PR against `main`.
   - Ensure all checks (linting, tests) pass before merging.
5. **Merging**:
   - Resolve any merge conflicts locally by pulling `main` into your feature branch.
   - Squash and merge PRs to keep the `main` history clean.
6. **Keeping Synchronized**: Regularly sync your feature branch with `main` to avoid large merge conflicts.
   ```bash
   git fetch origin
   git rebase origin/main
   ```
