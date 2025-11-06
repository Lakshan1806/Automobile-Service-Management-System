using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PaymentApi.Middleware
{
    /// <summary>
    /// Middleware to extract and validate authUserId from JWT or X-Auth-User-Id header
    /// </summary>
    public class AuthUserContextMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<AuthUserContextMiddleware> _logger;

        public AuthUserContextMiddleware(RequestDelegate next, ILogger<AuthUserContextMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            long? authUserId = null;

            // Try to get from Authorization header (JWT)
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                var token = authHeader.Substring("Bearer ".Length).Trim();
                authUserId = ExtractUserIdFromJwt(token);
                
                if (authUserId.HasValue)
                {
                    _logger.LogInformation("Extracted authUserId {AuthUserId} from JWT", authUserId.Value);
                }
            }

            // Fallback: Try X-Auth-User-Id header (from gateway)
            if (!authUserId.HasValue)
            {
                var headerUserId = context.Request.Headers["X-Auth-User-Id"].FirstOrDefault();
                if (!string.IsNullOrEmpty(headerUserId) && long.TryParse(headerUserId, out var parsedId))
                {
                    authUserId = parsedId;
                    _logger.LogInformation("Extracted authUserId {AuthUserId} from X-Auth-User-Id header", authUserId.Value);
                }
            }

            // Store in HttpContext.Items for easy access
            if (authUserId.HasValue)
            {
                context.Items["AuthUserId"] = authUserId.Value;
            }

            await _next(context);
        }

        private long? ExtractUserIdFromJwt(string token)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                if (!handler.CanReadToken(token))
                {
                    _logger.LogWarning("Invalid JWT token format");
                    return null;
                }

                var jwtToken = handler.ReadJwtToken(token);
                
                // Try to get 'sub' claim (subject)
                var subClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "sub" || c.Type == ClaimTypes.NameIdentifier);
                if (subClaim != null && long.TryParse(subClaim.Value, out var userId))
                {
                    return userId;
                }

                // Fallback: try 'user_id' claim
                var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "user_id");
                if (userIdClaim != null && long.TryParse(userIdClaim.Value, out var altUserId))
                {
                    return altUserId;
                }

                _logger.LogWarning("No valid user ID claim found in JWT");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting user ID from JWT");
                return null;
            }
        }
    }
}
