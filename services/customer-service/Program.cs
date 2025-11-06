using Microsoft.EntityFrameworkCore;
using PaymentApi.Data;
using PaymentApi.Repositories;
using PaymentApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------
// Add services to the container
// ---------------------------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Preserve property names as defined (camelCase in DTOs)
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ---------------------------
// Add DbContext with SQL Server
// ---------------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ---------------------------
// Register Repositories and Services
// ---------------------------
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();

// ---------------------------
// Enable CORS for React frontend
// ---------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactLocal", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // React dev server port
              .AllowAnyHeader()
              .AllowAnyMethod();
              //.AllowCredentials(); // Uncomment only if you use cookies/auth
    });
});

var app = builder.Build();

// ---------------------------
// Configure middleware
// ---------------------------

// Use developer exception page for easier debugging (in development)
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PaymentApi v1");
        c.RoutePrefix = string.Empty; // Swagger at root
    });
}
else
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PaymentApi v1");
    });
}

// ✅ Must be before UseAuthorization
app.UseCors("AllowReactLocal");

// ✅ Add Auth User Context Middleware
app.UseMiddleware<AuthUserContextMiddleware>();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
