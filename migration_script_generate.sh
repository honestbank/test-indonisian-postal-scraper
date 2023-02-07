#!/bin/bash

# Input file
file="mapping_insert.sql"

# Output directory
dir="./migrations"

# Number of rows per file
rows=5000

# Counter for filenames
fileCount=0

# Make output directory
mkdir -p $dir

# Current file cursor
cursor=0

while read line; do
  if [ $((cursor % rows)) -eq 0 ]; then
    datetime=$(date +%Y%m%d%H%M%S)
    cursor=0
    # If the line number is a multiple of 1000, start a new file
    ((fileCount++))
    echo "file number $fileCount"
    outfile="$dir/${datetime}_insert_postal_code_mapping_$fileCount.up.sql"
    echo $line > $outfile
    echo "TRUNCATE TABLE postal_code_mapping" > "$dir/${datetime}_insert_postal_code_mapping_$fileCount.down.sql"
  else
    # Otherwise, append to the current file
    echo $line >> $outfile
  fi
  ((cursor++))
done < $file
