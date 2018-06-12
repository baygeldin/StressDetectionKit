#!/bin/bash

array=()

for arg in "$@"; do
    array+=(\-s $arg)
done

npm run calc-features-meta -- "${array[@]}"
npm run regenerate-samples -- "${array[@]}"
npm run train-model -- "${array[@]}"
