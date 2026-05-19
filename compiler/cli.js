#!/usr/bin/env node

import fs from "fs";
import { compile } from "./targets/dispatcher.js";

const file = process.argv[2];

if (!file) {
    console.error("Usage: weave <file.web>");
    process.exit(1);
}

const source = fs.readFileSync(file, "utf-8");

compile(source)
    .then(result => {
        console.log(result);
    })
    .catch(err => {
        console.error(err);
    });
