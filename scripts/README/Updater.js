import Files from 'Files';
import { format } from 'Time';
import insertInto from './Insert.js';

const { readTextFile, writeTextFile } = Deno;

const timestamp = format(new Date(), 'yyyy / MM / dd  HH:mm:ss');

/*
 *  Template.md ➞ Insert ➞ README.md
 */

const template = await readTextFile(Files.template);

let build = insertInto(template);

build += `\n<!-- Generated @ ${timestamp} -->\n`;

await writeTextFile(Files.readme, build);
