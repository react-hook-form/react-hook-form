import fs from 'fs';
import * as ts from 'typescript';

interface CompletionArgs {
  /** cursor position within the code snippet */
  position: number;
  /**
   * Additional options for
   * {@link typescript#LanguageService.getCompletionsAtPosition}
   */
  options: ts.GetCompletionsAtPositionOptions | undefined;
}

/**
 * Function to retrieve an array of {@link CompletionArgs} from a template
 * literal.
 * @param strings - the string parts of the template literal
 * @param options - the interpolated options within the template literal
 */
function getCompletionArgs(
  strings: TemplateStringsArray,
  options: Array<ts.GetCompletionsAtPositionOptions | undefined>,
) {
  if (options.length !== strings.length - 1) {
    throw new Error("The options don't match the given strings.");
  }

  const completionArgs: CompletionArgs[] = [];
  for (let i = 0; i < options.length; i++) {
    if (i === 0) {
      completionArgs.push({
        position: strings[i].length,
        options: options[i],
      });
    } else {
      completionArgs.push({
        position: strings[i].length + completionArgs[i - 1].position,
        options: options[i],
      });
    }
  }
  return completionArgs;
}

interface Completion {
  /** the string which is displayed in the IntelliSense completion dropdown */
  name: string;
  /** the kind of IntelliSense completion */
  kind: ts.ScriptElementKind;
}

/**
 * Template tag function to retrieve IntelliSense completions for all the
 * positions in the code snippet where an interpolation was inserted.
 */
export type CompletionsTag = (
  strings: TemplateStringsArray,
  ...options: Array<ts.GetCompletionsAtPositionOptions | undefined>
) => Completion[][];

/**
 * Factory function to create a {@link CompletionsTag} template tag function.
 *
 * The interpolations within the template literal mark the positions, for which
 * IntelliSense completions should be retrieved, and can be used to pass extra
 * options to {@link typescript#LanguageService.getCompletionsAtPosition}.
 *
 * Think of the interpolations as cursor positions within that snippet.
 *
 * The template tag function returns an array of completions for each of the
 * interpolations within the snippet.
 *
 * @param dirname - the directory which should be used for relative imports
 * @example
 * ```
 * const completions = completionsFactory(__dirname)
 *
 * const [result] = completions`
 *  import {useWatch, Control} from '..'
 *  declare const control: Control<{foo: string}>
 *  useWatch({
 *    control,
 *    name: '${undefined}'
 *  })`
 * ```
 */
export function completionsFactory(dirname: string): CompletionsTag {
  const scriptName = '__intelliSenseTestSnippet__.tsx';

  let scriptVersion = 0;
  let scriptContent = '';

  // See https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#incremental-build-support-using-the-language-services
  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => [scriptName],
    getScriptVersion: (fileName) =>
      fileName === scriptName ? scriptVersion.toString() : '0',
    getScriptSnapshot: (fileName) => {
      if (fileName === scriptName) {
        return ts.ScriptSnapshot.fromString(scriptContent);
      }
      if (!fs.existsSync(fileName)) {
        return undefined;
      }
      return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
    },
    getCurrentDirectory: () => dirname,
    getCompilationSettings: () => ({}),
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
  };

  const services = ts.createLanguageService(
    servicesHost,
    ts.createDocumentRegistry(),
  );

  return (strings, ...options) => {
    scriptVersion++;
    scriptContent = strings.join('');

    const completionArgs = getCompletionArgs(strings, options);

    return completionArgs.map(({ position, options }) => {
      const result = services.getCompletionsAtPosition(
        scriptName,
        position,
        options,
      );
      return result?.entries.map(({ name, kind }) => ({ name, kind })) ?? [];
    });
  };
}
