---
name: dev-log
description: Document development work and save it to Notion database. Use when the user completes a feature or change and wants to create a comprehensive development log including Git branch differences, discussion points from chat history, implementation details and code flows, and changed files with diffs. Automatically generates markdown documentation and saves it to the specified Notion database with proper metadata.
---

# Development Log Documentation

## Overview

This skill helps document completed development work by analyzing git changes, extracting discussion points, and creating comprehensive markdown documentation that is automatically saved to a Notion database.

## Workflow

When the user requests to document their work:

1. **Identify the branch context**
   - Determine current branch
   - Identify base branch (usually `main` or `develop`)
   - Get repository name from the workspace

2. **Collect git changes**
   - Get list of changed files using `get_changed_files` tool
   - Generate diffs between current branch and base branch
   - Organize changes by file

3. **Extract discussion points**
   - Review recent conversation history
   - Identify key technical decisions
   - Note important discussion points and considerations

4. **Generate documentation**
   - Use the template structure from `references/template.md`
   - Create comprehensive markdown with:
     - Summary of feature/change
     - Background and motivation
     - Detailed change descriptions per file
     - Implementation flow and architecture
     - Discussion points and technical decisions
     - Changed files list with diffs

5. **Save to Notion**
   - Use Notion MCP to create a new page in the database
   - Set properties:
     - 機能/作業内容: Concise summary title
     - リポジトリ: Repository name (select property)
     - 実装日時: Current date
   - Save markdown content to the page

## Notion Database Configuration

**Database URL:** https://www.notion.so/2e71989ac26480b0b299f80e15c8fef1

**Properties:**
- `機能/作業内容` (title): Concise one-line summary of the feature/change
- `リポジトリ` (select): Repository name (e.g., "yuzu621.tech")
- `実装日時` (date): Implementation date

## Documentation Structure

The generated documentation should follow this structure (based on PR template but without Copilot/review instructions):

- **概要**: Brief summary of the feature/change
- **背景・動機**: Background and motivation in bullet points
- **変更内容**: Detailed changes organized by logical groups
  - Each group includes file-level changes with descriptions
- **URL構造**: URL structure changes (if applicable)
- **新規追加ファイル**: List of new files added
- **技術的な判断**: Technical decisions and considerations
- **実装の流れ**: Implementation flow and architecture explanation
- **議論のポイント**: Key discussion points from chat history

## Example Usage

User: "作業が完了したので、開発ログをNotionに保存してください"

The skill will:
1. Check current git status and branch
2. Get diffs from base branch
3. Analyze conversation for discussion points
4. Generate comprehensive markdown documentation
5. Create Notion page with proper metadata

## Resources

### references/template.md
Detailed documentation template structure matching the PR template format but focused on development logging rather than review instructions.
