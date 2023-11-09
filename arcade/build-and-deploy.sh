#!/bin/bash

npx near-sdk-js build src/$1.ts build/$1.wasm && near dev-deploy --wasmFile build/$1.wasm 