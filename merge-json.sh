jq -s '[.[][]]' post_*.json > postal-code-merged.json
jq '.[].postal' postal-code-merged.json | wc -l

