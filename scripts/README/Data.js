import Files from 'Files';
import { parse } from 'YAML';

const { readTextFile } = Deno;

const readYAML = async (path) => parse(await readTextFile(path));

const { individuals, companies } = await readYAML(Files.sponsors);

export default { individuals, companies };
