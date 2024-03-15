using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

// Middleware to log incoming requests and their responses
app.UseMiddleware<RequestLoggingMiddleware>();

app.UseHttpsRedirection();

// Map a route to handle login requests from JavaScript
app.MapPost("/login", async context =>
{
    // Read request body
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    
    // Deserialize JSON request body to obtain username and password
    var loginInfo = JsonSerializer.Deserialize<LoginInfo>(body);

    // Access the JSON file to authenticate the user
    var usuariosJsonPath = Path.Combine(AppContext.BaseDirectory, "db", "usuarios.json");

    var usuariosJson = await File.ReadAllTextAsync(usuariosJsonPath);
    var usuariosObject = JsonSerializer.Deserialize<Dictionary<string, List<Usuario>>>(usuariosJson);

    // Check if the username and password match
    if (usuariosObject != null && usuariosObject.ContainsKey("usuarios"))
    {
        var usuarios = usuariosObject["usuarios"];
        var user = usuarios?.FirstOrDefault(u => u.correo == loginInfo?.correo && u.contrasena == loginInfo?.contrasena);

        if (user != null)
        {
            context.Response.StatusCode = StatusCodes.Status200OK; // Set status code before writing to response
            await context.Response.WriteAsync("Login successful");
        }
        else
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized; // Set status code before writing to response
            await context.Response.WriteAsync("Invalid username or password");
        }
    }
    else
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError; // Set status code before writing to response
        await context.Response.WriteAsync("Invalid JSON file format");
    }
});

app.Run();

// Request logging middleware
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;

    public RequestLoggingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        // Log information about the incoming request
        Console.WriteLine($"Received {context.Request.Method} request to {context.Request.Path}");

        // Call the next middleware in the pipeline
        await _next(context);

        // Log information about the response
        Console.WriteLine($"Response status code: {context.Response.StatusCode}");
    }
}

// Models
record LoginInfo(string correo, string contrasena);

record Usuario(string Nombre, string correo, string contrasena, string Rol);
