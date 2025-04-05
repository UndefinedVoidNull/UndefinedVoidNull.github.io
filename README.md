# Blog
- https://UndefinedVoidNull.github.io
- https://quarto.org/docs/publishing/github-pages.html

## Command
```bash
quarto create project # choose blog

quarto render

quarto preview # most of time should use VSCode build-in markdown preview 
quarto preview --port 3000

quarto publish gh-pages # it will render before publish
quarto publish gh-pages --no-prompt # don't prompt with y/n
```

## Pandoc Markdown Syntax
If a paragraph followed by a list/quotation/table,
then it's **required to have a empty line between paragraph and list/quotation/table.**
Otherwise, list/quotation/table can not be properly rendered.

## .qmd yaml metadata example
```yaml
---
title: "xxx"
author: "xxx"
date: "2025-01-01"
categories: [News, Code, Analysis]
image: "image.jpg"
toc: true
number-sections: true
---
```

## VSCode Snippets
Make sure disable or uninstall the Quarto VSCode extension.

### Change Language Mode
- Open a .qmd Document 
- Select Language Mode
- Configure File Association for '.qmd'
- Choose `Markdown`
