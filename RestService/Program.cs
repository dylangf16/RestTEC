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
    var usuariosJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "usuarios.json");
    Console.WriteLine($"Usuarios JSON Path: {usuariosJsonPath}"); // Debugging output


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

// Map a route to handle registration requests
// Map a route to handle registration requests
app.MapPost("/register", async context =>
{
    // Read request body
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();

    // Deserialize JSON request body to obtain registration data
    var registrationData = JsonSerializer.Deserialize<RegistrationData>(body);

    // Access the JSON file to check for existing users
    var usuariosJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "usuarios.json");
    Console.WriteLine($"Usuarios JSON Path: {usuariosJsonPath}"); // Debugging output


    // Read existing users from the JSON file
    Dictionary<string, List<Usuario>> usuariosObject;
    try
    {
        var usuariosJson = await File.ReadAllTextAsync(usuariosJsonPath);
        usuariosObject = JsonSerializer.Deserialize<Dictionary<string, List<Usuario>>>(usuariosJson);
    }
    catch (Exception ex)
    {
        // Handle file read exception
        Console.WriteLine($"Error reading usuarios.json file: {ex.Message}");
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync("Error reading usuarios.json file");
        return;
    }

    // Check if the usuariosObject is null, if yes, initialize it
    if (usuariosObject == null)
    {
        usuariosObject = new Dictionary<string, List<Usuario>>();
        usuariosObject.Add("usuarios", new List<Usuario>());
    }

    // Check if the email already exists
    var existingUser = usuariosObject["usuarios"]?.FirstOrDefault(u => u.correo == registrationData?.correo);
    if (existingUser != null)
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        await context.Response.WriteAsync("El correo electrónico ya está registrado");
        return;
    }

    // Generate a unique ID for the new user
    int newId = usuariosObject["usuarios"].Count > 0 ? usuariosObject["usuarios"].Max(u => u.id) + 1 : 1;

    // Create new user object
    var newUser = new Usuario(
        newId,
        registrationData.nombre,
        registrationData.apellido1,
        registrationData.apellido2,
        registrationData.correo,
        registrationData.contrasena,
        registrationData.cedula,
        registrationData.fecha_nacimiento,
        registrationData.telefonos ?? new List<string>(),
        registrationData.direccion ?? new Direccion(),
        "cliente" // You can set the default role here
    );

    // Add the new user to the list of users
    usuariosObject["usuarios"].Add(newUser);

    // Write updated data back to JSON file
    try
    {
        var updatedJson = JsonSerializer.Serialize(usuariosObject);
        await File.WriteAllTextAsync(usuariosJsonPath, updatedJson);
    }
    catch (Exception ex)
    {
        // Handle file write exception
        Console.WriteLine($"Error writing to usuarios.json file: {ex.Message}");
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync("Error writing to usuarios.json file");
        return;
    }

    // Return success message
    context.Response.StatusCode = StatusCodes.Status201Created;
    await context.Response.WriteAsync("Registro exitoso");
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
record Usuario(int id, string nombre, string apellido1, string apellido2, string correo, string contrasena, string cedula, string fecha_nacimiento, List<string> telefonos, Direccion direccion, string Rol);
record RegistrationData(string nombre, string apellido1, string apellido2, string correo, string contrasena, string cedula, string fecha_nacimiento, List<string> telefonos, Direccion direccion);
public record Direccion(string? provincia = null, string? canton = null, string? distrito = null);
