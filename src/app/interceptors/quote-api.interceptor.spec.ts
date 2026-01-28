import { HttpContext, HttpRequest, HttpHandlerFn, HttpResponse, HttpHeaders } from '@angular/common/http';
import { QuoteApiInterceptor, USE_QUOTE_TOKEN } from './quote-api.interceptor';
import { environment } from '../../environments/environment';
import { of } from 'rxjs';

describe('QuoteApiInterceptor', () => {
  let mockNext: HttpHandlerFn;

  beforeEach(() => {
    mockNext = vi.fn((req: HttpRequest<unknown>) => of(new HttpResponse({ status: 200 })));
  });

  describe('USE_QUOTE_TOKEN', () => {
    it('should have default value of false', () => {
      const context = new HttpContext();
      expect(context.get(USE_QUOTE_TOKEN)).toBe(false);
    });
  });

  describe('interceptor behavior', () => {
    it('should not modify request when USE_QUOTE_TOKEN is false', () => {
      const context = new HttpContext().set(USE_QUOTE_TOKEN, false);
      const request = new HttpRequest('GET', '/test', { context });

      QuoteApiInterceptor(request, mockNext);

      expect(mockNext).toHaveBeenCalledWith(request);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should pass request unchanged when USE_QUOTE_TOKEN is not set', () => {
      const context = new HttpContext();
      const request = new HttpRequest('GET', '/test', { context });

      QuoteApiInterceptor(request, mockNext);

      expect(mockNext).toHaveBeenCalledWith(request);
    });

    it('should add x-api-key header when USE_QUOTE_TOKEN is true', () => {
      const originalApiKey = environment.quoteApi.apiKey;
      environment.quoteApi.apiKey = 'test-api-key-123';

      const context = new HttpContext().set(USE_QUOTE_TOKEN, true);
      const request = new HttpRequest('GET', '/test', { context });

      QuoteApiInterceptor(request, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const modifiedRequest = (mockNext as any).mock.calls[0][0];
      expect(modifiedRequest.headers.get('x-api-key')).toBe('test-api-key-123');

      environment.quoteApi.apiKey = originalApiKey;
    });

    it('should clone request when adding header', () => {
      const originalApiKey = environment.quoteApi.apiKey;
      environment.quoteApi.apiKey = 'test-key';

      const context = new HttpContext().set(USE_QUOTE_TOKEN, true);
      const request = new HttpRequest('GET', '/test', { context });

      QuoteApiInterceptor(request, mockNext);

      const modifiedRequest = (mockNext as any).mock.calls[0][0];
      expect(modifiedRequest).not.toBe(request);
      expect(modifiedRequest.url).toBe(request.url);
      expect(modifiedRequest.method).toBe(request.method);

      environment.quoteApi.apiKey = originalApiKey;
    });

    it('should preserve other headers when adding x-api-key', () => {
      const originalApiKey = environment.quoteApi.apiKey;
      environment.quoteApi.apiKey = 'test-key';

      const context = new HttpContext().set(USE_QUOTE_TOKEN, true);
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer token');
      const request = new HttpRequest('GET', '/test', { context, headers });

      QuoteApiInterceptor(request, mockNext);

      const modifiedRequest = (mockNext as any).mock.calls[0][0];
      expect(modifiedRequest.headers.get('Content-Type')).toBe('application/json');
      expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer token');
      expect(modifiedRequest.headers.get('x-api-key')).toBe('test-key');

      environment.quoteApi.apiKey = originalApiKey;
    });

    it('should use environment.quoteApi.apiKey value', () => {
      const originalApiKey = environment.quoteApi.apiKey;
      environment.quoteApi.apiKey = 'custom-api-key-value';

      const context = new HttpContext().set(USE_QUOTE_TOKEN, true);
      const request = new HttpRequest('GET', '/test', { context });

      QuoteApiInterceptor(request, mockNext);

      const modifiedRequest = (mockNext as any).mock.calls[0][0];
      expect(modifiedRequest.headers.get('x-api-key')).toBe('custom-api-key-value');

      environment.quoteApi.apiKey = originalApiKey;
    });
  });
});
