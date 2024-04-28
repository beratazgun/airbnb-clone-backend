interface IArgs {
  translatable?: {
    fields?: {
      [key: string]: any;
    };
  };
  otherArgs?: {
    [key: string]: any;
  };
}

interface IParseObjToStr {
  translateFileName: string;
  path: string;
  args?: IArgs;
}

export class ParseResponseMessage {
  public static parseObjToStr({
    translateFileName,
    path,
    args = {},
  }: IParseObjToStr): string {
    return JSON.stringify({
      translateFileName: translateFileName || '',
      path: path || '',
      args,
    });
  }

  public static parseStrToObj(str: string): {
    message: string;
    args: IArgs;
  } {
    const parsed = JSON.parse(str);

    return {
      message: `${parsed.translateFileName}.${parsed.path}`,
      args: parsed.args,
    };
  }
}
