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
            var client_id = user.id; // Get the client ID
            var responseData = new
            {
                message = "Inicio de sesión exitoso",
                client_id = client_id
            };
            var jsonResponse = JsonSerializer.Serialize(responseData);
            await context.Response.WriteAsync(jsonResponse);
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

// Map a route to handle getting dishes
app.MapGet("/dishes", async context =>
{
    // Access the JSON file to get the list of dishes
    var dishesJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "menu.json");
    Console.WriteLine($"Dishes JSON Path: {dishesJsonPath}"); // Debugging output

    try
    {
        var dishesJson = await File.ReadAllTextAsync(dishesJsonPath);
        var menuObject = JsonSerializer.Deserialize<Menu>(dishesJson);

        // Return the list of dishes
        context.Response.StatusCode = StatusCodes.Status200OK;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { dishes = menuObject.menu });
    }
    catch (Exception ex)
    {
        // Handle file read exception
        Console.WriteLine($"Error reading menu.json file: {ex.Message}");
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync("Error reading menu.json file");
    }
});

// Map a route to handle placing orders
app.MapPost("/order", async context =>
{
    // Read request body
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();

    // Deserialize JSON request body to obtain order data
    var orderData = JsonSerializer.Deserialize<OrderData>(body);

    // Access the JSON file to store the order
    var pedidosJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "pedidos.json");
    Console.WriteLine($"Pedidos JSON Path: {pedidosJsonPath}"); // Debugging output

    // Read existing orders from the JSON file
    List<Pedido> pedidos;
    try
    {
        var pedidosJson = await File.ReadAllTextAsync(pedidosJsonPath);
        var pedidosObject = JsonSerializer.Deserialize<Pedidos>(pedidosJson);
        pedidos = pedidosObject?.pedidos ?? new List<Pedido>();
    }
    catch (Exception ex)
    {
        // Handle file read exception
        Console.WriteLine($"Error reading pedidos.json file: {ex.Message}");
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync("Error reading pedidos.json file");
        return;
    }

    // Generate a unique ID for the new order
    int newId = pedidos.Count > 0 ? pedidos.Max(p => p.id_pedido) + 1 : 1;

    // Create new order object
    var newPedido = new Pedido(
        newId,
        orderData.id_cliente,
        orderData.platos,
        DateTime.UtcNow, // Use current UTC time for 'fecha_hora'
        "Recibido por el restaurante" // Set initial status
    );

    // Add the new order to the list of orders
    pedidos.Add(newPedido);

    // Write updated data back to JSON file
    try
    {
        var updatedJson = JsonSerializer.Serialize(new Pedidos(pedidos));
        await File.WriteAllTextAsync(pedidosJsonPath, updatedJson);
    }
    catch (Exception ex)
    {
        // Handle file write exception
        Console.WriteLine($"Error writing to pedidos.json file: {ex.Message}");
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync("Error writing to pedidos.json file");
        return;
    }

    // Return success message with order ID
    context.Response.StatusCode = StatusCodes.Status201Created;
    await context.Response.WriteAsync($"{{ \"order_id\": {newId} }}");
});

// Map a route to handle fetching active orders for a specific client
app.MapGet("/orders/{clientId}", async (int clientId, HttpContext context) =>
{
    // Access the JSON file to get the list of orders
    var pedidosJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "pedidos.json");
    Console.WriteLine($"Pedidos JSON Path: {pedidosJsonPath}"); // Debugging output

    try
    {
        var pedidosJson = await File.ReadAllTextAsync(pedidosJsonPath);
        var pedidosObject = JsonSerializer.Deserialize<Pedidos>(pedidosJson);

        // Filter active orders for the specified client
        var activeOrders = pedidosObject?.pedidos.Where(p => p.id_cliente == clientId && p.estado == "Recibido por el restaurante").ToList();

        if (activeOrders != null && activeOrders.Any())
        {
            // Return the list of active orders
            context.Response.StatusCode = StatusCodes.Status200OK;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { orders = activeOrders });
        }
        else
        {
            // No active orders found for the client
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsync($"No active orders found for client ID {clientId}");
        }
    }
    catch (Exception ex)
    {
        // Handle file read exception
        Console.WriteLine($"Error reading pedidos.json file: {ex.Message}");
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync("Error reading pedidos.json file");
    }
});

// Map a route to handle fetching details of a specific order by its ID
app.MapGet("/order/{orderId}", async (int orderId, HttpContext context) =>
{
    // Access the JSON file to get the list of orders
    var pedidosJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "pedidos.json");
    Console.WriteLine($"Pedidos JSON Path: {pedidosJsonPath}"); // Debugging output

    try
    {
        var pedidosJson = await File.ReadAllTextAsync(pedidosJsonPath);
        var pedidosObject = JsonSerializer.Deserialize<Pedidos>(pedidosJson);

        // Find the order with the specified ID
        var order = pedidosObject?.pedidos.FirstOrDefault(p => p.id_pedido == orderId);

        if (order != null)
        {
            // Return the details of the order
            context.Response.StatusCode = StatusCodes.Status200OK;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(order);
        }
        else
        {
            // No order found with the specified ID
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsync($"Order with ID {orderId} not found");
        }
    }
    catch (Exception ex)
    {
        // Handle file read exception
        Console.WriteLine($"Error reading pedidos.json file: {ex.Message}");
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync("Error reading pedidos.json file");
    }
});

// Map a route to handle updating user accounts
// Map a route to handle updating user accounts
app.MapPut("/update/{userId}", async (HttpContext context) =>
{
    // Extract userId from route parameters
    if (!context.Request.RouteValues.TryGetValue("userId", out var userIdObj) || !int.TryParse(userIdObj?.ToString(), out var userId))
    {
        // userId not found or not a valid integer
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        await context.Response.WriteAsync("Invalid user ID");
        return;
    }

    // Read request body
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();

    // Deserialize JSON request body to obtain updated user data
    var updateData = JsonSerializer.Deserialize<UpdateData>(body);

    // Access the JSON file to update the user account
    var usuariosJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "usuarios.json");
    Console.WriteLine($"Usuarios JSON Path: {usuariosJsonPath}"); // Debugging output

    try
    {
        var usuariosJson = await File.ReadAllTextAsync(usuariosJsonPath);
        var usuariosObject = JsonSerializer.Deserialize<Dictionary<string, List<Usuario>>>(usuariosJson);

        // Find the user with the specified ID
        var userIndex = usuariosObject?["usuarios"]?.FindIndex(u => u.id == userId);

        if (userIndex != null && userIndex >= 0)
        {
            // Update user data
            usuariosObject["usuarios"][userIndex.Value] = new Usuario(
                userId,
                updateData.nombre ?? usuariosObject["usuarios"][userIndex.Value].nombre,
                updateData.apellido1 ?? usuariosObject["usuarios"][userIndex.Value].apellido1,
                updateData.apellido2 ?? usuariosObject["usuarios"][userIndex.Value].apellido2,
                updateData.correo ?? usuariosObject["usuarios"][userIndex.Value].correo,
                updateData.contrasena ?? usuariosObject["usuarios"][userIndex.Value].contrasena,
                updateData.cedula ?? usuariosObject["usuarios"][userIndex.Value].cedula,
                updateData.fecha_nacimiento ?? usuariosObject["usuarios"][userIndex.Value].fecha_nacimiento,
                updateData.telefonos ?? usuariosObject["usuarios"][userIndex.Value].telefonos,
                updateData.direccion ?? usuariosObject["usuarios"][userIndex.Value].direccion,
                usuariosObject["usuarios"][userIndex.Value].Rol // Keeping the same role
            );

            // Write updated data back to JSON file
            var updatedJson = JsonSerializer.Serialize(usuariosObject);
            await File.WriteAllTextAsync(usuariosJsonPath, updatedJson);

            // Return success message
            context.Response.StatusCode = StatusCodes.Status200OK;
            await context.Response.WriteAsync("User account updated successfully");
        }
        else
        {
            // No user found with the specified ID
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsync($"User with ID {userId} not found");
        }
    }
    catch (Exception ex)
    {
        // Handle file read/write exceptions
        Console.WriteLine($"Error updating user account: {ex.Message}");
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync("Error updating user account");
    }
});

// Map a route to handle deleting user accounts
app.MapDelete("/delete/{userId}", async (HttpContext context) =>
{
    // Extract userId from route parameters
    if (!context.Request.RouteValues.TryGetValue("userId", out var userIdObj) || !int.TryParse(userIdObj?.ToString(), out var userId))
    {
        // userId not found or not a valid integer
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        await context.Response.WriteAsync("Invalid user ID");
        return;
    }

    // Access the JSON file to get the list of users
    var usuariosJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "usuarios.json");
    Console.WriteLine($"Usuarios JSON Path: {usuariosJsonPath}"); // Debugging output

    try
    {
        var usuariosJson = await File.ReadAllTextAsync(usuariosJsonPath);
        var usuariosObject = JsonSerializer.Deserialize<Dictionary<string, List<Usuario>>>(usuariosJson);

        // Find the index of the user with the specified ID
        var userIndex = usuariosObject?["usuarios"]?.FindIndex(u => u.id == userId);

        if (userIndex != null && userIndex >= 0)
        {
            // Remove the user from the list
            usuariosObject["usuarios"].RemoveAt(userIndex.Value);

            // Write updated data back to JSON file
            var updatedJson = JsonSerializer.Serialize(usuariosObject);
            await File.WriteAllTextAsync(usuariosJsonPath, updatedJson);

            // Return success message
            context.Response.StatusCode = StatusCodes.Status200OK;
            await context.Response.WriteAsync("User account deleted successfully");
        }
        else
        {
            // No user found with the specified ID
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsync($"User with ID {userId} not found");
        }
    }
    catch (Exception ex)
    {
        // Handle file read/write exceptions
        Console.WriteLine($"Error deleting user account: {ex.Message}");
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync("Error deleting user account");
    }
});


app.Run();

// Models login
record LoginInfo(string correo, string contrasena);
record Usuario(int id, string nombre, string apellido1, string apellido2, string correo, string contrasena, string cedula, string fecha_nacimiento, List<string> telefonos, Direccion direccion, string Rol);
// Models Registration
record RegistrationData(string nombre, string apellido1, string apellido2, string correo, string contrasena, string cedula, string fecha_nacimiento, List<string> telefonos, Direccion direccion);
public record Direccion(string? provincia = null, string? canton = null, string? distrito = null);
//Models Dishes
public record Dish(string nombre_plato, string descripcion, decimal precio, int calorias, string tipo, int id_plato, int duracionEstMin, int vendidos, int cantidad);
public record Menu(List<Dish> menu);
//Models Orders
public record OrderData(int id_cliente, List<Dish> platos);
public record Pedido(int id_pedido, int id_cliente, List<Dish> platos, DateTime fecha_hora, string estado);
public record Pedidos(List<Pedido> pedidos);
//Model Update
public record UpdateData(string nombre, string apellido1, string apellido2, string correo, string contrasena, string cedula, string fecha_nacimiento, List<string> telefonos, Direccion direccion);
