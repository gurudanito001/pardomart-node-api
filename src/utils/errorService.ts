

export default class ServerError extends Error {
  public statusCode;
  public errors;
  public status;
  public payload: null;
  constructor(errors: string[], statusCode: number) {
    super();
    this.errors = errors;
    this.statusCode = statusCode;
    this.status = "failed";
    this.payload = null;
  }
}

