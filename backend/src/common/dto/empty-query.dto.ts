/**
 * Used on endpoints that accept NO query parameters.
 * Because the global ValidationPipe uses forbidNonWhitelisted, any query
 * parameter sent to such an endpoint is rejected with 400 Bad Request.
 */
export class EmptyQueryDto {}
