import fs from 'fs';
import * as ts from 'typescript';

interface CompletionArgs {
  position: number;
  options: ts.GetCompletionsAtPositionOptions | undefined;
}

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

export function completions(
  strings: TemplateStringsArray,
  ...options: Array<ts.GetCompletionsAtPositionOptions | undefined>
) {
  const scriptName = '__intelliSenseTestSnippet__.tsx';
  const scriptContent = strings.join('');
  const completionArgs = getCompletionArgs(strings, options);

  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => [scriptName],
    getScriptVersion: () => '0',
    getScriptSnapshot: (fileName) => {
      if (fileName === scriptName) {
        return ts.ScriptSnapshot.fromString(scriptContent);
      }
      if (!fs.existsSync(fileName)) {
        return undefined;
      }
      return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
    },
    getCurrentDirectory: () => process.cwd(),
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

  return completionArgs.map(({ position, options }) => {
    const result = services.getCompletionsAtPosition(
      scriptName,
      position,
      options,
    );
    return result?.entries.map(({ name, kind }) => ({ name, kind })) ?? [];
  });
}
