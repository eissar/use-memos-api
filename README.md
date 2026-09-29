# use-memos-api
Install: `deno install -g -n fetch-memos --allow-env --allow-net https://raw.githubusercontent.com/eissar/use-memos-api/master/fetch-memos.js` (add `-f` to upgrade)
Run: `MEMOS_KEY=... MEMOS_BASE_URL=http://host:5230 fetch-memos` (dumps all memos as JSON)

## todo

```
curl -s -H "Authorization: Bearer $MEMOS_KEY" "$MEMOS_BASE_URL/api/v1/users/eissar:getStats" | jq -r '.tagCount | to_entries | sort_by(-.value)[] | "\(.value)\t\(.key)"'

curl -sG -H "Authorization: Bearer $MEMOS_KEY" --data-urlencode 'filter=tag in ["projects"]' "$MEMOS_BASE_URL/api/v1/memos" | jq '.memos'
```
