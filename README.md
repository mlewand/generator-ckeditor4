
# Yo CKEditor4

[![AppVeyor](https://img.shields.io/appveyor/ci/mlewand/generator-ckeditor4.svg?svg=true&passingText=master%20%E2%9C%93)](https://ci.appveyor.com/project/mlewand/generator-ckeditor4) [![Travis CI](https://img.shields.io/travis/mlewand/generator-ckeditor4.svg)](https://travis-ci.org/mlewand/generator-ckeditor4)

This generator helps with some common CKEditor 4 tasks.

Note that some commands rely on being launched in CKEditor 4 workspace directory.

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

## Create Plugin

```bash
yo ckeditor4:createPlugin [name]
```

Creates a new directory, with a `name` plugin boilerplate.