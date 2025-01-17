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

### Configure Snippets
`markdown.json`
```json
{
	// Place your snippets for markdown here. Each snippet is defined under a snippet name and has a prefix, body and 
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:
	// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. Placeholders with the 
	// same ids are connected.
	// Example:
	// "drawbacks template": {
	// 	"prefix": "db",
	// 	"body": [
	// 		"内容: $1",
	// 		"高发期: $2",
	// 		"危害程度: $3",
	// 		"危害处: $4",
	// 		"原因: $5",
	// 		"解决方案: $0"
	// 	],
	// 	"description": "drawbacks template"
	// },
	"h2": {
		"prefix": "h2",
		"body": "## "
	},
	"h3": {
		"prefix": "h3",
		"body": "### "
	},
	"h4": {
		"prefix": "h4",
		"body": "#### "
	},
	"h5": {
		"prefix": "h5",
		"body": "##### "
	},
	"h6": {
		"prefix": "h6",
		"body": "###### "
	},
	"qmd": {
		"prefix": "qmd",
		"body": [
			"---",
			"title: \"$1\"",
			"date: \"2025-$2-$3\"",
			"categories: [$4]",
			"---",
			"",
			"$5"
		],
		"description": ".qmd metadata"
	},
	"$$align*": {
		"prefix": "math",
		"body": [
			"$$",
			"\\begin{align*}",
			"$1",
			"\\end{align*}",
			"$$",
			"",
		]
	},
	"m": {
		"prefix": "m",
		"body": [
			"$$",
			"\\begin{align*}",
			"$1",
			"\\end{align*}",
			"$$",
			"",
		]
	},
	"c": {
		"prefix": "c",
		"body": [
			"```$1",
			"$0",
			"```"
		],
	},
	"code area": {
		"prefix": "code",
		"body": [
			"```$1",
			"$0",
			"```"
		],
	},
	"js": {
		"prefix": "js",
		"body": [
			"```js",
			"$0",
			"```"
		],
	},
	"json": {
		"prefix": "json",
		"body": [
			"```json",
			"$0",
			"```"
		],
	},
	"yaml": {
		"prefix": "yaml",
		"body": [
			"```yaml",
			"$0",
			"```"
		],
	},
	"py": {
		"prefix": "py",
		"body": [
			"```python",
			"$0",
			"```"
		],
	},
	"bash": {
		"prefix": "bash",
		"body": [
			"```bash",
			"$0",
			"```"
		],
	},
	"pwsh": {
		"prefix": "pwsh",
		"body": [
			"```pwsh",
			"$0",
			"```"
		],
	},
	"thm": {
		"prefix": "\\thm",
		"body": [
			"**Theorem:** ($1)",
			"$$",
			"\\begin{align*}",
			"$2",
			"\\end{align*}",
			"$$"
		],
	},
	"def": {
		"prefix": "def",
		"body": [
			"**Definition:** ($1)",
			"$$",
			"\\begin{align*}",
			"$2",
			"\\end{align*}",
			"$$"
		],
	},
	"proof": {
		"prefix": "proof",
		"body": [
			"**Proof:** ",
			"$$",
			"\\begin{align*}",
			"$1",
			"\\end{align*}",
			"$$"
		],
	},
	"remark": {
		"prefix": "\\rem",
		"body": [
			"**Remark:** $1",
		],
	},
	"link": {
		"prefix": "link",
		"body": [
			"[${1:text}](${2:url})$0",
		],
	},
	"table": {
		"prefix": "table",
		"body": [
			"| $1  | $2  | $3  |",
			"| --- | --- | --- |",
			"| $4  | $5  | $6  |",
			"| $7  | $8  | $9  |",
		],
	},
}
```

`latex.json`
```json
{
	"f": {
		"prefix": "\\f",
		"body": [
			"\\frac{$1}{$2} ",
		]
	},
	"align*": {
		"prefix": "align",
		"body": [
			"\\begin{align*}",
			"$1",
			"\\end{align*}",
		]
	},
	"R": {
		"prefix": "\\R",
		"body": [
			"\\mathbb{R} ",
		]
	},
	"Z": {
		"prefix": "\\Z",
		"body": [
			"\\mathbb{Z} ",
		]
	},
	"N": {
		"prefix": "\\N",
		"body": [
			"\\mathbb{N} ",
		]
	},
	"Q": {
		"prefix": "\\Q",
		"body": [
			"\\mathbb{Q} ",
		]
	},
	"C": {
		"prefix": "\\C",
		"body": [
			"\\mathbb{C} ",
		]
	},
	"union": {
		"prefix": "\\union",
		"body": [
			"\\cup ",
		]
	},
	"sect": {
		"prefix": "\\sect",
		"body": [
			"\\cap ",
		]
	},
	"intersect": {
		"prefix": "\\intersect",
		"body": [
			"\\cap ",
		]
	},
	"set": {
		"prefix": "\\set",
		"body": [
			"\\\\{$1 \\mid $2 \\\\} ",
		]
	},
	"de": {
		"prefix": "\\de",
		"body": [
			"\\frac{d$1}{d${2:x}} ",
		]
	},
	"pde": {
		"prefix": "\\pde",
		"body": [
			"\\frac{\\partial $1}{\\partial ${2:x}} ",
		]
	},
	"partial": {
		"prefix": "\\partial",
		"body": [
			"\\frac{\\partial $1}{\\partial ${2:x}} ",
		]
	},
	"int": {
		"prefix": "\\int",
		"body": [
			"\\int_{$1}^{$2} $3 \\, d${4:x} ",
		]
	},
	"lim": {
		"prefix": "\\lim",
		"body": [
			"\\lim_{$1 \\to $2} ",
		]
	},
	"inf": {
		"prefix": "\\inf",
		"body": [
			"\\infty ",
		]
	},
	"sum": {
		"prefix": "\\sum",
		"body": [
			"\\sum_{$1}^{$2}$3 ",
		]
	},
	"prod": {
		"prefix": "\\prod",
		"body": [
			"\\prod_{$1}^{$2}$3 ",
		]
	},
	"vec": {
		"prefix": "\\vec",
		"body": [
			"\\vec{${1:x}} ",
		]
	},
	"row vec": {
		"prefix": "\\rowvec",
		"body": [
			"\\begin{bmatrix}",
			"${1:1} & 2 & 3",
			"\\end{bmatrix}",
		]
	},
	"col vec": {
		"prefix": "\\colvec",
		"body": [
			"\\begin{bmatrix}",
			"${1:1} \\\\\\",
			"2 \\\\\\",
			"3 \\\\\\",
			"\\end{bmatrix}",
		]
	},
	"matrix": {
		"prefix": "\\matrix",
		"body": [
			"\\begin{bmatrix}",
			"${1:1} & 2 & 3 \\\\\\",
			"4 & 5 & 6 \\\\\\",
			"7 & 8 & 9 \\\\\\",
			"\\end{bmatrix}",
		]
	},
	"sqrt": {
		"prefix": "\\sqrt",
		"body": [
			"\\sqrt{$0} ",
		]
	},
	"choose": {
		"prefix": "\\choose",
		"body": [
			"\\binom{${1:n}}{${2:k}} ",
		]
	},
	"text": {
		"prefix": "\\text",
		"body": [
			"\\text{$1}",
		]
	},
	"subset": {
		"prefix": "\\subset",
		"body": [
			"\\subseteq ",
		]
	},
	"set minus": {
		"prefix": "\\minus",
		"body": [
			"\\setminus ",
		]
	},
	"space": {
		"prefix": "\\space",
		"body": [
			"\\quad ",
		]
	},
	"piecewise": {
		"prefix": "\\piecewise",
		"body": [
			"\\begin{cases}",
				"$1,\\quad & x$2 \\\\\\",
				"$3, & x$4",
			"\\end{cases}",
		]
	},
	"boxed": {
		"prefix": "\\box",
		"body": [
			"\\boxed{$1}",
		]
	},
	
}
```