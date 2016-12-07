#!/bin/bash

sqlite3 $1 <<!
.headers on
.mode csv
select lon,lat from locations WHERE uid = $2;
!
