# Yo CKEditor4

<img src="assets/logo-200.png" srcset="assets/logo-200.png 2x" alt="CKEditor4 generator">

---

[![AppVeyor](https://ci.appveyor.com/api/projects/status/ig85qtyidxm4hkcg?svg=true&passingText=master%20%E2%9C%93)](https://ci.appveyor.com/project/mlewand/generator-ckeditor4) [![Travis CI](https://img.shields.io/travis/mlewand/generator-ckeditor4.svg)](https://travis-ci.org/mlewand/generator-ckeditor4)

This generator helps with some common CKEditor 4 tasks.

Note that some commands, like build, rely on being launched in CKEditor 4 workspace directory.

## Installation

```bash
npm install -g yo generator-ckeditor4
```

## Create Plugin

![Create plugin generator screencast](assets/createPlugin.gif)

```bash
yo ckeditor4:createPlugin [name]
```

Creates a new plugin in a `name` directory. This generator has multiple options, use `yo ckeditor4:createPlugin --help` to list them all.

## Issues

### Add

`yo ckeditor4:issue add`

Opens your web browser on a page where you can fill a new ticket.

### Open

`yo ckeditor4:issue open 16705`

Opens an issue with a given id.

If you're using command from CKEditor git repository on `t/<ticketNumber>` branch, you could skip ticket number - that way it will automatically pick your current ticket number.

### Roadmap

Simply opens CKEditor 4 roadmap.

### Milestone

Opens a details for the given milestone.

`yo ckeditor4:issue milestone 4.6.0`

Milestone number might be skipped, then current version of CKEditor is used.

## Build

Builds CKEditor project.

`yo ckeditor4:build --preset standard`

`yo ckeditor4:build --preset basic --all`