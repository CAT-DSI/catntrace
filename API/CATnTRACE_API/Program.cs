using CATnTRACE_API.DAL;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
  
    options.AddPolicy("AllowedUrls",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200", "http://113.96.6.90", "http://freqxwsqlr7.cat.groupecat.com:81", "http://freqxwsqlr7.cat.groupecat.com", "http://freqxwsqlr7.cat.groupecat.com:82", "http://freqxwsqlr7.cat.groupecat.com:82/CATnTRACE", "*")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});
builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();
builder.Services.AddScoped<OrderTrackingDAL>();
builder.Services.AddScoped<ParcelTrackingDAL>();

builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{

    app.UseSwagger();
    app.UseSwaggerUI();
//}



app.UseCors("AllowedUrls");
app.UseAuthorization();

app.MapControllers();

app.Run();
