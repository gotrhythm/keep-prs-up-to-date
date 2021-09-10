This github action is built to keep your PR's up to date.

On a push to your main branch, this will find all open PR's with a
particular tag and merge the main branch (name is configurable) into the PR's.

This can be useful for a large team with a long(ish) build time to
avoid developers from having to keep up with multiple pushes to the
main branch.

With the label specification, it is an opt-in action so that
developers who prefer to manage their own branches will be unaffected.

Usage
------

Assuming you want to auto merge a branch called `development` into all
PR's with the label `automerge development`, add a workflow file to
your `.github/workflows` with the following:

```yaml
name: Merge development into PR branches labeled "automerge development"

on:
  push:
    branches:
      - development
jobs:
  get_pull_requests:
    runs-on: ubuntu-latest
    name: Stay up to date with development
    steps:
      - uses: gotrhythm/keep-prs-up-to-date@main
        with:
          token: ${{github.token}}
          default_branch: development
          labels: "automerge development"
```


You can also force this auto-merge on every pr with the `all` parameter.

```yaml
name: Merge development into *all* PR branches

on:
  push:
    branches:
      - development
jobs:
  get_pull_requests:
    runs-on: ubuntu-latest
    name: Stay up to date with development
    steps:
      - uses: rcode5/keep-prs-up-to-date@master
        with:
          token: ${{github.token}}
          default_branch: development
          all: true
```


Development
------------

Edit the `index.js` and run `yarn build` to build the `dist` version.
