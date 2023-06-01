#!/bin/bash
while IFS='$\n' read -r line; do
	FILENAME=$(echo $line|node -pe 'JSON.parse(fs.readFileSync(0)).filename')
	SIZE=$(echo $line|node -pe 'JSON.parse(fs.readFileSync(0)).size')
	GENERATED=$(date)
	JSON=$(cat <<-END
    {
        "filename": "${FILENAME}",
        "size": "${SIZE}",
        "generated": "${GENERATED}",
	}
END
)
	curl -s -H "Content-Type: application/json" -d "${JSON}" "https://webhook.site/95c85279-922d-40ab-8507-26f7fe2e129b"
	echo "{\"hooked\": $?}"
done < <(cat -)
