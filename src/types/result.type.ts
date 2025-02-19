export type Result<Data> =
  | {
      success: false;
      errorMessage: string;
    }
  | {
      success: true;
      data: Data;
    };
