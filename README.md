# TechTerms

A [Vale](https://vale.sh) spelling dictionary of 115,000 technical terms:
product and company names, tools, file types, licenses, and the vocabulary of
cloud, containers, and some 30 programming languages and their frameworks. It sits beside Vale's own
dictionary, so `Vale.Spelling` accepts `kubeadm`, `Buildx`, `Zipkin`, and
`vSphere` while still catching `teh` and `recieve`.

## Install

```ini
StylesPath = styles

Packages = TechTerms

[*.md]
BasedOnStyles = Vale
```

Then run `vale sync`. There is no style to add: Vale loads every dictionary in
`styles/config/dictionaries`, and `Vale.Spelling` uses them all.

Each term also takes a plural and a possessive, so `Cephs` and `Ceph's` are
accepted with `Ceph`. Case matters, as it does in Vale's own dictionary:
`vSphere` is accepted, `Vsphere` is not.

## Where the words come from

The terms are the MIT-licensed word lists that
[cspell](https://github.com/streetsidesoftware/cspell-dicts) ships, 53
packages at the versions pinned in `package.json`. [NOTICE](TechTerms/NOTICE)
lists each one, and its license is in [TechTerms/LICENSES](TechTerms/LICENSES).
Left out are cspell's English dictionaries, which Vale has its own of, its
list of common misspellings, which is under CC BY-SA, and its lorem ipsum
list.

To rebuild after changing a version:

```sh
npm ci
npm run build
./test.sh
```

## License

MIT, for this package. The word lists keep their own licenses; see NOTICE.
