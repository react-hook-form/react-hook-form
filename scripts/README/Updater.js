
import insertInto from './Insert.js'
import Files from 'Files';


const { readTextFile , writeTextFile } = Deno;


/*
 *  Template.md ➞ Insert ➞ README.md
 */

const 
    template = await readTextFile(Files.template) ,
    build = insertInto(template) ;

await writeTextFile(Files.readme,build);






