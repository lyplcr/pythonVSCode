import { CompletionItem, SymbolKind } from 'vscode';
import * as proxy from '../../providers/jediProxy';
import { extractSignatureAndDocumentation } from '../../providers/jediHelpers';
import { PythonSettings } from '../../common/configSettings';

const pythonSettings = PythonSettings.getInstance();

export class CompletionParser {
    public static parse(data: proxy.ICompletionResult): CompletionItem[] {
        if (!data || data.items.length === 0) {
            return [];
        }
        return data.items.map(item => {
            const sigAndDocs = extractSignatureAndDocumentation(item);
            let completionItem = new CompletionItem(item.text);
            completionItem.kind = item.type;
            completionItem.documentation = sigAndDocs[1].length === 0 ? item.description : sigAndDocs[1];
            completionItem.detail = sigAndDocs[0].split(/\r?\n/).join('');
            if (pythonSettings.autoComplete.addBrackets === true &&
                (item.kind === SymbolKind.Function || item.kind === SymbolKind.Method)) {
                completionItem.insertText = item.text + '({{}})';
            }

            // ensure the built in memebers are at the bottom
            completionItem.sortText = (completionItem.label.startsWith('__') ? 'z' : (completionItem.label.startsWith('_') ? 'y' : '__')) + completionItem.label;
            return completionItem;
        });
    }
}