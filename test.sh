#!/bin/sh
#
# testdata/accept.md is technical prose that Vale's own dictionary flags and
# TechTerms accepts, so it must produce no alerts; testdata/reject.md holds
# real typos, which must still be reported, proving the default dictionary
# still loads beside this one.
set -eu
cd "$(dirname "$0")/testdata"

out=$(vale --no-global --output=line accept.md 2>&1) || true
if [ -n "$out" ]; then
  echo "accept.md: expected no alerts, got:"
  echo "$out"
  exit 1
fi

got=$(vale --no-global --output=line reject.md 2>&1 | sed 's/^reject.md://') || true
want='1:13:Vale.Spelling:Did you really mean '"'"'teh'"'"'?
3:14:Vale.Spelling:Did you really mean '"'"'recieve'"'"'?
3:56:Vale.Spelling:Did you really mean '"'"'seperate'"'"'?'
if [ "$got" != "$want" ]; then
  echo "reject.md: expected"
  echo "$want"
  echo "got"
  echo "$got"
  exit 1
fi
echo ok
