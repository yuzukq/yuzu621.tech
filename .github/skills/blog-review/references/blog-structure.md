# Blog Structure

This Next.js portfolio + blog project manages blog posts as Markdown files in the `_posts/` directory.

## Frontmatter Format

All blog posts must include YAML frontmatter with the following fields:

```yaml
---
slug: unique-post-identifier
title: Post Title
date: YYYY-MM-DD
description: Brief post description
tags:
  - Tag1
  - Tag2
thumbnail: /images/blog/YYYYMMDD/filename.png
category: tech | daily
---
```

### Required Fields

- **slug**: Unique identifier for the post URL
- **title**: Display title of the post
- **date**: Publication date
- **description**: Summary shown in post listings
- **tags**: Array of relevant tags
- **thumbnail**: Path to the featured image
- **category**: Must be either `tech` or `daily`

## Categories

### tech
Technical blog posts covering programming, software development, research, and other tech topics. These should be written in a professional, informative style suitable for a tech blog audience.

### daily
Personal journal-style posts covering hobbies, daily life, and non-technical topics. These allow more creative freedom but should still maintain basic quality standards for public consumption.

## File Structure

```
_posts/
  ├── post-name.md
  └── ...
public/
  └── images/
      └── blog/
          └── YYYYMMDD/
              └── *.png
```

Blog post images are stored in `/public/images/blog/` organized by date folders.
