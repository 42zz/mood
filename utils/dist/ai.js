"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.qa = exports.analyze = void 0;
var openai_1 = require("langchain/llms/openai");
var output_parsers_1 = require("langchain/output_parsers");
var zod_1 = require("zod");
var prompts_1 = require("langchain/prompts");
var document_1 = require("langchain/document");
var chains_1 = require("langchain/chains");
var openai_2 = require("langchain/embeddings/openai");
var memory_1 = require("langchain/vectorstores/memory");
var parser = output_parsers_1.StructuredOutputParser.fromZodSchema(zod_1["default"].object({
    mood: zod_1["default"]
        .string()
        .describe('the mood of the person who wrote the journal entry'),
    summary: zod_1["default"].string().describe('a summary of the journal entry'),
    subject: zod_1["default"].string().describe('the subject of the journal entry'),
    negative: zod_1["default"].boolean().describe('whether the journal entry is negative'),
    color: zod_1["default"]
        .string()
        .describe('a hexidecimal color code representing the mood of the journal entry')
}));
var getPrompt = function (content) { return __awaiter(void 0, void 0, void 0, function () {
    var format_instructions, prompt, input;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                format_instructions = parser.getFormatInstructions();
                prompt = new prompts_1.PromptTemplate({
                    template: 'Analyze the following journal entry. Follow the intrusctions and format your response to match the format instructions, no matter what! \n{format_instructions}\n{entry}',
                    inputVariables: ['entry'],
                    partialVariables: { format_instructions: format_instructions }
                });
                return [4 /*yield*/, prompt.format({
                        entry: content
                    })];
            case 1:
                input = _a.sent();
                return [2 /*return*/, input];
        }
    });
}); };
exports.analyze = function (content) { return __awaiter(void 0, void 0, void 0, function () {
    var input, model, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getPrompt(content)];
            case 1:
                input = _a.sent();
                model = new openai_1.OpenAI({
                    temperature: 0,
                    modelName: 'gpt-3.5-turbo'
                });
                return [4 /*yield*/, model.call(input)];
            case 2:
                result = _a.sent();
                console.log(result);
                try {
                    return [2 /*return*/, parser.parse(result)];
                }
                catch (e) {
                    console.log(e);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
        }
    });
}); };
exports.qa = function (question, entries) { return __awaiter(void 0, void 0, void 0, function () {
    var docs, model, chain, embeddings, store, relavantDocs, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                docs = entries.map(function (entry) {
                    return new document_1.Document({
                        pageContent: entry.content,
                        metadata: { id: entry.id, createdAt: entry.createdAt }
                    });
                });
                model = new openai_1.OpenAI({ temperature: 0, modelName: 'gpt-3.5-turbo' });
                chain = chains_1.loadQARefineChain(model);
                embeddings = new openai_2.OpenAIEmbeddings();
                return [4 /*yield*/, memory_1.MemoryVectorStore.fromDocuments(docs, embeddings)];
            case 1:
                store = _a.sent();
                return [4 /*yield*/, store.similaritySearch(question)];
            case 2:
                relavantDocs = _a.sent();
                return [4 /*yield*/, chain.call({ input_documents: relavantDocs, question: question })];
            case 3:
                res = _a.sent();
                return [2 /*return*/, res.output_text];
        }
    });
}); };
