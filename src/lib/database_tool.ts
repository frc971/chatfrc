import { Tool, type ToolParams } from "langchain/tools"
//For some reason _call becomes undefined
export class SearchTool extends Tool {
    static lc_name() {
      return "SearchTool";
    }
  
    name = "search-tool";
  
    description = "This tool preforms a search about things and whatnot.";
  
    constructor(config?: ToolParams) {
      super(config);

    }
    _call = async (_: string): Promise<any> => {
        return "32";
    }
  }