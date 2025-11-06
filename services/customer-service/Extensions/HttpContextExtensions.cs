namespace PaymentApi.Extensions
{
    /// <summary>
    /// Extension methods for HttpContext to easily access auth user information
    /// </summary>
    public static class HttpContextExtensions
    {
        private const string AuthUserIdKey = "AuthUserId";

        /// <summary>
        /// Get the authenticated user's ID from the HTTP context
        /// </summary>
        /// <param name="context">The HTTP context</param>
        /// <returns>The auth user ID, or null if not found</returns>
        public static long? GetAuthUserId(this HttpContext context)
        {
            if (context.Items.TryGetValue(AuthUserIdKey, out var userIdObj) && userIdObj is long userId)
            {
                return userId;
            }
            return null;
        }

        /// <summary>
        /// Get the authenticated user's ID from the HTTP context, throwing if not found
        /// </summary>
        /// <param name="context">The HTTP context</param>
        /// <returns>The auth user ID</returns>
        /// <exception cref="UnauthorizedAccessException">Thrown when auth user ID is not found</exception>
        public static long GetRequiredAuthUserId(this HttpContext context)
        {
            var userId = context.GetAuthUserId();
            if (!userId.HasValue)
            {
                throw new UnauthorizedAccessException("Authentication required");
            }
            return userId.Value;
        }
    }
}
