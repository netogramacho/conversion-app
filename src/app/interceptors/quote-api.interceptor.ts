import { HttpInterceptorFn, HttpContextToken, HttpRequest, HttpHandlerFn } from "@angular/common/http";
import { environment } from "../../environments/environment";

export const USE_QUOTE_TOKEN = new HttpContextToken<boolean>(() => false);

export const QuoteApiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
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
