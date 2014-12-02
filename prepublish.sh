#!/bin/sh

echo "clean vendor directory..."
rm -fr ./vendor/*

echo "build and test..."
ember build
ember test

echo "building global/shim dist files..."
rm -fr ./dist
cd ./packaging
../node_modules/.bin/broccoli build ../dist
