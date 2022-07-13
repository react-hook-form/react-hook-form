
import { fromFileUrl , dirname , join } from 'Path';
import { parse } from 'YAML';

const folder = dirname(fromFileUrl(import.meta.url));
const root = join(folder,'..','..');
const source = join(root,'docs');

const file_template = join(source,'Template.md');
const file_helpers = join(source,'Helpers.yaml');
const file_sponsors = join(source,'Sponsors.yaml');
const file_readme = join(root,'README.md');

const regex_insert = /^~\S*$/gm;

const comment_unknown = (type) =>
    `<!-- Unknown Insertion Type : '${ type }' -->`;

const { readTextFile , writeTextFile } = Deno;
const { log } = console;

const generators = {
    Sponsors : generateSponsors ,
    Helpers : generateHelpers
}

const sponsors = parse(await readTextFile(file_sponsors));
const helpers = parse(await readTextFile(file_helpers));

const template = await readTextFile(file_template);


const build = template.replace(regex_insert,(raw) => {
    
    const type = raw
        .trim()
        .substring(1);
    
    return generators[type]?.() 
        ?? comment_unknown(type);
});


await writeTextFile(file_readme,build);



function generateHelpers(){
    return helpers
        .map(toHelperPreview)
        .join('\n');
}

function toHelperPreview(helper){
    return [
        `<a href = '${ github(helper.github) }'>` ,
        `    <img` ,
        `        width = 25` ,
        `        src = '${ avatar(helper.avatar) }'` ,
        `    />` ,
        `</a>`
    ].join('\n');
}

function github(username){
    return `https://github.com/${ username }`;
}

function avatar(id){
    return `https://avatars.githubusercontent.com/u/${ id }`;
}

function generateSponsors(){
    
    const companies = sponsors.companies
        .map(toCompanyPreview)
        .join('\n');
    
    const individuals = sponsors.individuals
        .map(toIndividualPreview)
        .join('\n');
    
    return companies + individuals;
}

function toCompanyPreview(company){
    
    const icon = (company.logo)
        ? logo(company.logo)
        : avatar(company.avatar) ;
    
    return [
        `<a` ,
        `    target = _blank` ,
        `    href = '${ link(company.website) }'` ,
        `/>` ,
        `    <img` ,
        `        width = 94` ,
        `        src = '${ icon }'` ,
        `    />` ,
        `</a>`
    ].join('\n');
}

function logo(path){
    return `https://images.opencollective.com/${ path }/256.png`;
}

function link(path){
    return `https://${ path }`;
}


function toIndividualPreview(individual){
    
    const lines = [
        `<a href = '${ github(individual.github) }'>` ,
        `    <img` ,
        `        width = 45` ,
        `        src = '${ avatar(individual.avatar) }'` ,
        `    />` ,
        `</a>`
    ];
    
    if(individual.alt){
        const alt = `        alt = ${ individual.alt }`;
        lines.slice(2,0,alt);
    }
    
    return lines.join('\n');
}
