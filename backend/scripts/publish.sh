#!/bin/sh

DATE=$(date +"%y%m%d")
PATCH=0

TARGET=release-${DATE}-${PATCH}.apk

echo "Publishing ${TARGET}"
scp ../app/app-release.apk tr0llhoehle.de:/var/www/disease/${TARGET}
