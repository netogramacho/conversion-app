import { HttpInterceptorFn, HttpContextToken } from "@angular/common/http";
import { environment } from "../../environments/environment";

export const USE_QUOTE_TOKEN = new HttpContextToken<boolean>(() => false);

export const QuoteApiInterceptor: HttpInterceptorFn = (req: any, next: any) => {
  if(!req.context.get(USE_QUOTE_TOKEN)) {
    return next(req);
  }

  const clonedRequest = req.clone({
    setHeaders: {
      'x-api-key': environment.quoteApi.apiKey
    }
  });
  return next(clonedRequest);
};
