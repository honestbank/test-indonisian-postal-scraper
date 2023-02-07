merge:
	jq -s '[.[][]]' post_*.json > postal-code-merged.json
	jq '.[].postal' postal-code-merged.json | wc -l

sql:
	jq -r '.[] | [ "INSERT INTO `village` (`country_id`, `city_code`, `village_name`, `city_name`, `postal_code`, `district_code`, `created_at`, `updated_at`, `deleted_at`) VALUES (\"ID\" , \"", .city , "\" , \"", .village , "\", \"", .city , "\", \"", .postal , "\",\"" , .dt2 , "\", NOW() , NOW() , NULL );"] | add' postal-code-merged.json > insert.sql
