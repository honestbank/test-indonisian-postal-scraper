merge:
	jq -s '[.[][]]' post_*.json > postal-code-merged.json
	jq '.[].postal' postal-code-merged.json | wc -l

sql:
	jq -r '.[] | [ "INSERT INTO `village` (`country_id`, `city_code`, `village_name`, `city_name`, `postal_code`, `district_code`, `created_at`, `updated_at`, `deleted_at`) VALUES (\"ID\" , \"", .city , "\" , \"", .village , "\", \"", .city , "\", \"", .postal , "\",\"" , .dt2 , "\", NOW() , NOW() , NULL );"] | add' postal-code-merged.json > insert.sql

mapping_sql:
	jq -r '.[] | [ "INSERT INTO `postal_code_mapping` (`district_name`, `city_name`, `district_and_city_name_mapping`, `postal_code`, `created_at`, `updated_at`, `deleted_at`) VALUES (\"\(.village)\", \"\(.city)\", \"\(.village | gsub("\\(.*\\)"; "") | gsub("[^a-zA-Z0-9]+"; "") | ascii_downcase)\(.city | gsub("KOTA"; "") | gsub("[^a-zA-Z0-9]+"; "") | ascii_downcase)\", \"\(.postal)\", NOW() , NOW() , NULL );"] | add' postal-code-merged.json > mapping_insert.sql
	./migration_script_generate.sh
