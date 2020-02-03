#!/usr/bin/env node
import { Setup } from './src/Setup';
import { PackageParser } from './src/PackageParser';
import path from 'path';

const parser = new PackageParser(process.cwd(), path.resolve(__dirname, '..'));
const setup = new Setup(parser);

setup.do();
