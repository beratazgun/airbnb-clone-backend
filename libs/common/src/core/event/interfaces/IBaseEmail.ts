export interface IBaseEmail {
  to: string;
  locale: string;
  templateCredentials: {
    templateName: string;
    templateFileName: string;
    subject: string;
  };
  templateData: Record<string, unknown>;
}
